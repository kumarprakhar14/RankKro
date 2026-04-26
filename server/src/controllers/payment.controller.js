import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import mongoose from "mongoose";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { inngest } from "../inngest/index.js";

// @desc Create a Razorpay order
// @route POST /api/payments/create-order
// @access Private
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    // 1. Create the order on Razorpay
    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: `rcp_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    // 2. Persist the pending payment intent
    await Payment.create({
      orderId: order.id,
      amount,
      status: "PENDING",
      userId: req.user._id
    });

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to create order" });
  }
};

// @desc Verify a Razorpay payment signature
// @route POST /api/payments/verify-payment
// @access Private
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
       return res.status(400).json({ success: false, message: "Payment details missing" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("RAZORPAY_KEY_SECRET is not configured");
      return res.status(500).json({ success: false, message: "Payment verification unavailable" });
    }

    // 1. Verify the signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    
    // Use timing-safe comparison for signature verification.
    // Using !== for cryptographic signature comparison is vulnerable to timing attacks. 
    // An attacker could measure response times to gradually determine the correct signature.
    // crypto.timingSafeEqual compares two Buffers in constant time, preventing timing attacks.

    const signaturesMatch = generated_signature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(generated_signature, 'utf8'),
        Buffer.from(razorpay_signature, 'utf8')
      );

    if (!signaturesMatch) {
      // Mark as failed in DB if needed, or just reject
      await Payment.findOneAndUpdate({ orderId: razorpay_order_id }, { status: "FAILED" });
      return res.status(400).json({ success: false, message: "Invalid payment signature. Verification failed." });
    }

    // 2. Mark as Success in DB and upgrade user atomically
    const session = await mongoose.startSession();
    let payment;
    try {
      await session.withTransaction(async () => {
        payment = await Payment.findOneAndUpdate(
          { orderId: razorpay_order_id },
          { paymentId: razorpay_payment_id, signature: razorpay_signature, status: "SUCCESS" },
          { new: true, session }
        );
        if (!payment) {
          throw new Error("Payment metadata not found");
        }
        await User.findByIdAndUpdate(req.user._id, { plan: "PREMIUM" }, { session });
      });
    } finally {
      await session.endSession();
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment metadata not found in database." });
    }

    // 4. Fire Inngest background event to send subscription email
    await inngest.send({
        name: "user/subscription",
        data: {
            email: req.user.email,
            amount: payment.amount
        }
    }).catch(err => {
            console.error("Failed to send subscription email:", err);
        });

    return res.status(200).json({ 
        success: true, 
        message: "Payment verified and user upgraded successfully" 
    });

  } catch (error) {
    console.error("Razorpay Verify Payment Error:", error);
    res.status(500).json({ success: false, error: error.message || "Payment verification failed" });
  }
};


// @desc 

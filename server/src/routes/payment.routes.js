import express from "express";
import { createOrder, verifyPayment } from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All payment routes must be protected so only authenticated users can buy Premium
router.use(protect);

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);

export { router };

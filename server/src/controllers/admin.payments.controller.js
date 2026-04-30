/**
 * @desc Retrieve all the payments
 * @route GET /api/admin/payments
 * @access Admin
 */

import Payment from "../models/payment.model.js";

export const getPayments = async (req, res) => {
    try {
        const { paymentId, orderId, status, userId, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (paymentId) filter.paymentId = paymentId;
        if (orderId) filter.orderId = orderId;
        if (userId) filter.userId = userId;
        if (status) filter.status = status.toUpperCase();

        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(limit, 10) || 20;

        const MAX_LIMIT = 100;
        const safePage = Math.max(1, parsedPage);
        const safeLimit = Math.min(MAX_LIMIT, Math.max(1, parsedLimit));

        const skip = (safePage - 1) * safeLimit;

        const [payments, total] = await Promise.all([
            Payment.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(safeLimit)
                    .lean()
                    .populate({
                        path: 'userId',
                        select: ['_id', 'name', 'email']
                    }),
            Payment.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                payments: payments,
                pagination: {
                    page: safePage,
                    limit: safeLimit,
                    total,
                    totalPage: Math.ceil(total / safeLimit)
                }
            },
            message: "Payments retrieved successfully"
        })
    } catch (error) {
        console.error("Admin Get Payments Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to retrieve payments"
            }
        })
    }
}
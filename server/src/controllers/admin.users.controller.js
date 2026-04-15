import User from "../models/user.model.js";
import TestAttempt from "../models/test_attempt.model.js";
import mongoose from "mongoose";


/**
 * @desc    List all users with optional search & plan filter
 * @route   GET /api/admin/users
 * @query   search, plan, page, limit
 * @access  Admin
 */
export const listUsers = async (req, res) => {
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
        const { search, plan, page = 1, limit = 20 } = req.query;

        const filter = {};

        if (search) {
            const escapedSearch = escapeRegex(search);
            filter.$or = [
                { name: { $regex: new RegExp(escapedSearch, "i") } },
                { email: { $regex: new RegExp(escapedSearch, "i") } }
            ];
        }

        if (plan) {
            filter.plan = plan.toUpperCase();
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
            User.find(filter)
                .select("-refreshTokens -resetPasswordToken -resetPasswordExpiresAt")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            },
            message: "Users retrieved successfully"
        });

    } catch (error) {
        console.error("Admin List Users Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to retrieve users"
            }
        });
    }
};


/**
 * @desc    Get single user with their attempt history
 * @route   GET /api/admin/users/:userId
 * @access  Admin
 */
export const getUserDetail = async (req, res) => {
    try {
        let { userId } = req.params;
        userId = new mongoose.Types.ObjectId(userId);

        const user = await User.findById(userId)
            .select("-refreshTokens -resetPasswordToken -resetPasswordExpiresAt");

        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "USER_NOT_FOUND",
                    message: "User not found"
                }
            });
        }

        // Fetch user's attempt history
        const attempts = await TestAttempt.find({ user_id: userId })
            .populate({
                path: "test_id",
                select: "title exam_type difficulty"
            })
            .sort({ createdAt: -1 })
            .limit(50);

        // Performance stats
        const submittedAttempts = attempts.filter(a => a.status === "SUBMITTED");
        const totalAttempts = submittedAttempts.length;
        let averageScore = 0;
        let bestScore = 0;

        if (totalAttempts > 0) {
            const scores = submittedAttempts.map(a => a.final_score);
            averageScore = parseFloat((scores.reduce((sum, s) => sum + s, 0) / totalAttempts).toFixed(2));
            bestScore = Math.max(...scores);
        }

        return res.status(200).json({
            success: true,
            data: {
                user,
                attempts,
                stats: { totalAttempts, averageScore, bestScore }
            },
            message: "User detail retrieved successfully"
        });

    } catch (error) {
        console.error("Admin Get User Detail Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to retrieve user detail"
            }
        });
    }
};


/**
 * @desc    Upgrade or downgrade a user's plan
 * @route   PATCH /api/admin/users/:userId/plan
 * @body    { plan: "FREE" | "PREMIUM" }
 * @access  Admin
 */
export const updateUserPlan = async (req, res) => {
    try {
        const { userId } = req.params;
        const { plan } = req.body;

        if (!plan || !["FREE", "PREMIUM"].includes(plan.toUpperCase())) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Plan must be either 'FREE' or 'PREMIUM'"
                }
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { plan: plan.toUpperCase() },
            { new: true }
        ).select("-refreshTokens -resetPasswordToken -resetPasswordExpiresAt");

        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "USER_NOT_FOUND",
                    message: "User not found"
                }
            });
        }

        console.log(`Admin updated user ${userId} plan to ${plan.toUpperCase()}`);

        return res.status(200).json({
            success: true,
            data: { user },
            message: `User plan updated to ${plan.toUpperCase()}`
        });

    } catch (error) {
        console.error("Admin Update User Plan Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to update user plan"
            }
        });
    }
};

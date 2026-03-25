import TestAttempt from "../models/test_attempt.model.js";


/**
 * @desc    Get user's attempt history with performance stats
 * @route   GET /api/user/attempts
 * @access  Protected
 */
export const getUserAttempts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // ============================================
        // 1. FETCH ATTEMPTS WITH PAGINATION
        // ============================================
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [attempts, total] = await Promise.all([
            TestAttempt.find({ user_id: req.user._id })
                .populate({
                    path: "test_id",
                    select: "title exam_type difficulty status duration_minutes"
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            TestAttempt.countDocuments({ user_id: req.user._id })
        ]);

        // ============================================
        // 2. CALCULATE AGGREGATE STATS
        // ============================================
        const submittedAttempts = await TestAttempt.find({
            user_id: req.user._id,
            status: "SUBMITTED"
        }).select("final_score");

        const totalAttempts = submittedAttempts.length;
        let averageScore = 0;
        let bestScore = 0;

        if (totalAttempts > 0) {
            const scores = submittedAttempts.map(a => a.final_score);
            averageScore = parseFloat((scores.reduce((sum, s) => sum + s, 0) / totalAttempts).toFixed(2));
            bestScore = Math.max(...scores);
        }

        // ============================================
        // 3. RETURN RESPONSE
        // ============================================
        return res.status(200).json({
            success: true,
            data: {
                attempts,
                stats: {
                    totalAttempts,
                    averageScore,
                    bestScore
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            },
            message: "Attempt history retrieved successfully"
        });

    } catch (error) {
        console.error("Get User Attempts Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to retrieve attempt history"
            }
        });
    }
};

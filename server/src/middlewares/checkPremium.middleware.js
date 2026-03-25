import Test from "../models/test.model.js";

/**
 * @desc Middleware to guard premium test access
 * 
 * Loads the test by :id param, checks if the test is PREMIUM
 * and whether the user's plan allows access.
 * Attaches the loaded test to req.test for downstream handlers.
 */
export const checkPremium = async (req, res, next) => {
    try {
        const test = await Test.findById(req.params.id);

        if (!test) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "TEST_NOT_FOUND",
                    message: "Test not found"
                }
            });
        }

        // Block FREE-plan users from accessing PREMIUM tests
        if (test.status === "PREMIUM" && req.user.plan !== "PREMIUM") {
            return res.status(403).json({
                success: false,
                error: {
                    code: "PREMIUM_REQUIRED",
                    message: "This test requires a premium subscription"
                }
            });
        }

        // Attach test to request so the controller doesn't need to re-fetch
        req.test = test;
        next();

    } catch (error) {
        console.error("Premium Check Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to verify test access"
            }
        });
    }
};

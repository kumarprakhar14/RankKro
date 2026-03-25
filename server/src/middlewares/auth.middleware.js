import { verifyAccessToken } from "../services/auth.service.js";
import User from "../models/user.model.js";

/**
 * @desc Middleware to protect routes - verifies JWT access token
 * 
 * Expects: Authorization: Bearer <token> header
 * Sets: req.user (full user object without password)
 */
export const protect = async (req, res, next) => {
    try {
        // ============================================
        // 1. EXTRACT TOKEN FROM HEADER
        // ============================================
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "TOKEN_MISSING",
                    message: "Access token is required. Please login."
                }
            });
        }

        const token = authHeader.split(" ")[1];

        // ============================================
        // 2. VERIFY TOKEN
        // ============================================
        let payload;
        try {
            payload = verifyAccessToken(token);
        } catch (err) {
            const message = err.name === "TokenExpiredError"
                ? "Access token has expired"
                : "Invalid access token";

            return res.status(401).json({
                success: false,
                error: {
                    code: "TOKEN_INVALID",
                    message
                }
            });
        }

        // ============================================
        // 3. FIND USER & ATTACH TO REQUEST
        // ============================================
        const user = await User.findById(payload.id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "USER_NOT_FOUND",
                    message: "User not found or account deactivated"
                }
            });
        }

        // Attach user to request object for downstream handlers
        req.user = user;
        console.log("User authenticated:\n", req.user);
        
        next();

    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Authentication failed"
            }
        });
    }
};

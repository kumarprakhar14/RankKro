/**
 * @desc Middleware to restrict access to admin users only
 * 
 * Must be used AFTER the `protect` middleware (which sets req.user).
 * Checks req.user.role === "ADMIN" → 403 if not.
 */
export const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            error: {
                code: "ADMIN_REQUIRED",
                message: "Access denied. Admin privileges required."
            }
        });
    }
    
    next();
};

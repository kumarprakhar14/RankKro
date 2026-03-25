import { Router } from "express";
import { router as authRoutes } from "./auth.routes.js"
import { router as testRoutes } from "./test.routes.js";
import { router as userRoutes } from "./user.routes.js";
import { router as adminRoutes } from "./admin.routes.js";
import { router as paymentRoutes } from "./payment.routes.js";
import { protect } from "../middlewares/auth.middleware.js";
import { sanitizeUser } from "../validations/authValidations.js";

const router = Router();

// Test route 
router.get("/", (req, res) => {
    res.json({ message: "Welcome to the API 🚀" });
});

// Public routes
// Mount auth routes
router.use("/auth", authRoutes);

// Protected routes (require valid access token)
// Get current user profile
router.get("/me", protect, (req, res) => {
    return res.status(200).json({
        success: true,
        data: sanitizeUser(req.user),
        message: "User profile retrieved"
    });
});

// Mount test routes → /api/tests/*
router.use("/tests", testRoutes);

// Mount user routes → /api/user/*
router.use("/user", userRoutes);

// Mount admin routes → /api/admin/*
router.use("/admin", adminRoutes);

// Mount payment routes → /api/payments/*
router.use("/payments", paymentRoutes);


export { router };
import { Router } from "express";
import { router as authRoutes } from "./auth.routes.js"

const router = Router();

// Test route 
router.get("/", (req, res) => {
    res.json({ message: "Welcome to the API 🚀" });
});

// Public routes
// Mount auth routes
router.use("/auth", authRoutes);

// Protected rotues
// Mount product routes


export { router };
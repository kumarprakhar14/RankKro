import express from "express";
import { getUserAttempts } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All user routes require authentication
router.use(protect);

// GET /api/user/attempts — User's attempt history and performance
router.get("/attempts", getUserAttempts);

export { router };

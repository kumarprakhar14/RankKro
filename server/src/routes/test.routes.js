import express from "express";
import { listTests, startTest, submitTest, getResult } from "../controllers/test.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { checkPremium } from "../middlewares/checkPremium.middleware.js";

const router = express.Router();

// GET /api/tests — List all tests with optional filters
router.get("/", listTests);  // public route

// All other test routes require authentication
router.use(protect);

// POST /api/tests/:id/start — Start exam session (premium guard)
router.post("/:id/start", checkPremium, startTest);

// POST /api/tests/:id/submit — Submit answers
router.post("/:id/submit", submitTest);

// GET /api/tests/:id/result/:attemptId — Fetch full result
router.get("/:id/result/:attemptId", getResult);

export { router };

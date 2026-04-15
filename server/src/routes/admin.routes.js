import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

// User management
import { listUsers, getUserDetail, updateUserPlan } from "../controllers/admin.users.controller.js";

// Question management
import { listQuestions, createQuestion, updateQuestion } from "../controllers/admin.questions.controller.js";

// Test management + analytics
import {
    listTests, createTest, updateTest, getTestDetail,
    assignQuestions, getAnalytics
} from "../controllers/admin.tests.controller.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect);
router.use(requireAdmin);

// ============================================
// USER MANAGEMENT
// ============================================
router.get("/users", listUsers);
router.get("/users/:userId", getUserDetail);
router.patch("/users/:userId/plan", updateUserPlan);

// ============================================
// QUESTION MANAGEMENT
// ============================================
router.get("/questions", listQuestions);
router.post("/questions", createQuestion);
router.patch("/questions/:questionId", updateQuestion);

// ============================================
// TEST MANAGEMENT
// ============================================
router.get("/tests", listTests);
router.post("/tests", createTest);
router.get("/tests/:testId", getTestDetail);
router.patch("/tests/:testId", updateTest);
router.post("/tests/:testId/sections/:sectionId/questions", assignQuestions);

// ============================================
// ANALYTICS
// ============================================
router.get("/analytics", getAnalytics);

export { router };

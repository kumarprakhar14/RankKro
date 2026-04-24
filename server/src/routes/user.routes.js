import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
    // Group 2 — Data Fetching
    getUserAttempts,
    getAttemptById,
    getTransactions,
    getSubscription,
    // Group 1 — Self-Service
    getProfile,
    updateProfile,
    changeEmail,
    changePassword,
    uploadAvatar,
    deleteAccount,
} from "../controllers/user.controller.js";

const router = express.Router();

// All user routes require a valid access token
router.use(protect);

// ============================================================
// GROUP 2 — READ-ONLY DATA FETCHING
// ============================================================

// GET /api/user/attempts          — paginated attempt history (offset)
// NOTE: future upgrade to cursor-based pagination (?cursor=<attemptId>&limit=20)
// is a BREAKING CHANGE for frontend consumers that read `pagination.page`.
// Coordinate with the client-side API layer before migrating.
router.get("/attempts", getUserAttempts);

// GET /api/user/attempts/:attemptId  — single attempt detail (for "review later")
router.get("/attempts/:attemptId", getAttemptById);

// GET /api/user/transactions      — payment/subscription audit log (cursor-paginated)
router.get("/transactions", getTransactions);

// GET /api/user/subscription      — current plan status
router.get("/subscription", getSubscription);


// ============================================================
// GROUP 1 — USER SELF-SERVICE (profile & account mutations)
// ============================================================

// GET    /api/user/profile  — fetch own profile
// PATCH  /api/user/profile  — update name / phone (non-sensitive)
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

// PATCH  /api/user/email    — change email (requires current password)
router.patch("/email", changeEmail);

// PATCH  /api/user/password — change password (requires currentPassword + newPassword)
//                             invalidates all existing refresh tokens on success
router.patch("/password", changePassword);

// POST   /api/user/avatar   — upload profile picture (multipart/form-data)
// TODO: Placeholder — awaiting cloud storage integration (Cloudinary/S3/etc.)
router.post("/avatar", uploadAvatar);

// DELETE /api/user/account  — soft-delete / deactivate account (GDPR)
router.delete("/account", deleteAccount);

export { router };

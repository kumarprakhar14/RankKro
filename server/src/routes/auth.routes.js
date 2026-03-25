import express from "express";
import { login, logout, refreshToken, register, forgotPassword, validateResetToken, resetPassword } from "../controllers/auth.controller.js";
import passport from "passport";

const router = express.Router();

// Auth endpoints
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);

// Password Reset endpoints
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", validateResetToken);
router.post("/reset-password/:token", resetPassword);

export { router };
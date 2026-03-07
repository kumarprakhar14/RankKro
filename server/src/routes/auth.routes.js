import express from "express";
import { login, logout, refreshToken, register } from "../controllers/auth.controller.js";
import passport from "passport";

const router = express.Router();

// Auth endpoints
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);

export { router };
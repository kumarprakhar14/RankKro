import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan"; // for request logging
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import passport from "passport";
import { router as apiRouter } from "../src/routes/index.routes.js"
import cronJob from "./utils/cron.js";
// import "./services/passport.js";
import { serve } from "inngest/express";
import { inngest } from "./inngest/index.js";
import { onUserSignup } from "./inngest/functions/on-signup.js";
import { onUserForgotPassword } from "./inngest/functions/on-forgot-password.js";
import { onUserPasswordChange } from "./inngest/functions/on-password-change.js";
import { onUserSubscription } from "./inngest/functions/on-subscription.js";


const app = express();

if (process.env.NODE_ENV==="production") {
    cronJob.start();
}

// Middleware
app.use(helmet());  // security headers
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());  // parse JSON body
app.use(express.urlencoded({ extended: true }));  // parse from data
app.use(morgan("dev"));  // logs requests (GET /api 200 - 15ms)

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days
    keys: [process.env.COOKIE_KEY]
  })
)

app.use(passport.initialize());
app.use(passport.session())

// Set up the "/api/inngest" routes with the serve handler
app.use("/api/inngest", serve({
  client: inngest,
  functions: [onUserSignup, onUserForgotPassword, onUserPasswordChange, onUserSubscription]
})
);

// Healt check route
// Basically, checks if the API(app) is up and running.
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is healthy" });
});

// Inngest test route

// API routes
app.use("/api", apiRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error handler:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

export { app };

// helmet() → protects against common HTTP header attacks.

// cors() → allows frontend apps (React, Next.js, etc.) to talk to this API.

// express.json() & express.urlencoded() → parses incoming request bodies.

// morgan("dev") → nice request logs in the console.

// /health → quick route to check if server is alive (handy in deployment).
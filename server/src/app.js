import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan"; // for request logging
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import passport from "passport";
// import "./services/passport.js";


const app = express();

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

// Healt check route
// Basically, checks if the API(app) is up and running.
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is healthy" });
});

// API routes
// app.use("/api", apiRouter);

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
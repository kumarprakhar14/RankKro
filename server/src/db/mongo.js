import mongoose from "mongoose";
import { config } from "../config/env.js";

/**
 * Simple exponential-backoff retry helper.
 * Waits 'ms' milliseconds.
 */
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * connectDB - connects to MongoDB with retries and logs.
 * 
 * Retries up to `maxRetries` times with exponential backoff.
 */

export async function connectDB({
    mongoUri = config.mongoUri,
    maxRetries = 5,
    initialDelayMs = 500,
} = {}) {
    // Mongoose recommended options
    const mongooseOptions = {
        // useNewUrlParser, useUnifiedTopology are default true
        // in modern mongoose,
        // but we set some sensible defaults for clarity.
        autoIndex: false, // turn off in production(auto-indexing is kept 'on' in production); set true for dev if need indexes created automatically
        maxPoolSize: 10, // connection pool size
        serverSelectionTimeoutMS: 5000, // keep trying to send operations for 5s
        socketTimeoutMS: 45000
    };

    let attempt = 0;
    let delay = initialDelayMs;

    while (attempt <= maxRetries) {
        try {
            attempt += 1;
            console.log(`🔌MongoDB: connecting (attempt ${attempt})...`);
            await mongoose.connect(mongoUri, mongooseOptions);
            console.log("✅ MongoDB connected.");
            // Attach event listeners once again
            mongoose.connection.on("error", (err) => {
                console.error("MongoDB connection error: ", err);
            });
            mongoose.connection.on("disconnected", () => {
                console.warn(" ⚠️ MongoDB disconnected.");
            });
            mongoose.connection.on("reconnected", () => {
                console.log("🔁 MongoDB reconnected.");
            });
            return; // success
        } catch (err) {
            console.error(`MongoDB connect attempt ${attempt} failed: `, err.message || err);
            if (attempt > maxRetries) {
                console.error("❌ Exceeded max MongoDB connection attempts. Giving up.");
                throw err;
            }
            console.log(`⌛ Retrying MongoDB connection in ${delay}ms...`);
            await wait(delay);
            delay *= 2; // exponential backoff
        }
    }
}

/**
 * disconnectDB - gracefully close mongoose connection
 */
export async function disconnectDB() {
    try {
        await mongoose.connection.close(true);
        console.log("🔴 MongoDB connection closed.");
    } catch (err) {
        console.error("Error while closing MongoDB connection:", err);

    }
}
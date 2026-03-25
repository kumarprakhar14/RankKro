import dotenv from "dotenv";

// load .env file
dotenv.config();

// helper to throw error if a required variable is missing
function requireEnv(key, defaultValue) {
    const value = process.env[key] || defaultValue;
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${ key }`);
    }
    return value;
}

// export config object
// Enforces some default value exists for every env variable,
// if not requireEnv() throws an error

export const config = {
    port: requireEnv("PORT", 4000),
    mongoUri: requireEnv("MONGO_URI"),
    accessTokenSecret: requireEnv("ACCESS_TOKEN_SECRET"),
    refreshTokenSecret: requireEnv("REFRESH_TOKEN_SECRET"),
    
    corsOrigin: requireEnv("CORS_ORIGIN", "http://localhost:5173"),
    redirectUrl: requireEnv("REDIRECT_URL", "http://localhost:5173"),
};
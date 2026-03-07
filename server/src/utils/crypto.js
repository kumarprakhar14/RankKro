import argon2 from "argon2";
import crypto from "crypto";

// Hash password
export const hashify = async (plainText) => {
    try {
        return await argon2.hash(plainText);
    } catch (err) {
        throw new Error("Error hashing password: " + err.message);
    }
};

// verify password
export const verifyHash = async (plainText, hashedText) => {
    try {
        return await argon2.verify(hashedText, plainText);
    } catch (err) {
        throw new Error("Error verifying password: " + err.message);
    }
}

// generate unique reset token
// randomBytes() acts as asychronous function when a callback is 
// passed as second argument
// But, acts as synchronous function when no callback is passed
// as second argument
export const generateResetToken = () => {
    try {
        return crypto.randomBytes(32).toString("hex");
    } catch (error) {
        throw new Error("Error generating reset token: " + error.message);
    }
}
// argon2 is not-deterministic -> uses random salt every time
// so, same text hashed on different times will give different results
// thus, it can't be used for reset tokens

// Hash reset token using SHA-256 (deterministic)
// Use this for reset tokens, NOT argon2, because we need to be able to 
// hash the same token again and get the same result for comparison

export const hashResetToken = (token) => {
    try {
        return crypto.createHash("sha256").update(token).digest("hex");
    } catch (error) {
        throw new Error("Error hashing reset token: " + error.message);
    }
}
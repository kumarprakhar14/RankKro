import User from "../models/user.model.js";
import argon2 from "argon2";
import { hashify, generateResetToken, hashResetToken } from "../utils/crypto.js";
import { generateAcessToken, generateRefreshToken, verifyRefreshToken } from "../services/auth.service.js";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, validateRequest, sanitizeUser } from "../validations/authValidations.js";
import { setRefreshTokenCookie } from "../utils/setCookies.js"
import { inngest } from "../inngest/index.js";


/**
 * @desc Register new user
 * @route POST /api/auth/register
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next middleware
 */
export const register = async (req, res, next) => {
    const reqId = req.headers['x-request-id'] || Math.random().toString(36).substring(2, 10);
    try {
        // ============================================
        // 1. VALIDATE REQUEST BODY
        // ============================================
        const validation = validateRequest(registerSchema, req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Validation failed",
                    fields: validation.errors
                }
            });
        }

        const { email, password, name, phone } = validation.data;

        // ============================================
        // 2. CHECK FOR DUPLICATE EMAIL
        // ============================================
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.warn(`[ReqID: ${reqId}] Registration attempt failed: Email already exists`);
            return res.status(409).json({
                success: false,
                error: {
                    code: "REGISTRATION_FAILED",
                    message: "Email already exists."
                }
            });
        }

        // ============================================
        // 3. CREATE USER
        // ============================================
        const newUser = new User({
            name,
            email,
            phone,
            password, // Will be hashed by pre-save hook
            role: "USER",
            plan: "FREE",
            isActive: true
        });

        await newUser.save();

        // ============================================
        // 4. LOG EVENT & FIRE WEBHOOK
        // ============================================
        console.log(`[ReqID: ${reqId}] User registration successful`);

        // Send welcome email
        await inngest.send({
            name: "user/signup",
            data: {
                email: newUser.email,
                name: newUser.name
            },
        });

        // ============================================
        // 5. RETURN RESPONSE
        // ============================================
        return res.status(201).json({
            success: true,
            data: sanitizeUser(newUser),
            message: "User registered successfully"
        });

    } catch (error) {
        console.error("Registration Error:", error.message);
        console.error("Additional details:", {
            name: error.name,
            stack: error.stack
        });

        // Handle MongoDB duplicate key error (race condition)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: {
                    code: "REGISTRATION_FAILED",
                    message: "Registration failed. Please check your information and try again."
                }
            });
        }

        // Other database or validation errors
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "An error occurred during registration. Please try again later."
            }
        });
    }
};

/**
 * @desc Login user - authenticate and issue tokens
 * @route POST /api/auth/login
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next middleware
 */
export const login = async (req, res, next) => {
    const reqId = req.headers['x-request-id'] || Math.random().toString(36).substring(2, 10);
    try {
        // ============================================
        // 1. VALIDATE REQUEST BODY
        // ============================================
        const validation = validateRequest(loginSchema, req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Validation failed",
                    fields: validation.errors
                }
            });
        }

        const { email, password } = validation.data;

        // ============================================
        // 2. FETCH USER BY EMAIL
        // ============================================
        const user = await User.findOne({ email }).select("+password");

        if (!user || !user.isActive) {
            // Constant-time response (same logic as wrong password)
            // Generic message to prevent user enumeration
            return res.status(401).json({
                success: false,
                error: {
                    code: "AUTHENTICATION_FAILED",
                    message: "Invalid email or password"
                }
            });
        }

        // ============================================
        // 3. COMPARE PASSWORD (constant-time)
        // ============================================
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            // Log failed attempt (no PII)
            console.warn(`[ReqID: ${reqId}] Failed login attempt: Invalid credentials`);
            return res.status(401).json({
                success: false,
                error: {
                    code: "AUTHENTICATION_FAILED",
                    message: "Invalid email or password"
                }
            });
        }

        // ============================================
        // 4. GENERATE TOKENS
        // ============================================
        const accessToken = generateAcessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // ============================================
        // 5. HASH & STORE REFRESH TOKEN IN DB
        // ============================================
        const hashedRefreshToken = await hashify(refreshToken);
        user.refreshTokens.push(hashedRefreshToken);
        await user.save();

        // ============================================
        // 6. SET REFRESH TOKEN COOKIE
        // ============================================
        setRefreshTokenCookie(res, refreshToken);

        // ============================================
        // 7. SET AUTHORIZATION HEADER
        // ============================================
        res.set({ "Authorization": `Bearer ${accessToken}` });

        // ============================================
        // 8. LOG EVENT
        // ============================================
        console.log(`[ReqID: ${reqId}] User login successful`);

        // ============================================
        // 9. RETURN RESPONSE
        // ============================================
        return res.status(200).json({
            success: true,
            data: {
                accessToken,
                user: sanitizeUser(user)
            },
            message: "Login successful"
        });

    } catch (error) {
        console.error("Login Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "An error occurred during login. Please try again later."
            }
        });
    }
}

/**
 * @desc Logout user - invalidate refresh token and clear cookie
 * @route POST /api/auth/logout
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next middleware
 */
export const logout = async (req, res, next) => {
    const reqId = req.headers['x-request-id'] || Math.random().toString(36).substring(2, 10);
    try {
        // ============================================
        // 1. READ REFRESH TOKEN FROM COOKIE
        // ============================================
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            // No token = already logged out, still clear cookie to be safe
            res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/" });
            return res.status(200).json({
                success: true,
                message: "Logged out successfully"
            });
        }

        // ============================================
        // 2. VERIFY TOKEN & FIND USER
        // ============================================
        let payload;
        try {
            payload = verifyRefreshToken(refreshToken);
        } catch (err) {
            // Token is invalid/expired — clear cookie anyway
            res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/" });
            return res.status(200).json({
                success: true,
                message: "Logged out successfully"
            });
        }

        const user = await User.findById(payload.id);

        if (user) {
            // ============================================
            // 3. REMOVE THIS REFRESH TOKEN FROM DB
            // ============================================
            // Tokens are hashed with argon2 (non-deterministic),
            // so we need to verify each stored hash against the plain token
            const updatedTokens = [];
            for (const storedHash of user.refreshTokens) {
                const isMatch = await argon2.verify(storedHash, refreshToken);
                if (!isMatch) {
                    updatedTokens.push(storedHash); // keep tokens that don't match
                }
            }
            user.refreshTokens = updatedTokens;
            await user.save();
        }

        // ============================================
        // 4. CLEAR REFRESH TOKEN COOKIE
        // ============================================
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/"
        });

        // ============================================
        // 5. LOG EVENT & RETURN RESPONSE
        // ============================================
        console.log(`[ReqID: ${reqId}] User logout successful`);

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error("Logout Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "An error occurred during logout. Please try again later."
            }
        });
    }
}


// @desc Google OAuth 2.0
// @route GET /api/auth/google-login
// export const googleLogin = async (req, res) => {
//     try {
//         const code = req.query.code;
//         if (!code) {
//             return res.status(400).json({ message: "Code is required" });
//         }

//         // Exchange code for tokens
//         const { tokens } = await googleClient.getToken({
//             code,
//             redirect_uri: process.env.REDIRECT_URL,
//         });
//         googleClient.setCredentials(tokens);

//         // Use access token to get user profile
//         const userRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
//             headers: {
//                 Authorization: `Bearer ${tokens.access_token}`,
//             },
//         });

//         const { email, name, picture } = userRes.data;

//         // Find or create user in db
//         let user = await User.findOne({ email });
//         if (!user) {
//             // new user -> create user
//             user = await User.create({ email, name, image: picture });

//             // Fire inngest event
//             await inngest.send({
//                 name: "user/signup",
//                 data: {
//                     email,
//                 },
//             });
//         }

//         // Generate tokens
//         const accessToken = generateAcessToken(user._id);
//         const refeshToken = generateRefreshToken(user._id);

//         // Hash the refresh token before saving
//         const hashedRefreshToken = await hashify(refeshToken);

//         // we will implement hashing logic for refresh token
//         user.refreshTokens.push(hashedRefreshToken);
//         await user.save();

//         // Send plain refresh token as HttpOnly Cookie, not the hashed one
//         res.cookie("refreshToken", refeshToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production",
//             sameSite: "none",
//             maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in miliseconds
//         });

//         // Set authorization header
//         await res.set({ 'authorization': `Bearer ${accessToken}` });

//         return res.status(200).json({
//             message: "success",
//             accessToken,
//             userInfo: {
//                 _id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 image: user.image,
//             }
//         })

//     } catch (error) {
//         console.error("Google Login Error", error);
//         return res.status(500).json({ message: "Server Error" });
//     }
// }


/**
 * @desc Get a new access token using refresh token
 * @route POST /api/auth/refresh
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next middleware
 */
export const refreshToken = async (req, res, next) => {
    try {
        // ============================================
        // 1. READ REFRESH TOKEN FROM COOKIE
        // ============================================
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "TOKEN_MISSING",
                    message: "Refresh token missing"
                }
            });
        }

        // ============================================
        // 2. VERIFY JWT SIGNATURE & EXPIRY
        // ============================================
        let payload;
        try {
            payload = verifyRefreshToken(refreshToken);
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "TOKEN_INVALID",
                    message: "Refresh token is invalid or expired"
                }
            });
        }

        // ============================================
        // 3. FIND USER & CHECK ACTIVE STATUS
        // ============================================
        const user = await User.findById(payload.id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "AUTHENTICATION_FAILED",
                    message: "User not found or account deactivated"
                }
            });
        }

        // ============================================
        // 4. VALIDATE TOKEN EXISTS IN DB
        // ============================================
        // Verify that this refresh token is still stored (not revoked via logout)
        let tokenFound = false;
        for (const storedHash of user.refreshTokens) {
            const isMatch = await argon2.verify(storedHash, refreshToken);
            if (isMatch) {
                tokenFound = true;
                break;
            }
        }

        if (!tokenFound) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "TOKEN_REVOKED",
                    message: "Refresh token has been revoked"
                }
            });
        }

        // ============================================
        // 5. ISSUE NEW ACCESS TOKEN (consistent with login)
        // ============================================
        const newAccessToken = generateAcessToken(user._id);

        // ============================================
        // 6. RETURN RESPONSE (same shape as login)
        // ============================================
        return res.status(200).json({
            success: true,
            data: {
                accessToken: newAccessToken,
                user: sanitizeUser(user)
            },
            message: "New access token issued"
        });

    } catch (error) {
        console.error("Refresh Token Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "An error occurred while refreshing token. Please try again later."
            }
        });
    }
}


// @desc Forgot Password -> send reset link to email
// @route /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
    try {
        const validation = validateRequest(forgotPasswordSchema, req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Validation failed",
                    fields: validation.errors
                }
            });
        }

        const { email } = validation.data;

        // find user by email
        const user = await User.findOne({ email });

        if (!user) {
            // Don't rever if user exists or not
            return res.status(200).json({
                message: "If an account exists, a reset link has been sent to your email."
            });
        }

        // Generate reset token
        const resetToken = generateResetToken();

        // Hash the reset token before saving to db
        const hashedToken = hashResetToken(resetToken);

        // save the hashed token and expiry to db
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000;  // 1 hour (in milliseconds)
        await user.save();

        // create reset url with unhashed token
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;


        // fire inngest event to send mail
        await inngest.send({
            name: "user/forgot-password",
            data: {
                email,
                url: resetUrl
            },
        });

        res.status(200).json({
            message: "If an account exists, a reset link has been sent to your email."
        });

    } catch (error) {
        console.error("Forgot password error: ", error);
        res.status(500).json({ message: "Server error" })

    }
}

// @desc Validate reset token (or, reset URL) -> get request
// @route GET /api/auth/validate-reset-token/:token
export const validateResetToken = async (req, res, next) => {
    try {
        const { token } = req.params;


        // Hash the token from url to compare with stored hash
        const hashedToken = hashResetToken(token);


        // Find user with valid token and not expired
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpiresAt: { $gt: Date.now() }
        });
        console.log("User: ", user);

        if (!user) {
            return res.status(400).json({
                valid: false,
                message: "Invalid or expired reset url"
            });
        }

        // Token is valid
        res.status(200).json({
            valid: true,
            message: "Token is valid",
            email: user.email  // Send email to client pre-filled
        })
    } catch (error) {
        console.error("Validate reset token error: ", error);
        res.status(500).json({ message: "Server error" });

    }
}


// @desc Reset Password -> update password in db
// @route /api/auth/reset-password/:token
export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;

        const validation = validateRequest(resetPasswordSchema, req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Validation failed",
                    fields: validation.errors
                }
            });
        }

        const { newPassword } = validation.data;

        if (!token) {
            return res.status(400).json({ message: "Reset token missing in URL" });
        }

        // Hash the token from url to compare with stored hash
        const hashedToken = hashResetToken(token);

        // find user with valid token and not expired
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpiresAt: { $gt: Date.now() }  // Check if token hasn't expired
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        // Update the password and clear reset fields
        user.password = newPassword;  // simply assign plain text password -> model's pre-save hook hashes it
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        // Send confirmation mail
        // Fire inngest event
        await inngest.send({
            name: "user/password-change",
            data: {
                email: user.email,
            },
        });

        res.status(200).json({
            message: "Password reset successful. You can now login with your new password."
        });

    } catch (error) {
        console.error("Reset password error: ", error);
        res.status(500).json({ message: "Server error" });
    }
}
import User from "../models/user.model.js";
import { hashify, verifyHash, generateResetToken, hashResetToken } from "../utils/crypto.js";
import { generateAcessToken, generateRefreshToken, verifyRefreshToken } from "../services/auth.service.js";
import mongoose from "mongoose";
import axios from "axios";
import { inngest } from "../inngest/index.js";
import { googleClient } from "../utils/googleClient.js"

// @desc Register new user
// @route POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        //check if user exists -> checking for unique email as well as unique username
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }

        // create user (password gets hashed by pre-save hook)
        const user = new User({ name, email, phone, password });
        await user.save();

        return res.status(201).json({
            message: "User registerd successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Register error", err);
        res.status(500).json({ message: "Server error" })
    }
};


// @desc Login user
// @route POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { name, password } = req.body;

        // find user -> allow flexible login with username as well as with email
        const user = await User.findOne({
            $or: [{ name }, { email: name }]
        }).select('+password');

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // verify password
        const isMatch = await verifyHash(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate tokens
        const accessToken = generateAcessToken(user._id);
        const refeshToken = generateRefreshToken(user._id);

        // Hash the refresh token before saving
        const hashedRefreshToken = await hashify(refeshToken);

        // we will implement hashing logic for refresh token
        user.refreshTokens.push(hashedRefreshToken);
        await user.save();

        // Send plain refresh token as HttpOnly Cookie, not the hashed one
        res.cookie("refreshToken", refeshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",  // accept cross-site cookies
            maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in miliseconds
        });

        // Set authorization header
        await res.set({ 'authorization': `Bearer ${accessToken}` });
        console.log(user);
        return res.status(200).json({
            message: "Login successful",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Login error", err);
        res.status(500).json({ message: "Server error" });

    }
}

// @desc Logout User
// @route /api/auth/logout
export const logout = async (req, res, next) => {
    try {
        res.removeHeader('Authorization');
        return res.status(200).json({ message: "Logout Successful" });
    } catch (err) {
        console.error("Logout Error", err);
        res.status(500).json({ message: "Server Error" });
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


// @desc get a new access token
// @route /api/auth/refresh
export const refreshToken = async (req, res, next) => {
    try {
        // read refresh token from cookie
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(403).json({ message: "Refresh token missing" });
        }

        // verify refresh token
        const payload = verifyRefreshToken(refreshToken);
        const userObj = await User.findById(payload.id)


        // issue new access token
        const newAccessToken = generateAcessToken({ userId: payload.id });

        if (!newAccessToken) {
            console.log("Couldn't not generate new access token");
        }

        // Set authorization header
        res.set({ 'authorization': `Bearer ${newAccessToken}` });

        return res.status(200).json({
            newAccessToken,
            message: "New access token issued",
            user: userObj
        });
    } catch (err) {
        next(err);
    }
}


// @desc Forgot Password -> send reset link to email
// @route /api/auth/forgot-password
// export const forgotPassword = async (req, res, next) => {
//     try {
//         const { email } = req.body;

//         // find user by email
//         const user = await User.findOne({ email });

//         if (!user) {
//             // Don't rever if user exists or not
//             return res.status(200).json({
//                 message: "If an account exists, a reset link has been sent to your email."
//             });
//         }

//         // Generate reset token
//         const resetToken = generateResetToken();

//         // Hash the reset token before saving to db
//         const hashedToken = hashResetToken(resetToken);

//         // save the hashed token and expiry to db
//         user.resetPasswordToken = hashedToken;
//         user.resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000;  // 1 hour (in milliseconds)
//         await user.save();

//         // create reset url with unhashed token
//         const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
//         console.log("Reset URL: ", resetUrl);


//         // fire inngest event to send mail
//         await inngest.send({
//             name: "user/forgot-password",
//             data: {
//                 email,
//                 url: resetUrl
//             },
//         });

//         res.status(200).json({
//             message: "If an account exists, a reset link has been sent to your email."
//         });

//     } catch (error) {
//         console.error("Forgot password error: ", error);
//         res.status(500).json({ message: "Server error" })

//     }
// }


// @desc Validate reset token (or, reset URL) -> get request
// @route GET /api/auth/validate-reset-token/:token
// export const validateResetToken = async (req, res, next) => {
//     try {
//         const { token } = req.params;
//         console.log("Token: ", token);


//         // Hash the token from url to compare with stored hash
//         const hashedToken = hashResetToken(token);
//         console.log("Hashed Token: ", hashedToken);


//         // Find user with valid token and not expired
//         const user = await User.findOne({
//             resetPasswordToken: hashedToken,
//             resetPasswordExpiresAt: { $gt: Date.now() }
//         });
//         console.log("User: ", user);

//         if (!user) {
//             return res.status(400).json({
//                 valid: false,
//                 message: "Invalid or expired reset url"
//             });
//         }

//         // Token is valid
//         res.status(200).json({
//             valid: true,
//             message: "Token is valid",
//             email: user.email  // Send email to client pre-filled
//         })
//     } catch (error) {
//         console.error("Validate reset token error: ", error);
//         res.status(500).json({ message: "Server error" });

//     }
// }


// @desc Reset Password -> update password in db
// @route /api/auth/reset-password/:token
// export const resetPassword = async (req, res, next) => {
//     try {
//         // const { token } = req.params;
//         const { email, newPassword } = req.body;

//         // Hash the token from url to compare with stored hash
//         // const hashedToken = await hashify(token);

//         // find user with valid token and not expired
//         // const user = await User.findOne({
//         //     resetPasswordToken: hashedToken,
//         //     resetPasswordExpiresAt: { $gt: Date.now() }  // Check if token hasn't expired
//         // });

//         // if(!user) {
//         //     return res.status(400).json({ message: "Invalid or expired reset url"});
//         // }

//         // Find the user based on email passed by client
//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(400).json({ message: "User not found" });
//         }

//         // Update the password and clear reset fields
//         user.password = newPassword;  // simply assign plain text password -> model's pre-save hook hashes it
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpiresAt = undefined;
//         await user.save();

//         // Send confirmation mail
//         // Fire inngest event
//         await inngest.send({
//             name: "user/password-change",
//             data: {
//                 email,
//             },
//         });

//         res.status(200).json({
//             message: "Password reset successful. You can now login with your new password."
//         });

//     } catch (error) {
//         console.error("Reset password error: ", error);
//         res.status(500).json({ message: "Server error" });


//     }
// }
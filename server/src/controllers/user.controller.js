import argon2 from "argon2";
import TestAttempt from "../models/test_attempt.model.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { sanitizeUser, validateRequest } from "../validations/authValidations.js";
import {
    updateProfileSchema,
    changeEmailSchema,
    changePasswordSchema,
} from "../validations/userValidations.js";


// ============================================================
// GROUP 2 — DATA FETCHING
// ============================================================

/**
 * @desc    Get user's attempt history with performance stats
 * @route   GET /api/user/attempts
 * @access  Protected
 *
 * NOTE — Pagination is currently offset-based (?page=&limit=).
 * Future upgrade: switch to cursor-based pagination (?cursor=<attemptId>&limit=20)
 * using _id-based comparison for O(1) seeks. This is a BREAKING CHANGE for any
 * frontend consumer that reads `pagination.page` — coordinate with the client-side
 * API layer before migrating.
 */
export const getUserAttempts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // ============================================
        // 1. FETCH ATTEMPTS WITH PAGINATION
        // ============================================
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [attempts, total] = await Promise.all([
            TestAttempt.find({ userId: req.user._id })
                .populate({
                    path: "testId",
                    select: "title examType difficulty status durationMinutes"
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            TestAttempt.countDocuments({ userId: req.user._id })
        ]);

        // ============================================
        // 2. CALCULATE AGGREGATE STATS
        // ============================================
        const submittedAttempts = await TestAttempt.find({
            userId: req.user._id,
            status: "SUBMITTED"
        }).select("finalScore");

        const totalAttempts = submittedAttempts.length;
        let averageScore = 0;
        let bestScore = 0;

        if (totalAttempts > 0) {
            const scores = submittedAttempts.map(a => a.finalScore);
            averageScore = parseFloat((scores.reduce((sum, s) => sum + s, 0) / totalAttempts).toFixed(2));
            bestScore = Math.max(...scores);
        }

        // ============================================
        // 3. RETURN RESPONSE
        // ============================================
        return res.status(200).json({
            success: true,
            data: {
                attempts,
                stats: {
                    totalAttempts,
                    averageScore,
                    bestScore
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            },
            message: "Attempt history retrieved successfully"
        });

    } catch (error) {
        console.error("Get User Attempts Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to retrieve attempt history"
            }
        });
    }
};

/**
 * @desc    Get a single attempt by ID (for "review later" deep-linking)
 * @route   GET /api/user/attempts/:attemptId
 * @access  Protected
 */
export const getAttemptById = async (req, res) => {
    try {
        const { attemptId } = req.params;

        const attempt = await TestAttempt.findOne({
            _id: attemptId,
            userId: req.user._id   // Scoped to the authenticated user — prevents IDOR
        }).populate({
            path: "testId",
            select: "title examType difficulty status durationMinutes"
        });

        if (!attempt) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Attempt not found"
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: { attempt },
            message: "Attempt retrieved successfully"
        });

    } catch (error) {
        console.error("Get Attempt By ID Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to retrieve attempt"
            }
        });
    }
};

/**
 * @desc    Get user's payment/subscription transaction history — cursor-paginated
 * @route   GET /api/user/transactions?cursor=<paymentId>&limit=20
 * @access  Protected
 *
 * Uses cursor-based pagination on _id (descending) — efficient for large datasets.
 * Response includes a `nextCursor` field; pass it as `?cursor=` in the next request.
 * Pass nothing (or omit cursor) to get the first page.
 */
export const getTransactions = async (req, res) => {
    try {
        const { cursor, limit = 20 } = req.query;
        const parsedLimit = Math.min(parseInt(limit) || 20, 100); // cap at 100

        // Build the filter — scope to user, and optionally paginate via cursor
        const filter = { userId: req.user._id };
        if (cursor) {
            filter._id = { $lt: cursor }; // fetch records older than the cursor
        }

        const transactions = await Payment.find(filter)
            .sort({ _id: -1 })
            .limit(parsedLimit + 1); // fetch one extra to determine if there's a next page

        const hasMore = transactions.length > parsedLimit;
        const page = hasMore ? transactions.slice(0, parsedLimit) : transactions;
        const nextCursor = hasMore ? page[page.length - 1]._id : null;

        return res.status(200).json({
            success: true,
            data: {
                transactions: page,
                pagination: {
                    nextCursor,
                    hasMore,
                    limit: parsedLimit
                }
            },
            message: "Transaction history retrieved successfully"
        });

    } catch (error) {
        console.error("Get Transactions Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to retrieve transaction history"
            }
        });
    }
};

/**
 * @desc    Get user's current subscription / plan status
 * @route   GET /api/user/subscription
 * @access  Protected
 *
 * Reads directly from req.user (already fetched by protect middleware) — no extra DB call.
 *
 * NOTE — Schema improvement possibilities for future:
 *   - `planExpiresAt: Date`   — expiry date for the PREMIUM plan
 *   - `autoRenewal: Boolean`  — auto-renewal flag
 *   - `planGrantedAt: Date`   — when the plan was last upgraded
 * These fields do not exist in user.model.js today. Add them here once the
 * payment/subscription lifecycle requires it.
 */
export const getSubscription = async (req, res) => {
    try {
        const { plan, isActive, createdAt } = req.user;

        return res.status(200).json({
            success: true,
            data: {
                plan,          // "FREE" | "PREMIUM"
                isActive,
                joinedAt: createdAt
            },
            message: "Subscription status retrieved successfully"
        });

    } catch (error) {
        console.error("Get Subscription Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to retrieve subscription status"
            }
        });
    }
};


// ============================================================
// GROUP 1 — USER SELF-SERVICE
// ============================================================

/**
 * @desc    Get own profile
 * @route   GET /api/user/profile
 * @access  Protected
 */
export const getProfile = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            data: sanitizeUser(req.user),
            message: "Profile retrieved successfully"
        });
    } catch (error) {
        console.error("Get Profile Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to retrieve profile"
            }
        });
    }
};

/**
 * @desc    Update non-sensitive profile fields (name, phone)
 * @route   PATCH /api/user/profile
 * @access  Protected
 */
export const updateProfile = async (req, res) => {
    try {
        // ============================================
        // 1. VALIDATE REQUEST BODY
        // ============================================
        const validation = validateRequest(updateProfileSchema, req.body);
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

        const { name, phone } = validation.data;

        // ============================================
        // 2. BUILD UPDATE OBJECT (only provided fields)
        // ============================================
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (phone !== undefined) updates.phone = phone;

        // ============================================
        // 3. PERSIST & RETURN
        // ============================================
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            data: sanitizeUser(updatedUser),
            message: "Profile updated successfully"
        });

    } catch (error) {
        console.error("Update Profile Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to update profile"
            }
        });
    }
};

/**
 * @desc    Change email address — requires current password confirmation
 * @route   PATCH /api/user/email
 * @access  Protected
 *
 * NOTE — Future scope: upgrade to a verify-first flow:
 *   1. Generate a signed token tied to the new email and store it on the user document
 *   2. Fire an inngest event to send a verification link to the NEW email
 *   3. On click-through, validate the token and only then commit the DB update
 * This mirrors the existing forgot-password / reset-password pattern and prevents
 * account hijacking via a typo or malicious email change. Requires new fields on
 * user.model.js (pendingEmail, emailVerifyToken, emailVerifyExpiresAt).
 */
export const changeEmail = async (req, res) => {
    try {
        // ============================================
        // 1. VALIDATE REQUEST BODY
        // ============================================
        const validation = validateRequest(changeEmailSchema, req.body);
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

        const { newEmail, currentPassword } = validation.data;

        // ============================================
        // 2. FETCH USER WITH PASSWORD (select: false by default)
        // ============================================
        const user = await User.findById(req.user._id).select("+password");

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
        // 3. VERIFY CURRENT PASSWORD
        // ============================================
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "AUTHENTICATION_FAILED",
                    message: "Incorrect current password"
                }
            });
        }

        // ============================================
        // 4. CHECK EMAIL NOT ALREADY TAKEN
        // ============================================
        const emailTaken = await User.findOne({ email: newEmail });
        if (emailTaken) {
            return res.status(409).json({
                success: false,
                error: {
                    code: "EMAIL_TAKEN",
                    message: "This email address is already in use"
                }
            });
        }

        // ============================================
        // 5. UPDATE EMAIL
        // ============================================
        user.email = newEmail;
        await user.save();

        return res.status(200).json({
            success: true,
            data: sanitizeUser(user),
            message: "Email updated successfully"
        });

    } catch (error) {
        console.error("Change Email Error:", error.message);

        // Handle MongoDB duplicate key race condition
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: {
                    code: "EMAIL_TAKEN",
                    message: "This email address is already in use"
                }
            });
        }

        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to update email"
            }
        });
    }
};

/**
 * @desc    Change password — requires currentPassword + newPassword
 * @route   PATCH /api/user/password
 * @access  Protected
 *
 * Security: all existing refresh tokens are purged on success, forcing
 * re-login on every other device (session invalidation).
 */
export const changePassword = async (req, res) => {
    try {
        // ============================================
        // 1. VALIDATE REQUEST BODY
        // ============================================
        const validation = validateRequest(changePasswordSchema, req.body);
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

        const { currentPassword, newPassword } = validation.data;

        // ============================================
        // 2. FETCH USER WITH PASSWORD
        // ============================================
        const user = await User.findById(req.user._id).select("+password");

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
        // 3. VERIFY CURRENT PASSWORD
        // ============================================
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "AUTHENTICATION_FAILED",
                    message: "Incorrect current password"
                }
            });
        }

        // ============================================
        // 4. REJECT IF NEW PASSWORD == CURRENT PASSWORD
        // ============================================
        const isSamePassword = await argon2.verify(user.password, newPassword);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "New password must be different from the current password"
                }
            });
        }

        // ============================================
        // 5. UPDATE PASSWORD & INVALIDATE ALL OTHER SESSIONS
        // ============================================
        // Assigning plain text — model's pre-save hook (argon2) hashes it automatically.
        user.password = newPassword;
        user.refreshTokens = []; // Force re-login on all other devices
        await user.save();

        // ============================================
        // 6. CLEAR THIS DEVICE'S REFRESH TOKEN COOKIE
        // ============================================
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/"
        });

        return res.status(200).json({
            success: true,
            message: "Password changed successfully. Please log in again."
        });

    } catch (error) {
        console.error("Change Password Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to change password"
            }
        });
    }
};

/**
 * @desc    Upload profile avatar image
 * @route   POST /api/user/avatar
 * @access  Protected
 *
 * TODO — Not yet implemented. Requires cloud storage integration:
 *   1. Add `multer` (or `busboy`) for multipart/form-data parsing
 *   2. Choose a storage backend: Cloudinary, AWS S3, or Backblaze B2
 *   3. Install the relevant SDK (e.g. `cloudinary`, `@aws-sdk/client-s3`)
 *   4. Upload the buffer/stream, get back a public URL
 *   5. Save the URL to `user.image` and return `sanitizeUser(user)`
 * The `user.image` field already exists on the schema — just needs population.
 */
export const uploadAvatar = async (req, res) => {
    return res.status(501).json({
        success: false,
        error: {
            code: "NOT_IMPLEMENTED",
            message: "Avatar upload is not yet implemented. Cloud storage integration is pending."
        }
    });
};

/**
 * @desc    Soft-delete / deactivate account (GDPR-compliant)
 * @route   DELETE /api/user/account
 * @access  Protected
 *
 * Sets isActive: false — the login guard in auth.middleware.js and the
 * refresh token handler in auth.controller.js both reject inactive users,
 * so the account is effectively locked without hard-deleting any data.
 * Refresh tokens are purged and the cookie is cleared immediately.
 */
export const deleteAccount = async (req, res) => {
    try {
        // ============================================
        // 1. DEACTIVATE ACCOUNT & WIPE SESSION TOKENS
        // ============================================
        await User.findByIdAndUpdate(req.user._id, {
            $set: {
                isActive: false,
                refreshTokens: [],
                resetPasswordToken: null,
                resetPasswordExpiresAt: null
            }
        });

        // ============================================
        // 2. CLEAR REFRESH TOKEN COOKIE
        // ============================================
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/"
        });

        return res.status(200).json({
            success: true,
            message: "Account deactivated successfully"
        });

    } catch (error) {
        console.error("Delete Account Error:", error.message);
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to deactivate account"
            }
        });
    }
};

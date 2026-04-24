import { z } from "zod";

// ============================================
// ZOD SCHEMAS — USER SELF-SERVICE ENDPOINTS
// ============================================

/**
 * Update profile request validation schema
 * Allows updating non-sensitive fields: name, phone
 * At least one field must be present.
 */
export const updateProfileSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Name cannot be empty")
            .max(100, "Name must be 100 characters or less")
            .optional(),

        phone: z
            .string()
            .optional()
            .refine(
                (val) =>
                    !val ||
                    /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val),
                "Invalid phone number format"
            ),
    })
    .refine((data) => data.name !== undefined || data.phone !== undefined, {
        message: "At least one field (name or phone) must be provided",
        path: ["_root"],
    });

/**
 * Change email request validation schema
 * Requires the current password to confirm identity before updating email.
 *
 * NOTE — Future scope: upgrade to a token-based verify-first flow:
 * send a verification link to the NEW email address; only commit the DB
 * update once the user clicks through. This requires a new inngest function
 * and temporary token fields on the user model (similar to resetPasswordToken).
 */
export const changeEmailSchema = z.object({
    newEmail: z
        .string({ error: "New email is required" })
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address")
        .max(255, "Email must be 255 characters or less"),

    currentPassword: z
        .string({ error: "Current password is required" })
        .min(1, "Current password is required"),
});

/**
 * Change password request validation schema
 * Requires both the current password (identity confirmation) and the new password.
 * New password follows the same strength rules as registration.
 */
export const changePasswordSchema = z.object({
    currentPassword: z
        .string({ error: "Current password is required" })
        .min(1, "Current password is required"),

    newPassword: z
        .string({ error: "New password is required" })
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/\d/, "Password must contain at least one digit")
        .regex(
            /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
            "Password must contain at least one special character"
        ),
});

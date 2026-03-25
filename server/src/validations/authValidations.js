import { z } from "zod";

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

/**
 * Register request validation schema
 * Validates: name, email, password, phone (optional)
 */
export const registerSchema = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .trim()
        .min(1, "Name cannot be empty")
        .max(100, "Name must be 100 characters or less"),

    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address")
        .max(255, "Email must be 255 characters or less"),

    password: z
        .string({ required_error: "Password is required" })
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/\d/, "Password must contain at least one digit")
        .regex(
            /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
            "Password must contain at least one special character"
        ),

    phone: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val),
            "Invalid phone number format"
        )
});

/**
 * Login request validation schema
 * Validates: email, password
 */
export const loginSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address"),

    password: z
        .string({ required_error: "Password is required" })
        .min(1, "Password is required")
});

// ============================================
// VALIDATION HELPER FUNCTION
// ============================================

/**
 * Parse and validate request body against a Zod schema
 * @param {object} schema - Zod schema to validate against
 * @param {object} data - Data to validate
 * @returns {{success: boolean, data?: object, errors?: object}}
 */
export const validateRequest = (schema, data) => {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const fieldErrors = {};
            
            // Safely extract all validation errors
            if (error.issues && Array.isArray(error.issues)) {
                error.issues.forEach((err) => {
                    const field = err.path.length > 0 ? err.path[0] : "unknown";
                    
                    // Collect multiple errors per field in an array
                    if (!fieldErrors[field]) {
                        fieldErrors[field] = [];
                    }
                    
                    // Only add if not already added (avoid duplicates)
                    if (!fieldErrors[field].includes(err.message)) {
                        fieldErrors[field].push(err.message);
                    }
                });
                
                // Convert arrays to single string if only one error, keep array if multiple
                Object.keys(fieldErrors).forEach((key) => {
                    if (fieldErrors[key].length === 1) {
                        fieldErrors[key] = fieldErrors[key][0];
                    }
                });
            }
            
            return { success: false, errors: fieldErrors };
        }
        
        // If not a ZodError, return a generic error
        console.log("Non-Zod Error:", error.message);
        return { 
            success: false, 
            errors: { 
                general: error.message || "Validation failed" 
            } 
        };
    }
};

// ============================================
// USER SANITIZATION
// ============================================

/**
 * Sanitizes user object - removes sensitive fields
 * @param {object} user - User document
 * @returns {object} Sanitized user object
 */
export const sanitizeUser = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        image: user.image || null,
        plan: user.plan,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
    };
};

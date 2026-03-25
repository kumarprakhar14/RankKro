import mongoose from "mongoose";
import argon2 from "argon2";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true, // This automatically creates a unique index
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'] // Basic email regex validation
        },
        phone: {
            type: String,
            default: ''
        },
        password: {
            type: String,
            // required: [true, 'Password is required'], // Made optional for OAuth users or make it conditionally required
            minlength: [6, 'Password should be at least 6 characters long'],
            select: false
        },
        image: {
            type: String
        },
        plan: {
            type: String,
            enum: ["FREE", "PREMIUM"],
            default: "FREE"
        },
        role: {
            type: String,
            enum: ["USER", "ADMIN"],
            default: "USER"
        },

        isActive: {
            type: Boolean,
            default: true
        },
        refreshTokens: {
            type: [String],
            default: []
        },
        // password reset fields
        resetPasswordToken: {
            type: String,
            default: null
        },
        resetPasswordExpiresAt: {
            type: Date,
            default: null
        }
    }, {
    // This option automatically manages createdAt and updatedAt fields
    timestamps: true
});

// Hash password before save
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return;
    this.password = await argon2.hash(this.password);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await argon2.verify(this.password, candidatePassword);
};

const User = mongoose.model("User", userSchema);

export default User;
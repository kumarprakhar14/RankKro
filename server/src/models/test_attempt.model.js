import mongoose from "mongoose";

const testAttemptSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    testId: { 
        type: String, 
        ref: "Test", 
        required: true 
    },
    startedAt: { 
        type: Date, 
        required: true, 
        default: Date.now 
    },
    expiresAt: { 
        type: Date, 
        required: true 
    }, // Evaluated by the backend to securely end sessions
    submittedAt: { 
        type: Date 
    },
    status: { 
        type: String, 
        enum: ["IN_PROGRESS", "SUBMITTED", "EXPIRED"], 
        default: "IN_PROGRESS" 
    },
    finalScore: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

const TestAttempt = mongoose.model("TestAttempt", testAttemptSchema);
export default TestAttempt;

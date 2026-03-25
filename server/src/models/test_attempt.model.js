import mongoose from "mongoose";

const testAttemptSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    test_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Test", 
        required: true 
    },
    started_at: { 
        type: Date, 
        required: true, 
        default: Date.now 
    },
    expires_at: { 
        type: Date, 
        required: true 
    }, // Evaluated by the backend to securely end sessions
    submitted_at: { 
        type: Date 
    },
    status: { 
        type: String, 
        enum: ["IN_PROGRESS", "SUBMITTED", "EXPIRED"], 
        default: "IN_PROGRESS" 
    },
    final_score: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

const TestAttempt = mongoose.model("TestAttempt", testAttemptSchema);
export default TestAttempt;

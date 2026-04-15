import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    attemptId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "TestAttempt", 
        required: true 
    },
    questionId: { 
        type: String, 
        ref: "Question", 
        required: true 
    },
    selectedOption: { 
        type: Number, 
        default: null, 
        min: 0, 
        max: 3 
    }, // 0-3 correspond to option_a - option_d
    isCorrect: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

// Enforce one answer per question per attempt
answerSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });

const Answer = mongoose.model("Answer", answerSchema);
export default Answer;

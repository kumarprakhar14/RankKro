import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    attempt_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "TestAttempt", 
        required: true 
    },
    question_id: { 
        type: String, 
        ref: "Question", 
        required: true 
    },
    selected_option: { 
        type: Number, 
        default: null, 
        min: 0, 
        max: 3 
    }, // 0-3 correspond to option_a - option_d
    is_correct: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

// Enforce one answer per question per attempt
answerSchema.index({ attempt_id: 1, question_id: 1 }, { unique: true });

const Answer = mongoose.model("Answer", answerSchema);
export default Answer;

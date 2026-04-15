import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        required: true, 
        unique: true 
    }, // e.g. q-ga-001
    text: { 
        type: String, 
        required: true 
    },
    option_a: { 
        type: String, 
        required: true 
    },
    option_b: { 
        type: String, 
        required: true 
    },
    option_c: { 
        type: String, 
        required: true 
    },
    option_d: { 
        type: String, 
        required: true 
    },
    correctOption: { 
        type: Number, 
        required: true, 
        min: 0, 
        max: 3 
    }, // 0=A, 1=B, 2=C, 3=D
    explanation: { 
        type: String 
    },
    marks: { 
        type: Number, 
        required: true, 
        default: 1 
    },
    negativeMarks: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    subject: { 
        type: String, 
        required: true 
    },
    difficulty: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

const Question = mongoose.model("Question", questionSchema);
export default Question;

import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
    id: { 
        type: String, 
        required: true, 
        unique: true 
    }, // e.g. ssc-cgl-01
    title: { 
        type: String, 
        required: true 
    },
    exam_type: { 
        type: String, 
        required: true 
    },
    duration_minutes: { 
        type: Number, 
        required: true 
    },
    difficulty: { 
        type: String, 
        enum: ["EASY", "MEDIUM", "HARD"] 
    },
    status: { 
        type: String, 
        enum: ["FREE", "PREMIUM"], 
        default: "FREE" 
    },
    attempted_count: { 
        type: Number, 
        default: 0 
    },
    is_pyq: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

const Test = mongoose.model("Test", testSchema);
export default Test;

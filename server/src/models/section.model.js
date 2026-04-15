import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
    testId: { 
        type: String, 
        ref: "Test", 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    }, // e.g., "General Awareness"
    section_order: { 
        type: Number, 
        required: true 
    }
}, { timestamps: true });

sectionSchema.index({ testId: 1, name: 1 }, { unique: true });

const Section = mongoose.model("Section", sectionSchema);
export default Section;

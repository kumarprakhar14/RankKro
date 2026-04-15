import mongoose from "mongoose";

const sectionQuestionSchema = new mongoose.Schema({
    section_id: { 
        type: String, 
        ref: "Section", 
        required: true 
    },
    question_id: {
        type: String, 
        ref: "Question", 
        required: true 
    },
    question_order: { 
        type: Number, 
        required: true 
    }
}, { timestamps: true });

// Ensure unique ordering within a section
sectionQuestionSchema.index({ section_id: 1, question_order: 1 }, { unique: true });

const SectionQuestion = mongoose.model("SectionQuestion", sectionQuestionSchema);
export default SectionQuestion;

import mongoose from "mongoose";

const sectionQuestionSchema = new mongoose.Schema({
    sectionId: { 
        type: String, 
        ref: "Section", 
        required: true 
    },
    questionId: {
        type: String, 
        ref: "Question", 
        required: true 
    },
    questionOrder: { 
        type: Number, 
        required: true 
    }
}, { timestamps: true });

// Ensure unique ordering within a section
sectionQuestionSchema.index({ sectionId: 1, questionOrder: 1 }, { unique: true });

const SectionQuestion = mongoose.model("SectionQuestion", sectionQuestionSchema);
export default SectionQuestion;

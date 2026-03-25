import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
    test_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Test", 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    }, // e.g., "General Awareness"
    display_order: { 
        type: Number, 
        required: true 
    }
}, { timestamps: true });

const Section = mongoose.model("Section", sectionSchema);
export default Section;

import mongoose from "mongoose";

const LearningOutcomeSchema = new mongoose.Schema(
    {
        teacher: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Teacher", 
            required: true 
        },
        student: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Student", 
            required: true 
        },
        subject: { type: String, required: true },
        material: { type: String, required: true },
        achievement: { type: String, required: true },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.models.LearningOutcome || mongoose.model("LearningOutcome", LearningOutcomeSchema);

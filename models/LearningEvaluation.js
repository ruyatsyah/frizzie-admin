import mongoose from "mongoose";

const LearningEvaluationSchema = new mongoose.Schema(
    {
        student: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Student",
            required: true 
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        progresBelajar: { type: String, default: "" },
        kebutuhanDitingkatkan: { type: String, default: "" },
        saranPengembangan: { type: String, default: "" },
        adminName: { type: String }, 
    },
    { timestamps: true }
);

delete mongoose.models.LearningEvaluation;
export default mongoose.model("LearningEvaluation", LearningEvaluationSchema);

import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        contact: { type: String, required: true },
        subjects: { type: [String], default: [] },
        email: { type: String },
        password: { type: String },
    },
    { timestamps: true }
);

delete mongoose.models.Teacher;
export default mongoose.model("Teacher", TeacherSchema);

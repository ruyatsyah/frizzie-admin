import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        contact: { type: String, required: true },
        subjects: { type: [String], default: [] },
    },
    { timestamps: true }
);

export default mongoose.models.Teacher ||
    mongoose.model("Teacher", TeacherSchema);

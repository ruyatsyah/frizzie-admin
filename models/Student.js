import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        contact: { type: String, required: true },
        grade: { type: String, required: true },
        enrolledClasses: { type: [String], default: [] },
    },
    { timestamps: true }
);

export default mongoose.models.Student ||
    mongoose.model("Student", StudentSchema);

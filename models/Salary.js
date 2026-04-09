import mongoose from "mongoose";

const SalarySchema = new mongoose.Schema(
    {
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },
        amount: { type: Number, required: true },
        monthYear: { type: String, required: true }, // e.g., "Januari 2026"
        sessions: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["Belum Dibayar", "Sudah Dibayar"],
            default: "Belum Dibayar",
        },
    },
    { timestamps: true }
);

delete mongoose.models.Salary;
export default mongoose.model("Salary", SalarySchema);

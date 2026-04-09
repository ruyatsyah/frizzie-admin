import mongoose from "mongoose";

const BillingSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        amount: { type: Number, required: true },
        monthYear: { type: String, required: true }, // e.g., "Januari 2026"
        sessions: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["Belum Lunas", "Lunas"],
            default: "Belum Lunas",
        },
    },
    { timestamps: true }
);

delete mongoose.models.Billing;
export default mongoose.model("Billing", BillingSchema);

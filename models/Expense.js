import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        amount: { type: Number, required: true },
        date: { type: Date, required: true, default: Date.now },
        category: { type: String, default: "Lainnya" },
        description: { type: String },
    },
    { timestamps: true }
);

delete mongoose.models.Expense;
export default mongoose.model("Expense", ExpenseSchema);

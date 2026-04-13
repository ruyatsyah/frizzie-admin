import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { 
            type: String, 
            enum: ["admin", "teacher"], 
            default: "teacher" 
        },
        teacherId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Teacher",
            required: function() { return this.role === "teacher"; }
        },
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);

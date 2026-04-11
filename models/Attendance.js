import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["Teacher"], // We primarily record teacher sessions now
            default: "Teacher",
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        studentsTaught: [
            {
                student: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Student",
                },
                subject: {
                    type: String,
                },
                status: {
                    type: String,
                    enum: ["Hadir", "Izin", "Sakit", "Alpa"],
                    default: "Hadir",
                },
            },
        ],
        notes: {
            type: String,
        },
        salaryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Salary",
        },
    },
    { timestamps: true }
);

delete mongoose.models.Attendance;
export default mongoose.model("Attendance", AttendanceSchema);

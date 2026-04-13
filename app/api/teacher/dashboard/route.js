import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import LearningOutcome from "@/models/LearningOutcome";
import Attendance from "@/models/Attendance";
import Salary from "@/models/Salary";
import mongoose from "mongoose";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");

        if (!teacherId) {
            return NextResponse.json({ error: "Teacher ID required" }, { status: 400 });
        }

        const tId = new mongoose.Types.ObjectId(teacherId);

        // 1. Stats
        const cpCount = await LearningOutcome.countDocuments({ teacher: tId });
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const sessionsThisMonth = await Attendance.countDocuments({
            teacher: tId,
            date: { $gte: startOfMonth }
        });

        // 2. Recent CP
        const recentCP = await LearningOutcome.find({ teacher: tId })
            .sort({ date: -1 })
            .limit(5)
            .populate("student", "name");

        // 3. Salary History
        const salaries = await Salary.find({ teacher: tId })
            .sort({ createdAt: -1 })
            .limit(10);

        return NextResponse.json({
            stats: { cpCount, sessionsThisMonth },
            recentCP,
            salaries
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

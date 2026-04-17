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

        if (!teacherId || teacherId === "undefined" || !mongoose.Types.ObjectId.isValid(teacherId)) {
            return NextResponse.json({ 
                stats: { cpCount: 0, sessionsThisMonth: 0 },
                recentCP: [],
                pendingTasks: [],
                salaries: []
            });
        }

        const tId = new mongoose.Types.ObjectId(teacherId);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch all initial data in parallel
        const [
            cpCount,
            sessionsThisMonth,
            recentCP,
            recentSessions,
            salaries
        ] = await Promise.all([
            LearningOutcome.countDocuments({ teacher: tId }),
            Attendance.countDocuments({
                teacher: tId,
                date: { $gte: startOfMonth }
            }),
            LearningOutcome.find({ teacher: tId })
                .sort({ date: -1 })
                .limit(5)
                .populate("student", "name"),
            Attendance.find({ teacher: tId })
                .sort({ date: -1 })
                .limit(20)
                .populate("studentsTaught.student", "name"),
            Salary.find({ teacher: tId })
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        const existingCP = await LearningOutcome.find({ 
            teacher: tId, 
            $or: [
                { sessionId: { $in: recentSessions.map(s => s._id) } },
                { student: { $in: recentSessions.flatMap(s => s.studentsTaught.map(st => st.student?._id)) } }
            ]
        }, "sessionId student date");

        const pendingTasks = [];
        for (const session of recentSessions) {
            for (const st of session.studentsTaught) {
                if (st.status !== "Hadir") continue;

                const filled = existingCP.some(cp => 
                    (cp.sessionId?.toString() === session._id.toString()) || 
                    (!cp.sessionId && cp.student?.toString() === st.student?._id.toString() && 
                     new Date(cp.date).toDateString() === new Date(session.date).toDateString())
                );

                if (!filled) {
                    pendingTasks.push({
                        sessionId: session._id,
                        student: st.student,
                        subject: st.subject,
                        date: session.date
                    });
                }
            }
        }

        return NextResponse.json({
            stats: { cpCount, sessionsThisMonth },
            recentCP,
            pendingTasks,
            salaries
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import LearningOutcome from "@/models/LearningOutcome";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");
        const studentId = searchParams.get("studentId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const query = {};
        if (teacherId) {
            // Support both Teacher ID and User ID if they were mixed up in legacy data
            query.$or = [
                { teacher: teacherId }
            ];
            // If the user forgot to link teacherId but we have the User ID, we can search for it too
            // However, we primarily want the Teacher ID.
        }
        if (studentId && studentId.trim() !== "") query.student = studentId;
        
        if ((startDate && startDate.trim() !== "") || (endDate && endDate.trim() !== "")) {
            query.date = {};
            if (startDate && startDate.trim() !== "") query.date.$gte = new Date(startDate);
            if (endDate && endDate.trim() !== "") query.date.$lte = new Date(endDate);
        }

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const totalItems = await LearningOutcome.countDocuments(query);
        const data = await LearningOutcome.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate("teacher", "name")
            .populate("student", "name");

        // If teacher is requesting, we should also look for "Missing" outcomes from Attendance
        if (teacherId && teacherId !== "undefined") {
            try {
                const Attendance = (await import("@/models/Attendance")).default;
                
                // For teachers, we paginate the base Attendance sessions to find missing reports
                const totalSessions = await Attendance.countDocuments({ teacher: teacherId });
                const pastSessions = await Attendance.find({ teacher: teacherId })
                    .sort({ date: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate("studentsTaught.student", "name");

                const mergedData = [];
                
                // For each student in each session, find if an outcome exists
                for (const session of pastSessions) {
                    for (const st of session.studentsTaught) {
                        if (st.status !== "Hadir") continue; 
                        
                        // We search for outcomes linked to this session/student
                        const existing = await LearningOutcome.findOne({
                            $or: [
                                { sessionId: session._id, student: st.student?._id },
                                { 
                                    teacher: teacherId, 
                                    student: st.student?._id, 
                                    date: {
                                        $gte: new Date(new Date(session.date).setHours(0,0,0,0)),
                                        $lte: new Date(new Date(session.date).setHours(23,59,59,999))
                                    }
                                }
                            ]
                        }).populate("student", "name").populate("teacher", "name");

                        if (existing) {
                            mergedData.push({
                                ...existing._doc,
                                isCompleted: true
                            });
                        } else {
                            mergedData.push({
                                teacher: { _id: teacherId },
                                student: st.student,
                                subject: st.subject,
                                material: "",
                                achievement: "",
                                date: session.date,
                                sessionId: session._id,
                                isCompleted: false
                            });
                        }
                    }
                }
                return NextResponse.json({
                    data: mergedData,
                    total: totalSessions, // For teachers, total is based on sessions
                    page,
                    totalPages: Math.ceil(totalSessions / limit)
                });
            } catch (err) {
                console.error("Teacher Merge Error:", err);
                return NextResponse.json({ data: [], error: err.message });
            }
        }

        return NextResponse.json({
            data,
            total: totalItems,
            page,
            totalPages: Math.ceil(totalItems / limit)
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const newRecord = await LearningOutcome.create(body);
        return NextResponse.json(newRecord);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import LearningOutcome from "@/models/LearningOutcome";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";

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
                const mongoose = (await import("mongoose")).default;
                
                const pipelineCommon = [
                    { $match: { teacher: new mongoose.Types.ObjectId(teacherId) } },
                    { $unwind: "$studentsTaught" },
                    { $match: { "studentsTaught.status": "Hadir" } }
                ];

                const totalAgg = await Attendance.aggregate([...pipelineCommon, { $count: "totalItems" }]);
                const totalItems = totalAgg.length > 0 ? totalAgg[0].totalItems : 0;

                const pastSessions = await Attendance.aggregate([
                    ...pipelineCommon,
                    { $sort: { date: -1, _id: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: "students",
                            localField: "studentsTaught.student",
                            foreignField: "_id",
                            as: "studentDoc"
                        }
                    },
                    { $unwind: { path: "$studentDoc", preserveNullAndEmptyArrays: true } }
                ]);

                const sessionIds = pastSessions.map(s => s._id);
                const relatedOutcomes = await LearningOutcome.find({ 
                    sessionId: { $in: sessionIds } 
                }).populate("student", "name").populate("teacher", "name");

                const outcomeMap = new Map();
                relatedOutcomes.forEach(out => {
                    const key = `${out.sessionId?.toString()}-${out.student?._id?.toString()}`;
                    outcomeMap.set(key, out);
                });

                const mergedData = [];
                for (const row of pastSessions) {
                    const sessionIdStr = row._id.toString();
                    const studentIdStr = row.studentDoc?._id?.toString() || row.studentsTaught.student.toString();
                    const key = `${sessionIdStr}-${studentIdStr}`;
                    const existing = outcomeMap.get(key);

                    if (existing) {
                        mergedData.push({
                            ...existing._doc,
                            isCompleted: true
                        });
                    } else {
                        mergedData.push({
                            teacher: { _id: teacherId },
                            student: row.studentDoc || { _id: studentIdStr },
                            subject: row.studentsTaught.subject,
                            material: "",
                            achievement: "",
                            date: row.date,
                            sessionId: row._id,
                            isCompleted: false
                        });
                    }
                }

                return NextResponse.json({
                    data: mergedData,
                    total: totalItems,
                    page,
                    totalPages: Math.ceil(totalItems / limit)
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

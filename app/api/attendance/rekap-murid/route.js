import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const page = parseInt(searchParams.get("page")) || 1;
        const limitParam = searchParams.get("limit");
        const isExport = limitParam === "all";
        const limit = isExport ? 100000 : parseInt(limitParam) || 10;
        const skip = (page - 1) * limit;

        // Build Aggregation Pipeline
        const pipeline = [];

        // 1. Initial Match (Date Range & Student ID)
        const initialMatch = {};
        if (startDate || endDate) {
            initialMatch.date = {};
            if (startDate) initialMatch.date.$gte = new Date(new Date(startDate).setHours(0,0,0,0));
            if (endDate) initialMatch.date.$lte = new Date(new Date(endDate).setHours(23,59,59,999));
        }
        if (studentId) {
            const mongoose = (await import("mongoose")).default;
            initialMatch["studentsTaught.student"] = new mongoose.Types.ObjectId(studentId);
        }

        if (Object.keys(initialMatch).length > 0) {
            pipeline.push({ $match: initialMatch });
        }

        // 2. Unwind & Lookups
        pipeline.push(
            { $unwind: "$studentsTaught" },
            {
                $lookup: {
                    from: "teachers",
                    localField: "teacher",
                    foreignField: "_id",
                    as: "teacherData"
                }
            },
            { $unwind: { path: "$teacherData", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "students",
                    localField: "studentsTaught.student",
                    foreignField: "_id",
                    as: "studentData"
                }
            },
            { $unwind: { path: "$studentData", preserveNullAndEmptyArrays: true } }
        );

        // 3. Post-unwind filter if studentId was passed (unwind created multiple rows, ensure we only get the specific student row)
        if (studentId) {
            const mongoose = (await import("mongoose")).default;
            pipeline.push({ 
                $match: { "studentsTaught.student": new mongoose.Types.ObjectId(studentId) } 
            });
        }

        // Common steps: Mapping and Sorting
        pipeline.push(
            {
                $project: {
                    _id: { $concat: [{ $toString: "$_id" }, "-", { $toString: "$studentsTaught._id" }] },
                    date: 1,
                    teacherName: "$teacherData.name",
                    studentId: "$studentsTaught.student",
                    studentName: "$studentData.name",
                    grade: "$studentData.grade",
                    subject: "$studentsTaught.subject",
                    status: "$studentsTaught.status",
                    notes: "$notes"
                }
            },
            { $sort: { date: -1 } }
        );

        if (isExport) {
            const data = await Attendance.aggregate(pipeline);
            return NextResponse.json(data);
        }

        // Paginated Facet
        pipeline.push({
            $facet: {
                data: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: "count" }]
            }
        });

        const result = await Attendance.aggregate(pipeline);
        const data = result[0].data;
        const total = result[0].totalCount[0]?.count || 0;

        return NextResponse.json({
            data,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalItems: total
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

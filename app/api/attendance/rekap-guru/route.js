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
        const teacherId = searchParams.get("teacherId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const search = searchParams.get("search");

        const page = parseInt(searchParams.get("page")) || 1;
        const limitParam = searchParams.get("limit");
        const isExport = limitParam === "all";
        const limit = isExport ? 0 : parseInt(limitParam) || 10;
        const skip = (page - 1) * limit;

        const query = {};
        
        // 1. Filter by Teacher ID (specific dropdown)
        if (teacherId && teacherId !== "undefined") {
            query.teacher = teacherId;
        }

        // 2. Filter by Search Name (partial regex)
        if (search) {
            const matchingTeachers = await Teacher.find({
                name: { $regex: search, $options: "i" }
            }).select("_id");
            const teacherIds = matchingTeachers.map(t => t._id);
            query.teacher = { $in: teacherIds };
        }

        // 3. Filter by Date Range
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(new Date(startDate).setHours(0,0,0,0));
            }
            if (endDate) {
                query.date.$lte = new Date(new Date(endDate).setHours(23,59,59,999));
            }
        }

        if (isExport) {
            const data = await Attendance.find(query)
                .populate("teacher", "name")
                .populate("studentsTaught.student", "name subject material")
                .sort({ date: -1, createdAt: -1 });
            
            return NextResponse.json(data);
        }

        const [data, total] = await Promise.all([
            Attendance.find(query)
                .populate("teacher", "name")
                .populate("studentsTaught.student", "name subject material")
                .sort({ date: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Attendance.countDocuments(query)
        ]);

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

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
        const page = parseInt(searchParams.get("page")) || 1;
        const limitParam = searchParams.get("limit");
        const isExport = limitParam === "all";
        const limit = isExport ? 0 : parseInt(limitParam) || 10;
        const skip = (page - 1) * limit;

        const query = {};
        if (teacherId) query.teacher = teacherId;

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

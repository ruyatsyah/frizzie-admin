import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";

export async function GET(req) {
    try {
        await dbConnect();
        
        // Populate and fetch all
        const data = await Attendance.find({})
            .populate("teacher")
            .populate("studentsTaught.student")
            .sort({ date: -1, createdAt: -1 });

        // We can do further grouping on the client or here.
        // Let's provide raw data for now, filtered by teacher if query param exists.
        // Map data to ensure studentsTaught exists
        const safeData = data.map(item => ({
            ...item.toObject(),
            studentsTaught: item.studentsTaught || []
        }));

        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");
        
        let filteredData = safeData;
        if (teacherId) {
            filteredData = safeData.filter(item => item.teacher?._id.toString() === teacherId);
        }

        return NextResponse.json(filteredData);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

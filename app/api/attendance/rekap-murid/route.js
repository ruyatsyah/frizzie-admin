import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";

export async function GET(req) {
    try {
        await dbConnect();
        
        // Fetch all teacher sessions
        const data = await Attendance.find({})
            .populate("teacher")
            .populate("studentsTaught.student")
            .sort({ date: -1, createdAt: -1 });

        // Flatten data for student view: Every row = one student attendance
        const flattened = [];
        data.forEach(session => {
            const students = session.studentsTaught || [];
            students.forEach(st => {
                flattened.push({
                    _id: `${session._id}-${st._id}`,
                    sessionId: session._id,
                    date: session.date,
                    teacherName: session.teacher?.name,
                    studentId: st.student?._id, // Add ID for filtering
                    studentName: st.student?.name,
                    grade: st.student?.grade,
                    subject: st.subject,
                    status: st.status,
                    notes: session.notes
                });
            });
        });

        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        
        let filteredData = flattened;
        if (studentId) {
            filteredData = flattened.filter(item => item.studentId?.toString() === studentId);
        }

        return NextResponse.json(filteredData);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

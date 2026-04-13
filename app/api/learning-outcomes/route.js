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
        if (teacherId) query.teacher = teacherId;
        if (studentId) query.student = studentId;
        
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const data = await LearningOutcome.find(query)
            .sort({ date: -1 })
            .populate("teacher", "name")
            .populate("student", "name");

        return NextResponse.json(data);
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

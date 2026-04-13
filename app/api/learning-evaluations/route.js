import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import LearningEvaluation from "@/models/LearningEvaluation";

// GET: Fetch existing evaluation for a student and date range
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        if (!studentId && !startDate && !endDate) {
            const allEvaluations = await LearningEvaluation.find({})
                .sort({ createdAt: -1 })
                .populate("student", "name");
            return NextResponse.json(allEvaluations);
        }

        const evaluation = await LearningEvaluation.findOne({
            student: studentId,
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });

        return NextResponse.json(evaluation || { 
            progresBelajar: "", 
            kebutuhanDitingkatkan: "", 
            saranPengembangan: "" 
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Save or update evaluation
export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { studentId, startDate, endDate, progresBelajar, kebutuhanDitingkatkan, saranPengembangan, adminName } = body;

        const updated = await LearningEvaluation.findOneAndUpdate(
            { 
                student: studentId, 
                startDate: new Date(startDate), 
                endDate: new Date(endDate) 
            },
            {
                student: studentId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                progresBelajar,
                kebutuhanDitingkatkan,
                saranPengembangan,
                adminName
            },
            { upsert: true, new: true }
        );

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

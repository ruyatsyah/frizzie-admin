import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import LearningOutcome from "@/models/LearningOutcome";

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const body = await req.json();
        
        const updatedRecord = await LearningOutcome.findByIdAndUpdate(id, body, { new: true });
        
        if (!updatedRecord) {
            return NextResponse.json({ error: "Record not found" }, { status: 404 });
        }
        
        return NextResponse.json(updatedRecord);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        
        const deletedRecord = await LearningOutcome.findByIdAndDelete(id);
        
        if (!deletedRecord) {
            return NextResponse.json({ error: "Record not found" }, { status: 404 });
        }
        
        return NextResponse.json({ message: "Record deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

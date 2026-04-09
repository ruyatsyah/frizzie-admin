import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Billing from "@/models/Billing";

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const body = await req.json();
        const updated = await Billing.findByIdAndUpdate(id, body, { new: true }).populate("student");
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        await Billing.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

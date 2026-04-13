import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import User from "@/models/User";
import crypto from "crypto";

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const body = await req.json();
        const updated = await Teacher.findByIdAndUpdate(id, body, { new: true });

        // Update User credentials if provided
        if (body.email) {
            const updateObj = {
                email: body.email,
                name: body.name,
                role: "teacher",
                teacherId: id
            };
            if (body.password) {
                updateObj.password = hashPassword(body.password);
            }
            await User.findOneAndUpdate({ teacherId: id }, updateObj, { upsert: true });
        }

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        await Teacher.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

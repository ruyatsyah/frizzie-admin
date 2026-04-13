import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import User from "@/models/User";
import crypto from "crypto";

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export async function GET() {
    try {
        await dbConnect();
        const data = await Teacher.find({}).sort({ createdAt: -1 });
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        
        // 1. Create Teacher
        const teacher = await Teacher.create(body);

        // 2. If email/password provided, create User
        if (body.email && body.password) {
            await User.findOneAndUpdate(
                { email: body.email },
                {
                    name: body.name,
                    password: hashPassword(body.password),
                    role: "teacher",
                    teacherId: teacher._id
                },
                { upsert: true, new: true }
            );
        }

        return NextResponse.json(teacher, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

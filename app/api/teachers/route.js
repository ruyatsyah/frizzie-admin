import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import User from "@/models/User";
import crypto from "crypto";

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;
        const search = searchParams.get("search") || "";

        const query = {};
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        const skip = (page - 1) * limit;
        const total = await Teacher.countDocuments(query);
        const data = await Teacher.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            data,
            page,
            total,
            totalPages: Math.ceil(total / limit)
        });
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

import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";

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
        const total = await Student.countDocuments(query);
        const data = await Student.find(query)
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
        const data = await Student.create(body);
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

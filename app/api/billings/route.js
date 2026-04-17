import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Billing from "@/models/Billing";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            Billing.find({})
                .populate("student")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Billing.countDocuments({})
        ]);

        return NextResponse.json({
            data,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalItems: total
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const data = await Billing.create(body);
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

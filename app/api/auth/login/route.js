import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(req) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
        }

        const hashedPassword = hashPassword(password);
        if (hashedPassword !== user.password) {
            return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
        }

        // Return user info for the session (excluding password)
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            teacherId: user.teacherId
        };

        return NextResponse.json(userData);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import crypto from "crypto";

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export async function PUT(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { userId, name, email, password } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Cari user yang akan di update
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Siapkan object update untuk User
        const updateObj = {};
        if (name) updateObj.name = name;
        if (email) updateObj.email = email;
        if (password) updateObj.password = hashPassword(password);

        // Update User
        const updatedUser = await User.findByIdAndUpdate(userId, updateObj, { new: true });

        // Sinkronisasi ke model Teacher jika dia adalah teacher
        if (user.role === 'teacher' && user.teacherId) {
            const teacherUpdateObj = {};
            if (name) teacherUpdateObj.name = name;
            if (email) teacherUpdateObj.email = email;
            if (password) teacherUpdateObj.password = password; // Di model Teacher disimpan as plain text seperti konvensi awal Frizzie

            await Teacher.findByIdAndUpdate(user.teacherId, teacherUpdateObj);
        }

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                teacherId: updatedUser.teacherId
            }
        });
    } catch (error) {
        // Cek duplicate email
        if (error.code === 11000) {
            return NextResponse.json({ error: "Email sudah digunakan oleh akun lain." }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

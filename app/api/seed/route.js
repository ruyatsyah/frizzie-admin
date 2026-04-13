import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import crypto from "crypto";

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export async function GET() {
    try {
        await dbConnect();

        // 1. Create/Update Admin
        const adminEmail = "ruyatsyah2203@gmail.com";
        const hashedAdminPassword = hashPassword("admin");
        
        await User.findOneAndUpdate(
            { email: adminEmail },
            { 
                name: "Ruyatsyah", 
                password: hashedAdminPassword, 
                role: "admin" 
            },
            { upsert: true, new: true }
        );

        // 2. Create/Update Teacher "Salma Rahmani"
        let salma = await Teacher.findOne({ name: /Salma/i });
        if (!salma) {
            salma = await Teacher.create({
                name: "Salma Rahmani",
                contact: "08123456789",
                subjects: ["Matematika", "IPA"]
            });
        }

        const teacherEmail = "guru1@frizzie.org";
        const hashedTeacherPassword = hashPassword("guru1");

        await User.findOneAndUpdate(
            { email: teacherEmail },
            { 
                name: salma.name, 
                password: hashedTeacherPassword, 
                role: "teacher",
                teacherId: salma._id
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ 
            message: "Seed successful! Accounts updated/created.",
            accounts: [
                { email: adminEmail, password: "admin", role: "admin" },
                { email: teacherEmail, password: "guru1", role: "teacher" }
            ]
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

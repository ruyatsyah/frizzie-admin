import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Salary from "@/models/Salary";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";

const RATE_PER_STUDENT = 10000;

const getMonthYearString = (date) => {
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const d = new Date(date);
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
};

export async function GET(req) {
    try {
        await dbConnect();
        const data = await Attendance.find({})
            .populate("teacher")
            .populate("studentsTaught.student")
            .sort({ date: -1, createdAt: -1 });

        return NextResponse.json(data);
    } catch (error) {
        console.error("GET Attendance Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { teacher, date, studentsTaught, notes } = body;

        // Calculate salary increment
        const hadirCount = (studentsTaught || []).filter(s => s.status === "Hadir").length;
        const salaryAmount = hadirCount * RATE_PER_STUDENT;

        let linkedSalaryId = null;

        if (salaryAmount > 0) {
            const monthYear = getMonthYearString(date || new Date());
            
            // 1. Find a salary record that is NOT YET PAID for this month/teacher
            let salary = await Salary.findOne({ 
                teacher, 
                monthYear, 
                status: "Belum Dibayar" 
            });

            if (salary) {
                // Update existing unpaid batch
                salary.amount += salaryAmount;
                salary.sessions += hadirCount;
                await salary.save();
                linkedSalaryId = salary._id;
            } else {
                // Create a NEW unpaid batch (because none exists or all existing ones are "Sudah Dibayar")
                const newSalary = await Salary.create({
                    teacher,
                    amount: salaryAmount,
                    monthYear,
                    sessions: hadirCount,
                    status: "Belum Dibayar",
                });
                linkedSalaryId = newSalary._id;
            }
        }

        // Create the attendance record linked to the salary batch
        const attendance = await Attendance.create({
            type: "Teacher",
            teacher,
            date: date || new Date(),
            studentsTaught: studentsTaught || [],
            notes,
            salaryId: linkedSalaryId
        });

        return NextResponse.json(attendance, { status: 201 });
    } catch (error) {
        console.error("POST Attendance Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

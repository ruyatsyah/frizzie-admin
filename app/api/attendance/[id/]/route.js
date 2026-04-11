import { NextResponse } from "next/server";
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

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const { teacher, date, studentsTaught, notes } = body;

        const oldAttendance = await Attendance.findById(id);
        if (!oldAttendance) {
            return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
        }

        // 1. Check if the specific salary batch linked to this session is paid
        if (oldAttendance.salaryId) {
            const linkedSalary = await Salary.findById(oldAttendance.salaryId);
            if (linkedSalary && linkedSalary.status === "Sudah Dibayar") {
                return NextResponse.json({ 
                    error: `Sesi ini sudah masuk ke laporan gaji yang LUNAS. Batalkan status lunas di menu Gaji jika ingin mengedit.` 
                }, { status: 400 });
            }

            // 2. Revert from Old Salary (Subtract)
            const oldHadirCount = (oldAttendance.studentsTaught || []).filter(s => s.status === "Hadir").length;
            if (linkedSalary && oldHadirCount > 0) {
                linkedSalary.amount -= oldHadirCount * RATE_PER_STUDENT;
                linkedSalary.sessions -= oldHadirCount;
                await linkedSalary.save();
            }
        }

        // 3. Find/Create New Salary Batch for the new state
        const newHadirCount = (studentsTaught || []).filter(s => s.status === "Hadir").length;
        const salaryAmount = newHadirCount * RATE_PER_STUDENT;
        let newSalaryId = null;

        if (salaryAmount > 0) {
            const monthYear = getMonthYearString(date);
            
            // Search for an UNPAID batch for the (potentially new) month/teacher
            let targetSalary = await Salary.findOne({ 
                teacher, 
                monthYear, 
                status: "Belum Dibayar" 
            });

            if (targetSalary) {
                targetSalary.amount += salaryAmount;
                targetSalary.sessions += newHadirCount;
                await targetSalary.save();
                newSalaryId = targetSalary._id;
            } else {
                const newSalary = await Salary.create({
                    teacher,
                    amount: salaryAmount,
                    monthYear,
                    sessions: newHadirCount,
                    status: "Belum Dibayar"
                });
                newSalaryId = newSalary._id;
            }
        }

        // 4. Update Attendance Record
        const updatedAttendance = await Attendance.findByIdAndUpdate(
            id,
            { teacher, date, studentsTaught, notes, salaryId: newSalaryId },
            { new: true }
        );

        return NextResponse.json(updatedAttendance);
    } catch (error) {
        console.error("PUT Attendance Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const attendance = await Attendance.findById(id);
        if (!attendance) {
            return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
        }

        // Check if Paid via linked salaryId
        if (attendance.salaryId) {
            const salary = await Salary.findById(attendance.salaryId);
            if (salary && salary.status === "Sudah Dibayar") {
                return NextResponse.json({ error: "Sesi ini sudah dibayar, data tidak bisa dihapus." }, { status: 400 });
            }

            // Revert salary changes
            const hadirCount = (attendance.studentsTaught || []).filter(s => s.status === "Hadir").length;
            if (salary && hadirCount > 0) {
                salary.amount -= hadirCount * RATE_PER_STUDENT;
                salary.sessions -= hadirCount;
                
                if (salary.sessions <= 0 && salary.amount <= 0) {
                    await Salary.findByIdAndDelete(salary._id);
                } else {
                    await salary.save();
                }
            }
        }

        await Attendance.findByIdAndDelete(id);
        return NextResponse.json({ message: "Attendance deleted" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

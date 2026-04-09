import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import Billing from "@/models/Billing";
import Salary from "@/models/Salary";

export async function GET() {
    try {
        await dbConnect();
        const studentsCount = await Student.countDocuments();
        const teachersCount = await Teacher.countDocuments();
        const unpaidBillings = await Billing.countDocuments({ status: "Belum Lunas" });
        const unpaidSalaries = await Salary.countDocuments({ status: "Belum Dibayar" });

        // Financial Recap
        const totalIncomeResult = await Billing.aggregate([
            { $match: { status: "Lunas" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalExpenseResult = await Salary.aggregate([
            { $match: { status: "Sudah Dibayar" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalIncome = totalIncomeResult[0]?.total || 0;
        const totalExpense = totalExpenseResult[0]?.total || 0;

        return NextResponse.json({
            students: studentsCount,
            teachers: teachersCount,
            unpaidBillings: unpaidBillings,
            unpaidSalaries: unpaidSalaries,
            totalIncome,
            totalExpense
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

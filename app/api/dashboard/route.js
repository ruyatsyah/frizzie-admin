import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import Billing from "@/models/Billing";
import Salary from "@/models/Salary";
import Expense from "@/models/Expense";

export async function GET() {
    try {
        await dbConnect();

        const [
            studentsCount,
            teachersCount,
            unpaidBillings,
            unpaidSalaries,
            totalIncomeResult,
            totalExpenseResult
        ] = await Promise.all([
            Student.countDocuments(),
            Teacher.countDocuments(),
            Billing.countDocuments({ status: "Belum Lunas" }),
            Salary.countDocuments({ status: "Belum Dibayar" }),
            Billing.aggregate([
                { $match: { status: "Lunas" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            Expense.aggregate([
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ])
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

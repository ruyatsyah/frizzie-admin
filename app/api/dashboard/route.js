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
            totalSalaryExpenseResult,
            totalGeneralExpenseResult
        ] = await Promise.all([
            Student.countDocuments(),
            Teacher.countDocuments(),
            Billing.countDocuments({ status: "Belum Lunas" }),
            Salary.countDocuments({ status: "Belum Dibayar" }),
            Billing.aggregate([
                { $match: { status: "Lunas" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            Salary.aggregate([
                { $match: { status: "Sudah Dibayar" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            Expense.aggregate([
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ])
        ]);

        const totalIncome = totalIncomeResult[0]?.total || 0;
        const totalSalaryExpense = totalSalaryExpenseResult[0]?.total || 0;
        const totalGeneralExpense = totalGeneralExpenseResult[0]?.total || 0;
        const totalExpense = totalSalaryExpense + totalGeneralExpense;

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

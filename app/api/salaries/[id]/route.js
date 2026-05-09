import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Salary from "@/models/Salary";
import Expense from "@/models/Expense";

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        // Find old salary state to determine if status changed
        const oldSalary = await Salary.findById(id).populate("teacher");
        if (!oldSalary) {
            return NextResponse.json({ error: "Salary not found" }, { status: 404 });
        }

        const updated = await Salary.findByIdAndUpdate(id, body, { new: true }).populate("teacher");

        // Auto-sync with Expense model based on status change
        if (oldSalary.status !== "Sudah Dibayar" && body.status === "Sudah Dibayar") {
            await Expense.create({
                title: `Gaji Guru: ${updated.teacher?.name || 'Tidak Dikenal'} - ${updated.monthYear}`,
                amount: updated.amount,
                category: "Gaji Guru",
                description: `Sistem Otomatis: Pencairan gaji dari total kehadiran ${updated.sessions} sesi.`,
                salaryId: updated._id
            });
        } else if (oldSalary.status === "Sudah Dibayar" && body.status === "Belum Dibayar") {
            await Expense.findOneAndDelete({ salaryId: updated._id });
        }

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        
        // Also delete associated expense if any
        await Expense.findOneAndDelete({ salaryId: id });
        
        await Salary.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

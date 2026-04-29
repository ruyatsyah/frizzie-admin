import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Expense from "@/models/Expense";

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const body = await req.json();
        const expense = await Expense.findByIdAndUpdate(id, body, { new: true });
        if (!expense) return NextResponse.json({ error: "Pengeluaran tidak ditemukan" }, { status: 404 });
        return NextResponse.json(expense);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const expense = await Expense.findByIdAndDelete(id);
        if (!expense) return NextResponse.json({ error: "Pengeluaran tidak ditemukan" }, { status: 404 });
        return NextResponse.json({ message: "Pengeluaran berhasil dihapus" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

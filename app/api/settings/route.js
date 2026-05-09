import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Setting from "@/models/Setting";
import Salary from "@/models/Salary";

export async function GET(req) {
    try {
        await dbConnect();
        const settings = await Setting.find({});
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        return NextResponse.json(settingsMap);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        
        const updates = [];
        for (const [key, value] of Object.entries(body)) {
            updates.push(
                Setting.findOneAndUpdate(
                    { key },
                    { value },
                    { upsert: true, new: true }
                )
            );
        }
        await Promise.all(updates);

        // If ratePerStudent was updated, recalculate all unpaid salaries
        if (body.ratePerStudent !== undefined) {
            const newRate = Number(body.ratePerStudent);
            if (!isNaN(newRate) && newRate > 0) {
                const unpaidSalaries = await Salary.find({ status: "Belum Dibayar" });
                const salaryUpdates = unpaidSalaries.map(salary => {
                    salary.amount = salary.sessions * newRate;
                    return salary.save();
                });
                await Promise.all(salaryUpdates);
            }
        }

        return NextResponse.json({ message: "Settings updated successfully" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

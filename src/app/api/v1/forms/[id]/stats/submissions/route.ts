import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Form from "@/lib/models/form";
import Submission from "@/lib/models/submission";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "30d";

  await connectDB();

  // Verify form exists and belongs to user
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid form ID" }, { status: 400 });
  }

  const form = await Form.findOne({ _id: id, userId: user._id });
  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  // Calculate date range (use UTC consistently)
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - days);
  startDate.setUTCHours(0, 0, 0, 0);

  // Aggregate submissions by date for this specific form
  const submissions = await Submission.aggregate([
    {
      $match: {
        formId: form._id,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Create a map of date -> count
  const submissionMap = new Map<string, number>();
  for (const s of submissions) {
    submissionMap.set(s._id, s.count);
  }

  // Fill in all dates with counts (0 for missing dates)
  const chartData = [];
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    chartData.push({
      date: dateStr,
      submissions: submissionMap.get(dateStr) || 0,
    });
  }

  return NextResponse.json({ chartData });
}

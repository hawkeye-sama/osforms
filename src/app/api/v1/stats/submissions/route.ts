import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Submission from "@/lib/models/submission";
import Form from "@/lib/models/form";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "30d";

  await connectDB();

  // Get user's forms
  const forms = await Form.find({ userId: user._id }).select("_id");
  const formIds = forms.map((f) => f._id);

  if (formIds.length === 0) {
    // No forms yet, return empty chart data
    return NextResponse.json({ chartData: generateEmptyChartData(period) });
  }

  // Calculate date range
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Aggregate submissions by date
  const submissions = await Submission.aggregate([
    {
      $match: {
        formId: { $in: formIds },
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
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    chartData.push({
      date: dateStr,
      submissions: submissionMap.get(dateStr) || 0,
    });
  }

  return NextResponse.json({ chartData });
}

function generateEmptyChartData(period: string) {
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const chartData = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    chartData.push({
      date: dateStr,
      submissions: 0,
    });
  }

  return chartData;
}

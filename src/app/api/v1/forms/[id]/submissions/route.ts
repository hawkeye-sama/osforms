import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import Form from "@/lib/models/form";
import Submission from "@/lib/models/submission";

type Params = { params: Promise<{ id: string }> };

/** GET /api/v1/forms/:id/submissions - Paginated submissions list */
export async function GET(req: NextRequest, { params }: Params) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const { id } = await params;
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || "25")));
  const skip = (page - 1) * limit;

  await connectDB();

  // Verify ownership
  const form = await Form.findOne({ _id: id, userId: user._id }).lean();
  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  const [submissions, total] = await Promise.all([
    Submission.find({ formId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Submission.countDocuments({ formId: id }),
  ]);

  return NextResponse.json({
    submissions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

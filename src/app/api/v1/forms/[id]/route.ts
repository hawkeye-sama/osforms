import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import Form from "@/lib/models/form";
import Integration from "@/lib/models/integration";
import Submission from "@/lib/models/submission";
import { updateFormSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

/** GET /api/v1/forms/:id - Form detail with integration + submission counts */
export async function GET(req: NextRequest, { params }: Params) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const form = await Form.findOne({ _id: id, userId: user._id }).lean();
  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  const [integrations, submissionCount] = await Promise.all([
    Integration.find({ formId: id }).select("type name enabled createdAt").lean(),
    Submission.countDocuments({ formId: id }),
  ]);

  return NextResponse.json({
    form: { ...form, submissionCount, integrationCount: integrations.length },
    integrations,
  });
}

/** PATCH /api/v1/forms/:id - Update form settings */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = updateFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const form = await Form.findOneAndUpdate(
      { _id: id, userId: user._id },
      { $set: parsed.data },
      { new: true }
    ).lean();

    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    return NextResponse.json({ form });
  } catch (err) {
    console.error("Update form error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** DELETE /api/v1/forms/:id - Delete form + all related data */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const form = await Form.findOneAndDelete({ _id: id, userId: user._id });
  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  // Cascade delete submissions and integrations
  await Promise.all([
    Submission.deleteMany({ formId: id }),
    Integration.deleteMany({ formId: id }),
  ]);

  return NextResponse.json({ success: true });
}

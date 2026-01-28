import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import Form from "@/lib/models/form";
import { createFormSchema } from "@/lib/validations";

/** GET /api/v1/forms - List all forms for the current user */
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  await connectDB();

  const forms = await Form.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ forms });
}

/** POST /api/v1/forms - Create a new form */
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = createFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const slug = nanoid(12);
    const form = await Form.create({
      userId: user._id,
      name: parsed.data.name,
      slug,
    });

    return NextResponse.json({ form }, { status: 201 });
  } catch (err) {
    console.error("Create form error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

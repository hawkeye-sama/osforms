import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { encryptJSON, decrypt } from "@/lib/encryption";
import { getHandler } from "@/lib/integrations";
import Form from "@/lib/models/form";
import Integration from "@/lib/models/integration";
import User from "@/lib/models/user";
import { createIntegrationSchema } from "@/lib/validations";

/** GET /api/v1/integrations?formId=xxx */
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const formId = new URL(req.url).searchParams.get("formId");
  if (!formId) return NextResponse.json({ error: "formId required" }, { status: 400 });

  await connectDB();

  const form = await Form.findOne({ _id: formId, userId: user._id });
  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  const integrations = await Integration.find({ formId })
    .select("type name enabled createdAt updatedAt")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ integrations });
}

/** POST /api/v1/integrations */
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = createIntegrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const { formId, type, name, config, enabled } = parsed.data;

    // Verify form ownership
    const form = await Form.findOne({ _id: formId, userId: user._id });
    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    // For EMAIL integrations, auto-inject user's saved Resend key if available
    let finalConfig = config as Record<string, unknown>;
    if (type === "EMAIL") {
      const fullUser = await User.findById(user._id);
      if (fullUser?.resendApiKey) {
        try {
          const decryptedKey = decrypt(fullUser.resendApiKey);
          // If config doesn't have an apiKey or has placeholder, use the user's saved one
          if (!finalConfig.apiKey || finalConfig.apiKey === "re_xxxx" || finalConfig.apiKey === "auto") {
            finalConfig = { ...finalConfig, apiKey: decryptedKey };
          }
        } catch (err) {
          console.error("Failed to decrypt user's Resend key:", err);
        }
      } else {
        // User hasn't saved a Resend key yet
        return NextResponse.json({ error: "Please add your Resend API key in onboarding first" }, { status: 400 });
      }
    }

    // Validate integration config
    const handler = getHandler(type);
    if (!handler) return NextResponse.json({ error: `Unsupported type: ${type}` }, { status: 400 });

    const validation = handler.validate(finalConfig);
    if (!validation.valid) {
      return NextResponse.json({ error: `Invalid config: ${validation.error}` }, { status: 400 });
    }

    const configEncrypted = encryptJSON(finalConfig);

    const integration = await Integration.create({ formId, type, name, configEncrypted, enabled });

    return NextResponse.json(
      {
        integration: {
          id: integration._id,
          type: integration.type,
          name: integration.name,
          enabled: integration.enabled,
          createdAt: integration.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create integration error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

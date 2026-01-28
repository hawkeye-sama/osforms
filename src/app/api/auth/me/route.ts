import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import User from "@/lib/models/user";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      onboardingComplete: user.onboardingComplete,
      fullName: user.fullName,
      website: user.website,
      company: user.company,
      role: user.role,
      hasResendKey: Boolean(user.resendApiKey),
    },
  });
}

/** PATCH /api/auth/me – update profile (used by onboarding) */
export async function PATCH(req: NextRequest) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    await connectDB();

    const allowedFields = [
      "fullName",
      "website",
      "company",
      "role",
      "onboardingComplete",
      "resendApiKey", // Encrypted Resend API key
    ] as const;

    const update: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        update[field] = body[field];
      }
    }

    const user = await User.findByIdAndUpdate(currentUser._id, update, {
      new: true,
    }).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboardingComplete: user.onboardingComplete,
        fullName: user.fullName,
        website: user.website,
        company: user.company,
        role: user.role,
        hasResendKey: Boolean(user.resendApiKey),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

import { setAuthCookie, signToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';
import EmailVerification from '@/lib/models/email-verification';
import User from '@/lib/models/user';
import { verifyEmailSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const { email, code } = parsed.data;

    // Find valid (non-expired) OTP
    const verification = await EmailVerification.findOne({
      email,
      code,
      expiresAt: { $gt: new Date() },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Find user and update verification status
    const user = await User.findById(verification.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user as verified
    user.isVerified = true;
    user.verifiedAt = new Date();
    await user.save();

    // Delete ALL OTP codes for this user (expire all codes)
    await EmailVerification.deleteMany({ userId: user._id });

    // Generate JWT and set auth cookie
    const token = signToken({ userId: user._id.toString(), email: user.email });
    await setAuthCookie(token);

    // Send welcome email (async, don't await so we don't delay the response)
    sendWelcomeEmail(user.email, user.name).catch((err) =>
      console.error('Failed to send welcome email:', err)
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        onboardingComplete: user.onboardingComplete,
      },
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

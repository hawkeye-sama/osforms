import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/lib/db';
import { generateOTP, sendVerificationEmail } from '@/lib/email';
import EmailVerification from '@/lib/models/email-verification';
import User from '@/lib/models/user';
import { resendOtpSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const { email } = parsed.data;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Check last OTP creation time for rate limiting (60 seconds)
    const lastOtp = await EmailVerification.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    if (lastOtp) {
      const timeSinceLastOtp = Date.now() - lastOtp.createdAt.getTime();
      const waitTime = 60 * 1000; // 60 seconds

      if (timeSinceLastOtp < waitTime) {
        const retryAfter = Math.ceil((waitTime - timeSinceLastOtp) / 1000);
        return NextResponse.json(
          {
            error: 'Please wait before requesting a new code',
            retryAfter,
          },
          { status: 429 }
        );
      }
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await EmailVerification.create({
      userId: user._id,
      email: user.email,
      code: otpCode,
      expiresAt,
    });

    // Send verification email
    await sendVerificationEmail(user.email, otpCode);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

import { hashPassword } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { generateOTP, sendVerificationEmail } from '@/lib/email';
import EmailVerification from '@/lib/models/email-verification';
import User from '@/lib/models/user';
import { signUpSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const { name, email, password } = parsed.data;

    // Check existing
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    // Generate OTP and save to database
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

    return NextResponse.json(
      {
        requiresVerification: true,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

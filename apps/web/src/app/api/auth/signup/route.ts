import { NextRequest, NextResponse } from 'next/server';

import { hashPassword } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { generateOTP, sendVerificationEmail } from '@/lib/email';
import EmailVerification from '@/lib/models/email-verification';
import User from '@/lib/models/user';
import { checkSharedRateLimit, getIP } from '@/lib/rate-limit';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { signUpSchema } from '@/lib/validations';

// Max signup attempts per IP per hour (counts failed attempts too).
const SIGNUPS_PER_IP_PER_HOUR = 5;

const CAPTCHA_ERRORS = {
  missing:
    'Spam check did not run. Reload the page, allow scripts from google.com, and try again.',
  invalid: 'Spam check failed. Reload the page and try again.',
  'low-score':
    'We could not confirm you are human. Try again, or email us if this keeps happening.',
  unavailable: 'Spam check is temporarily unavailable. Try again in a minute.',
} as const;

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

    const { name, email, password, captchaToken } = parsed.data;

    await connectDB();

    const ip = getIP(req);
    const limit = await checkSharedRateLimit(
      `signup:${ip}`,
      SIGNUPS_PER_IP_PER_HOUR,
      60 * 60 * 1000
    );
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Try again in an hour.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((limit.resetAt - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    const captcha = await verifyRecaptcha(captchaToken, 'signup', ip);
    if (!captcha.ok) {
      return NextResponse.json(
        { error: CAPTCHA_ERRORS[captcha.reason] },
        { status: captcha.reason === 'unavailable' ? 503 : 400 }
      );
    }

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

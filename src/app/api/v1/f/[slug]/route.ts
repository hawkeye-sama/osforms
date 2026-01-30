import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/lib/db';
import { executeIntegrations } from '@/lib/integrations';
import Form from '@/lib/models/form';
import Integration from '@/lib/models/integration';
import Submission from '@/lib/models/submission';
import User from '@/lib/models/user';
import { checkRateLimit, getIP } from '@/lib/rate-limit';

type Params = { params: Promise<{ slug: string }> };

/**
 * POST /api/v1/f/:slug — PUBLIC submission endpoint.
 *
 * Accepts: application/x-www-form-urlencoded, multipart/form-data, application/json
 * No auth required — this is what users point their HTML forms at.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  await connectDB();

  // ── Find form by slug ─────────────────────────────────────
  const form = await Form.findOne({ slug, active: true });
  if (!form) {
    return error('Form not found', 404, req);
  }

  // ── CORS ──────────────────────────────────────────────────
  const origin = req.headers.get('origin');
  if (form.allowedOrigins.length > 0 && origin) {
    if (!form.allowedOrigins.includes(origin)) {
      return error('Origin not allowed', 403, req);
    }
  }

  // ── Rate limit ────────────────────────────────────────────
  const ip = getIP(req);
  const rl = checkRateLimit(`submit:${form._id}:${ip}`, form.rateLimit);
  if (!rl.allowed) {
    const res = error(
      'Too many submissions. Please try again later.',
      429,
      req
    );
    res.headers.set(
      'Retry-After',
      String(Math.ceil((rl.resetAt - Date.now()) / 1000))
    );
    return res;
  }

  // ── Fetch user for monthly limit check ──────────────────────
  const user = await User.findById(form.userId);
  if (!user) {
    return error('Form owner not found', 500, req);
  }

  // ── Monthly limit with lazy reset ───────────────────────────
  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-01" format
  if (user.currentBillingMonth !== currentMonth) {
    // New month - reset counter
    await User.updateOne(
      { _id: user._id },
      { $set: { monthlySubmissionCount: 0, currentBillingMonth: currentMonth } }
    );
    user.monthlySubmissionCount = 0;
  }

  if (user.monthlySubmissionCount >= user.monthlySubmissionLimit) {
    return error(
      'Monthly submission limit reached. Resets on the 1st.',
      403,
      req
    );
  }

  // ── Parse data ────────────────────────────────────────────
  let data: Record<string, unknown>;
  try {
    data = await parseBody(req);
  } catch {
    return error('Failed to parse submission data', 400, req);
  }

  // ── Honeypot ──────────────────────────────────────────────
  if (form.honeypotField && data[form.honeypotField]) {
    // Silently accept but don't store (bot detected)
    return success(form.redirectUrl, req);
  }

  // ── reCAPTCHA ─────────────────────────────────────────────
  if (form.recaptchaSecret) {
    const token = (data['g-recaptcha-response'] ||
      data['h-captcha-response']) as string | undefined;
    if (!token) {
      return error('CAPTCHA verification required', 400, req);
    }

    const valid = await verifyCaptcha(form.recaptchaSecret, token, ip);
    if (!valid) {
      return error('CAPTCHA verification failed', 400, req);
    }

    delete data['g-recaptcha-response'];
    delete data['h-captcha-response'];
  }

  // Remove honeypot from stored data
  if (form.honeypotField) {
    delete data[form.honeypotField];
  }

  // ── Store submission ──────────────────────────────────────
  const submission = await Submission.create({
    formId: form._id,
    userId: form.userId,
    data,
    metadata: {
      ip,
      userAgent: req.headers.get('user-agent') || '',
      origin: origin || '',
    },
  });

  // Increment user's monthly submission count
  await User.updateOne(
    { _id: form.userId },
    { $inc: { monthlySubmissionCount: 1 } }
  );

  // ── Execute integrations (fire-and-forget) ────────────────
  const integrations = await Integration.find({
    formId: form._id,
    enabled: true,
  });
  if (integrations.length > 0) {
    // Run async — don't block the response
    executeIntegrations(integrations, submission, form).catch((err) =>
      console.error('[Integrations] Error:', err)
    );
  }

  return success(form.redirectUrl, req);
}

/** CORS preflight */
export async function OPTIONS(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  await connectDB();

  const form = await Form.findOne({ slug }).select('allowedOrigins').lean();
  const origin = req.headers.get('origin') || '*';

  const res = new NextResponse(null, { status: 204 });
  if (form?.allowedOrigins?.length) {
    if (form.allowedOrigins.includes(origin)) {
      res.headers.set('Access-Control-Allow-Origin', origin);
    }
  } else {
    res.headers.set('Access-Control-Allow-Origin', '*');
  }
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  res.headers.set('Access-Control-Max-Age', '86400');
  return res;
}

// ── Helpers ─────────────────────────────────────────────────

async function parseBody(req: NextRequest): Promise<Record<string, unknown>> {
  const ct = req.headers.get('content-type') || '';

  if (ct.includes('application/json')) {
    return req.json();
  }

  if (ct.includes('urlencoded') || ct.includes('multipart')) {
    const formData = await req.formData();
    const data: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        data[key] = `[File: ${value.name}, ${value.size} bytes]`;
      } else if (key in data) {
        const existing = data[key];
        data[key] = Array.isArray(existing)
          ? [...existing, value]
          : [existing, value];
      } else {
        data[key] = value;
      }
    }
    return data;
  }

  const text = await req.text();
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text };
  }
}

async function verifyCaptcha(
  secret: string,
  token: string,
  ip: string
): Promise<boolean> {
  const url = secret.startsWith('0x')
    ? 'https://hcaptcha.com/siteverify'
    : 'https://www.google.com/recaptcha/api/siteverify';

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const result = await res.json();
  return result.success === true;
}

function success(redirectUrl: string, req: NextRequest): NextResponse {
  const wantsJSON =
    req.headers.get('accept')?.includes('application/json') ||
    req.headers.get('content-type')?.includes('application/json');

  if (redirectUrl && !wantsJSON) {
    return NextResponse.redirect(redirectUrl, 303);
  }

  const res = NextResponse.json({
    success: true,
    message: 'Submission received',
  });
  setCors(res, req);
  return res;
}

function error(
  message: string,
  status: number,
  req: NextRequest
): NextResponse {
  const res = NextResponse.json({ error: message }, { status });
  setCors(res, req);
  return res;
}

function setCors(res: NextResponse, req: NextRequest) {
  res.headers.set(
    'Access-Control-Allow-Origin',
    req.headers.get('origin') || '*'
  );
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
}

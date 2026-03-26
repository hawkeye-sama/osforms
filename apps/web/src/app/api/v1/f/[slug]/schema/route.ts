import { NextRequest, NextResponse } from 'next/server';

import { connectDB } from '@/lib/db';
import Form from '@/lib/models/form';

type Params = { params: Promise<{ slug: string }> };

/**
 * GET /api/v1/f/:slug/schema — PUBLIC schema endpoint.
 *
 * Returns the FormSchema for a form, used by @osforms/react and the embed script
 * to render the form UI. No auth required — schema is public alongside the
 * submission endpoint.
 *
 * Returns { schema: FormSchema | null, formName: string }
 * schema is null for headless forms (no builder used).
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  await connectDB();

  const form = await Form.findOne({ slug, active: true }).select(
    'name formSchema allowedOrigins redirectUrl'
  );

  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  // ── CORS ─────────────────────────────────────────────────────
  const origin = req.headers.get('origin') ?? '';
  const allowed =
    form.allowedOrigins.length === 0 || form.allowedOrigins.includes(origin);

  if (!allowed) {
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 });
  }

  const response = NextResponse.json({
    schema: form.formSchema ?? null,
    formName: form.name,
    redirectUrl: form.redirectUrl || null,
  });

  // Set CORS headers so the package can fetch cross-origin
  if (form.allowedOrigins.length === 0) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  } else {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
  }

  return response;
}

/**
 * OPTIONS /api/v1/f/:slug/schema — CORS preflight
 */
export async function OPTIONS(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  await connectDB();

  const form = await Form.findOne({ slug, active: true }).select('allowedOrigins');
  if (!form) {
    return new NextResponse(null, { status: 404 });
  }

  const origin = req.headers.get('origin') ?? '';
  const allowed =
    form.allowedOrigins.length === 0 || form.allowedOrigins.includes(origin);

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (allowed) {
    headers['Access-Control-Allow-Origin'] =
      form.allowedOrigins.length === 0 ? '*' : origin;
  }

  return new NextResponse(null, { status: 204, headers });
}

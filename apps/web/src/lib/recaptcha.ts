/**
 * Google reCAPTCHA v3 verification for OSForms' own auth flows (signup).
 *
 * This is separate from the per-form CAPTCHA in /api/v1/f/[slug], which uses
 * the form owner's BYOK secret. This one uses the platform's keys from env.
 *
 * Enabled only when RECAPTCHA_SECRET_KEY is set, so local dev and self-hosted
 * installs keep working without Google keys. The browser side needs the
 * matching NEXT_PUBLIC_RECAPTCHA_SITE_KEY at build time.
 */

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const DEFAULT_MIN_SCORE = 0.5;

interface SiteVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  hostname?: string;
  challenge_ts?: string;
  'error-codes'?: string[];
}

export type CaptchaResult =
  | { ok: true; score: number | null }
  | { ok: false; reason: 'missing' | 'invalid' | 'low-score' | 'unavailable' };

export function isRecaptchaEnabled(): boolean {
  return Boolean(process.env.RECAPTCHA_SECRET_KEY);
}

function minScore(): number {
  const raw = Number(process.env.RECAPTCHA_MIN_SCORE);
  return Number.isFinite(raw) && raw >= 0 && raw <= 1 ? raw : DEFAULT_MIN_SCORE;
}

/**
 * Verify a v3 token. Checks success, that the token was minted for
 * `expectedAction`, and that the score clears RECAPTCHA_MIN_SCORE.
 * Fails closed: if Google can't be reached, the request is rejected.
 */
export async function verifyRecaptcha(
  token: string | undefined,
  expectedAction: string,
  ip: string
): Promise<CaptchaResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return { ok: true, score: null };
  }
  if (!token) {
    return { ok: false, reason: 'missing' };
  }

  let data: SiteVerifyResponse;
  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(5000),
    });
    data = (await res.json()) as SiteVerifyResponse;
  } catch (err) {
    console.error('[reCAPTCHA] siteverify request failed:', err);
    return { ok: false, reason: 'unavailable' };
  }

  if (!data.success || data.action !== expectedAction) {
    console.warn('[reCAPTCHA] rejected token', {
      action: data.action,
      expectedAction,
      errorCodes: data['error-codes'],
    });
    return { ok: false, reason: 'invalid' };
  }

  const score = typeof data.score === 'number' ? data.score : 0;
  if (score < minScore()) {
    console.warn('[reCAPTCHA] low score', {
      action: data.action,
      score,
      hostname: data.hostname,
    });
    return { ok: false, reason: 'low-score' };
  }

  return { ok: true, score };
}

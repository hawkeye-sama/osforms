/**
 * Per-form CAPTCHA verification for the public submission endpoint
 * (/api/v1/f/[slug]). The form owner brings their own secret; we pick the
 * provider from the token field the widget posted:
 *
 *   h-captcha-response    → hCaptcha
 *   cf-turnstile-response → Cloudflare Turnstile
 *   g-recaptcha-response  → Google reCAPTCHA (v2 or v3)
 *
 * The field is the reliable signal: hCaptcha secrets now start with `ES_`,
 * and Turnstile secrets start with `0x`, so guessing from the secret prefix
 * sent both to the wrong verifier. The hCaptcha widget also fills
 * `g-recaptcha-response` (reCAPTCHA compat mode), so `h-captcha-response`
 * is checked first.
 *
 * Separate from src/lib/recaptcha.ts, which protects OSForms' own signup with
 * the platform's keys.
 */

export type CaptchaProvider = 'hcaptcha' | 'turnstile' | 'recaptcha';

/** Every token field we accept. All of them are stripped from stored data. */
export const CAPTCHA_TOKEN_FIELDS = [
  'h-captcha-response',
  'cf-turnstile-response',
  'g-recaptcha-response',
] as const;

const PROVIDER_BY_FIELD: Record<
  (typeof CAPTCHA_TOKEN_FIELDS)[number],
  CaptchaProvider
> = {
  'h-captcha-response': 'hcaptcha',
  'cf-turnstile-response': 'turnstile',
  'g-recaptcha-response': 'recaptcha',
};

export const VERIFY_URLS: Record<CaptchaProvider, string> = {
  hcaptcha: 'https://api.hcaptcha.com/siteverify',
  turnstile: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  recaptcha: 'https://www.google.com/recaptcha/api/siteverify',
};

/** reCAPTCHA v3 responses carry a score (0.0 bot … 1.0 human). v2 has none. */
export const RECAPTCHA_V3_MIN_SCORE = 0.5;

const VERIFY_TIMEOUT_MS = 5000;

export interface CaptchaToken {
  provider: CaptchaProvider;
  token: string;
}

/**
 * Find the CAPTCHA token in a submission and the provider it belongs to.
 * Returns null when no non-empty token field is present.
 */
export function findCaptchaToken(
  data: Record<string, unknown>
): CaptchaToken | null {
  for (const field of CAPTCHA_TOKEN_FIELDS) {
    const value = data[field];
    if (typeof value === 'string' && value.trim() !== '') {
      return { provider: PROVIDER_BY_FIELD[field], token: value };
    }
  }
  return null;
}

interface SiteVerifyResponse {
  success?: boolean;
  score?: number;
  'error-codes'?: string[];
}

/**
 * Verify a token with its provider's siteverify endpoint. Fails closed:
 * network errors, timeouts and non-JSON replies all count as failures.
 * Never logs the token or the secret.
 */
export async function verifyFormCaptcha(
  { provider, token }: CaptchaToken,
  secret: string,
  ip: string
): Promise<boolean> {
  let result: SiteVerifyResponse;
  try {
    const res = await fetch(VERIFY_URLS[provider], {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
    result = (await res.json()) as SiteVerifyResponse;
  } catch (err) {
    console.warn('[FormCaptcha] siteverify request failed', {
      provider,
      error: err instanceof Error ? err.name : 'unknown',
    });
    return false;
  }

  if (result.success !== true) {
    console.warn('[FormCaptcha] token rejected', {
      provider,
      errorCodes: result['error-codes'],
    });
    return false;
  }

  if (
    provider === 'recaptcha' &&
    typeof result.score === 'number' &&
    result.score < RECAPTCHA_V3_MIN_SCORE
  ) {
    console.warn('[FormCaptcha] reCAPTCHA v3 score below threshold', {
      score: result.score,
      minScore: RECAPTCHA_V3_MIN_SCORE,
    });
    return false;
  }

  return true;
}

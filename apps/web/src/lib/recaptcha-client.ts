/**
 * Browser side of reCAPTCHA v3. Pair with verifyRecaptcha() in ./recaptcha.ts.
 * NEXT_PUBLIC_RECAPTCHA_SITE_KEY is inlined at build time; when it's empty,
 * the script isn't loaded and no token is sent.
 */

export const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';

export const RECAPTCHA_SCRIPT_SRC = RECAPTCHA_SITE_KEY
  ? `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
  : '';

export class RecaptchaUnavailableError extends Error {
  constructor() {
    super('reCAPTCHA script not loaded');
    this.name = 'RecaptchaUnavailableError';
  }
}

async function waitForGrecaptcha(
  timeoutMs: number
): Promise<ReCaptchaV3 | undefined> {
  const deadline = Date.now() + timeoutMs;
  while (!window.grecaptcha && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return window.grecaptcha;
}

/**
 * Mint a fresh token for `action`. Call it right before submitting: v3 tokens
 * expire after two minutes and are single-use.
 */
export async function getRecaptchaToken(
  action: string
): Promise<string | undefined> {
  if (!RECAPTCHA_SITE_KEY) {
    return undefined;
  }

  // The script loads after hydration, so a fast submit (e.g. autofill + click)
  // can land before it's ready. Wait briefly before giving up.
  const grecaptcha = await waitForGrecaptcha(5000);
  if (!grecaptcha) {
    throw new RecaptchaUnavailableError();
  }

  await new Promise<void>((resolve) => grecaptcha.ready(resolve));
  return grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
}

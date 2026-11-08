// Minimal typing for the global injected by Google's reCAPTCHA v3 script
// (https://www.google.com/recaptcha/api.js?render=<site key>).
interface ReCaptchaV3 {
  ready(callback: () => void): void;
  execute(siteKey: string, options: { action: string }): Promise<string>;
}

interface Window {
  grecaptcha?: ReCaptchaV3;
}

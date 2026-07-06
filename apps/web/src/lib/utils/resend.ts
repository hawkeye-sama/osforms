import { Resend } from 'resend';

// Shared Resend client, instantiated lazily. Creating it at module load throws
// "Missing API key" when RESEND_API_KEY is unset, which breaks `next build`
// (page-data collection evaluates importing modules) and keyless self-hosts.
let resendClient: Resend | null = null;

export function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

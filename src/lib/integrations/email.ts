import { Resend } from 'resend';

import { emailConfigSchema, type EmailConfig } from '@/lib/validations';

import type {
  IntegrationContext,
  IntegrationHandler,
  IntegrationResult,
} from './base';

function formatHTML(ctx: IntegrationContext): string {
  const rows = Object.entries(ctx.data)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:30%">${esc(k)}</td><td style="padding:8px 12px;border:1px solid #e2e8f0">${esc(String(v ?? ''))}</td></tr>`
    )
    .join('');

  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
    <h2 style="color:#1e293b">New Submission: ${esc(ctx.formName)}</h2>
    <p style="color:#64748b;margin-top:0">Received at ${ctx.submittedAt}</p>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
    <p style="color:#94a3b8;font-size:12px;margin-top:24px">FreeForms &middot; ID: ${ctx.submissionId}</p>
  </div>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendViaResend(
  config: EmailConfig,
  ctx: IntegrationContext
): Promise<IntegrationResult> {
  const resend = new Resend(config.apiKey);
  const { error } = await resend.emails.send({
    from: config.from,
    to: config.to,
    subject: `${config.subject} - ${ctx.formName}`,
    html: formatHTML(ctx),
  });
  if (error) {
    return { success: false, message: `Resend error: ${error.message}` };
  }
  return { success: true, message: 'Email sent via Resend' };
}

export const emailIntegration: IntegrationHandler = {
  type: 'EMAIL',

  validate(config) {
    const parsed = emailConfigSchema.safeParse(config);
    if (!parsed.success) {
      return { valid: false, error: parsed.error.issues[0].message };
    }
    return { valid: true };
  },

  async execute(ctx, config) {
    const c = emailConfigSchema.parse(config);
    if (c.provider === 'resend') {
      return sendViaResend(c, ctx);
    }
    return { success: false, message: `SMTP not yet supported in MVP` };
  },
};

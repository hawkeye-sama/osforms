import { Resend } from 'resend';

import { emailConfigSchema, type EmailConfig } from '@/lib/validations';

import type {
  IntegrationContext,
  IntegrationHandler,
  IntegrationResult,
} from './base';

// ── Email Field Detection ──────────────────────────────────────

const EMAIL_FIELD_CANDIDATES = [
  'email',
  'Email',
  'EMAIL',
  'e-mail',
  'E-mail',
  'user_email',
  'userEmail',
  'contact_email',
  'contactEmail',
  'mail',
  'Mail',
];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function detectEmailField(
  data: Record<string, unknown>,
  specifiedField?: string
): string | null {
  // If user specified a field, try that first
  if (specifiedField?.trim()) {
    const value = data[specifiedField.trim()];
    if (typeof value === 'string' && isValidEmail(value)) {
      return specifiedField.trim();
    }
    return null;
  }

  // Smart detection
  for (const candidate of EMAIL_FIELD_CANDIDATES) {
    const value = data[candidate];
    if (typeof value === 'string' && isValidEmail(value)) {
      return candidate;
    }
  }
  return null;
}

// ── Template Interpolation ─────────────────────────────────────

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function interpolateTemplate(
  template: string,
  ctx: IntegrationContext
): string {
  let result = template;

  // Metadata variables
  result = result.replace(/\{\{formName\}\}/g, esc(ctx.formName));
  result = result.replace(/\{\{submittedAt\}\}/g, esc(ctx.submittedAt));
  result = result.replace(/\{\{submissionId\}\}/g, esc(ctx.submissionId));

  // Data field variables
  for (const [key, value] of Object.entries(ctx.data)) {
    const regex = new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, 'g');
    result = result.replace(regex, esc(String(value ?? '')));
  }

  // Simple conditionals: {{#if fieldName}}...{{/if}}
  result = result.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, field, content) => {
      return ctx.data[field] ? content : '';
    }
  );

  // Clean unmatched variables
  result = result.replace(/\{\{[^}]+\}\}/g, '');

  return result;
}

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
    <p style="color:#94a3b8;font-size:12px;margin-top:24px">OSForms &middot; ID: ${ctx.submissionId}</p>
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

// ── Auto-Reply Sender ──────────────────────────────────────────

async function sendAutoReply(
  config: EmailConfig,
  ctx: IntegrationContext
): Promise<IntegrationResult> {
  if (!config.autoReply?.enabled) {
    return { success: true, message: 'Auto-reply disabled' };
  }

  const emailField = detectEmailField(ctx.data, config.autoReply.emailField);
  if (!emailField) {
    return {
      success: true,
      message: 'Auto-reply skipped: no valid email field found in submission',
    };
  }

  const recipientEmail = ctx.data[emailField] as string;
  const subject = interpolateTemplate(config.autoReply.subject, ctx);
  const html = interpolateTemplate(config.autoReply.htmlTemplate, ctx);

  const resend = new Resend(config.apiKey);
  const { error } = await resend.emails.send({
    from: config.from,
    to: [recipientEmail],
    subject,
    html,
  });

  if (error) {
    return { success: false, message: `Auto-reply error: ${error.message}` };
  }
  return { success: true, message: `Auto-reply sent to ${recipientEmail}` };
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
    const results: IntegrationResult[] = [];

    // 1. Notification email (existing behavior)
    if (c.provider === 'resend') {
      results.push(await sendViaResend(c, ctx));
    } else {
      results.push({ success: false, message: 'SMTP not yet supported in MVP' });
    }

    // 2. Auto-reply (new)
    if (c.autoReply?.enabled) {
      results.push(await sendAutoReply(c, ctx));
    }

    // Combine results
    const failed = results.filter((r) => !r.success);
    if (failed.length > 0) {
      return {
        success: false,
        message: failed.map((r) => r.message).join('; '),
      };
    }
    return {
      success: true,
      message: results.map((r) => r.message).join('; '),
    };
  },
};

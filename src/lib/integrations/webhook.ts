import crypto from 'crypto';

import { webhookConfigSchema, type WebhookConfig } from '@/lib/validations';

import type {
  IntegrationContext,
  IntegrationHandler,
  IntegrationResult,
} from './base';

export const webhookIntegration: IntegrationHandler = {
  type: 'WEBHOOK',

  validate(config) {
    const parsed = webhookConfigSchema.safeParse(config);
    if (!parsed.success) {
      return { valid: false, error: parsed.error.issues[0].message };
    }
    return { valid: true };
  },

  async execute(
    ctx: IntegrationContext,
    config: Record<string, unknown>
  ): Promise<IntegrationResult> {
    const c = webhookConfigSchema.parse(config) as WebhookConfig;

    const payload = JSON.stringify({
      event: 'form.submission',
      formId: ctx.formId,
      formName: ctx.formName,
      submissionId: ctx.submissionId,
      submittedAt: ctx.submittedAt,
      data: ctx.data,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'FreeForms-Webhook/1.0',
      ...c.headers,
    };

    if (c.secret) {
      headers['X-FreeForms-Signature'] = crypto
        .createHmac('sha256', c.secret)
        .update(payload)
        .digest('hex');
    }

    const res = await fetch(c.url, {
      method: c.method,
      headers,
      body: payload,
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        success: false,
        message: `Webhook ${res.status}: ${text.slice(0, 200)}`,
      };
    }

    return { success: true, message: `Webhook delivered (${res.status})` };
  },
};

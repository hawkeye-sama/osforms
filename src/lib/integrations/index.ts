import { sendIntegrationFailureEmail } from '@/lib/email';
import { decryptJSON } from '@/lib/encryption';
import type { IForm } from '@/lib/models/form';
import type { IIntegration } from '@/lib/models/integration';
import IntegrationLog from '@/lib/models/integration-log';
import type { ISubmission } from '@/lib/models/submission';
import User from '@/lib/models/user';

import type { IntegrationContext, IntegrationHandler } from './base';
import { emailIntegration } from './email';
import { googleSheetsIntegration } from './google-sheets';
import { webhookIntegration } from './webhook';

export type { IntegrationContext, IntegrationHandler };

const handlers: Record<string, IntegrationHandler> = {
  EMAIL: emailIntegration,
  WEBHOOK: webhookIntegration,
  GOOGLE_SHEETS: googleSheetsIntegration,
};

export function getHandler(type: string): IntegrationHandler | undefined {
  return handlers[type];
}

/**
 * Execute all integrations for a submission.
 * Runs each one independently — one failure doesn't block others.
 * Sends email notification to user if any integration fails.
 */
export async function executeIntegrations(
  integrations: IIntegration[],
  submission: ISubmission,
  form: IForm
) {
  const ctx: IntegrationContext = {
    submissionId: submission._id.toString(),
    formId: form._id.toString(),
    formName: form.name,
    data: submission.data,
    submittedAt:
      submission.createdAt?.toISOString() || new Date().toISOString(),
  };

  // Track failed integrations for notification
  const failedIntegrations: Array<{
    name: string;
    type: string;
    error: string;
  }> = [];

  const results = await Promise.allSettled(
    integrations.map(async (integration) => {
      const handler = handlers[integration.type];
      if (!handler) {
        console.warn(`[Integrations] No handler for type: ${integration.type}`);
        return;
      }

      let result;
      try {
        const config = decryptJSON(integration.configEncrypted);
        result = await handler.execute(ctx, config);
      } catch (err) {
        result = { success: false, message: String(err) };
      }

      // Log the result
      await IntegrationLog.create({
        integrationId: integration._id,
        submissionId: submission._id,
        status: result.success ? 'success' : 'failed',
        message: result.message,
      });

      if (!result.success) {
        console.error(
          `[Integrations] ${integration.type} failed: ${result.message}`
        );
        failedIntegrations.push({
          name: integration.name,
          type: integration.type,
          error: result.message || 'Unknown error',
        });
      }

      return result;
    })
  );

  // Send failure notification email if any integrations failed
  if (failedIntegrations.length > 0) {
    try {
      const user = await User.findById(form.userId)
        .select('email name')
        .lean();
      if (user) {
        await sendIntegrationFailureEmail({
          userEmail: user.email,
          userName: user.name,
          formName: form.name,
          formId: form._id.toString(),
          failedIntegrations,
        });
        console.info(
          `[Integrations] Failure notification sent to ${user.email}`
        );
      }
    } catch (err) {
      console.error('[Integrations] Failed to send notification email:', err);
      // Don't throw - we don't want to fail the submission if notification fails
    }
  }

  return results;
}

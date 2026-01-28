import type { IntegrationHandler, IntegrationContext } from "./base";
import { emailIntegration } from "./email";
import { webhookIntegration } from "./webhook";
import { googleSheetsIntegration } from "./google-sheets";
import { decryptJSON } from "@/lib/encryption";
import IntegrationLog from "@/lib/models/integration-log";
import type { IIntegration } from "@/lib/models/integration";
import type { ISubmission } from "@/lib/models/submission";
import type { IForm } from "@/lib/models/form";

export type { IntegrationHandler, IntegrationContext };

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
    submittedAt: submission.createdAt?.toISOString() || new Date().toISOString(),
  };

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
        status: result.success ? "success" : "failed",
        message: result.message,
      });

      if (!result.success) {
        console.error(`[Integrations] ${integration.type} failed: ${result.message}`);
      }
    })
  );

  return results;
}

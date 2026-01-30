export interface IntegrationContext {
  submissionId: string;
  formId: string;
  formName: string;
  data: Record<string, unknown>;
  submittedAt: string;
}

export interface IntegrationResult {
  success: boolean;
  message: string;
}

export interface IntegrationHandler {
  type: string;
  validate(config: Record<string, unknown>): { valid: boolean; error?: string };
  execute(
    ctx: IntegrationContext,
    config: Record<string, unknown>
  ): Promise<IntegrationResult>;
}

import { encryptJSON } from '@/lib/encryption';
import { getHandler } from '@/lib/integrations';
import Integration from '@/lib/models/integration';

export async function createOrUpdateIntegration({
  formId,
  type,
  name,
  config,
  enabled = true,
}: {
  formId: string;
  type: 'EMAIL' | 'WEBHOOK' | 'GOOGLE_SHEETS';
  name: string;
  config: Record<string, unknown>;
  enabled?: boolean;
}) {
  // 1. Validate via the handler logic you already have
  const handler = getHandler(type);
  if (!handler) {
    throw new Error(`Unsupported type: ${type}`);
  }

  const validation = handler.validate(config);
  if (!validation.valid) {
    throw new Error(`Invalid config: ${validation.error}`);
  }

  // 2. Encrypt
  const configEncrypted = encryptJSON(config);

  // 3. Upsert (Update if exists for this form, else create)
  // This is safer for Google Sheets because users might click "Connect" multiple times
  const integration = await Integration.findOneAndUpdate(
    { formId, type },
    { name, configEncrypted, enabled },
    { upsert: true, new: true }
  );

  return integration;
}

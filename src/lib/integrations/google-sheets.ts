import { google } from 'googleapis';

import { getOAuth2Client } from '@/lib/google';
import {
  googleSheetsConfigSchema,
  type GoogleSheetsConfig,
} from '@/lib/validations';

import type {
  IntegrationContext,
  IntegrationHandler,
  IntegrationResult,
} from './base';

export const googleSheetsIntegration: IntegrationHandler = {
  type: 'GOOGLE_SHEETS',

  validate(config) {
    const parsed = googleSheetsConfigSchema.safeParse(config);
    if (!parsed.success) {
      return { valid: false, error: parsed.error.issues[0].message };
    }
    return { valid: true };
  },

  async execute(
    ctx: IntegrationContext,
    config: Record<string, unknown>
  ): Promise<IntegrationResult> {
    const c = googleSheetsConfigSchema.parse(config) as GoogleSheetsConfig;
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: c.refreshToken });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // 1. Get the current header row
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: c.spreadsheetId,
      range: `${c.sheetName}!1:1`,
    });

    let currentHeaders =
      (headerRes.data.values?.[0] as string[] | undefined) || [];
    const dataKeys = Object.keys(ctx.data);
    const systemHeaders = ['Submission ID', 'Submitted At'];

    // 2. Determine if we need to add new columns
    // We check which keys in ctx.data are NOT already in currentHeaders
    const missingHeaders = dataKeys.filter(
      (key) => !currentHeaders.includes(key) && !systemHeaders.includes(key)
    );

    if (currentHeaders.length === 0) {
      // Initialize sheet if empty
      currentHeaders = [...systemHeaders, ...dataKeys];
      await sheets.spreadsheets.values.update({
        spreadsheetId: c.spreadsheetId,
        range: `${c.sheetName}!1:1`,
        valueInputOption: 'RAW',
        requestBody: { values: [currentHeaders] },
      });
    } else if (missingHeaders.length > 0) {
      // Update header row to include new fields at the end
      currentHeaders = [...currentHeaders, ...missingHeaders];
      await sheets.spreadsheets.values.update({
        spreadsheetId: c.spreadsheetId,
        range: `${c.sheetName}!1:1`,
        valueInputOption: 'RAW',
        requestBody: { values: [currentHeaders] },
      });
    }

    // 3. Map the submission data to the (now updated) header positions
    // This ensures data for "Header A" always goes in "Column A"
    const rowValues = currentHeaders.map((header) => {
      if (header === 'Submission ID') {
        return ctx.submissionId;
      }
      if (header === 'Submitted At') {
        return ctx.submittedAt;
      }

      const value = ctx.data[header];
      // Convert objects/arrays to strings to prevent [object Object] in cells
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value !== undefined ? String(value) : '';
    });

    // 4. Append the row
    await sheets.spreadsheets.values.append({
      spreadsheetId: c.spreadsheetId,
      range: `${c.sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [rowValues] },
    });

    return { success: true, message: 'Row added and headers synced' };
  },
};

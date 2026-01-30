import { google } from "googleapis";
import type { IntegrationHandler, IntegrationContext, IntegrationResult } from "./base";
import { googleSheetsConfigSchema, type GoogleSheetsConfig } from "@/lib/validations";
import { getOAuth2Client } from "@/lib/google";

export const googleSheetsIntegration: IntegrationHandler = {
  type: "GOOGLE_SHEETS",

  validate(config) {
    const parsed = googleSheetsConfigSchema.safeParse(config);
    if (!parsed.success) return { valid: false, error: parsed.error.issues[0].message };
    return { valid: true };
  },

  async execute(ctx: IntegrationContext, config: Record<string, unknown>): Promise<IntegrationResult> {
    const c = googleSheetsConfigSchema.parse(config) as GoogleSheetsConfig;

    // Use OAuth2 client with refresh token
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: c.refreshToken });

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    const range = `${c.sheetName}!A1`;

    // Get existing headers
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: c.spreadsheetId,
      range: `${c.sheetName}!1:1`,
    });

    const existingHeaders = (headerRes.data.values?.[0] as string[] | undefined) || [];
    const dataKeys = Object.keys(ctx.data);

    if (existingHeaders.length === 0) {
      // First submission: write headers + data row
      const headers = ["Submission ID", "Submitted At", ...dataKeys];
      const values = [ctx.submissionId, ctx.submittedAt, ...dataKeys.map((k) => String(ctx.data[k] ?? ""))];

      await sheets.spreadsheets.values.append({
        spreadsheetId: c.spreadsheetId,
        range,
        valueInputOption: "RAW",
        requestBody: { values: [headers, values] },
      });
    } else {
      // Match data to existing column order
      const values = existingHeaders.map((h) => {
        if (h === "Submission ID") return ctx.submissionId;
        if (h === "Submitted At") return ctx.submittedAt;
        return String(ctx.data[h] ?? "");
      });

      await sheets.spreadsheets.values.append({
        spreadsheetId: c.spreadsheetId,
        range,
        valueInputOption: "RAW",
        requestBody: { values: [values] },
      });
    }

    return { success: true, message: "Row appended to Google Sheets" };
  },
};

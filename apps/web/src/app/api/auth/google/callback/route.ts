import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser, isSafeReturnPath, verifyOAuthState } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { decryptJSON, encryptJSON } from '@/lib/encryption';
import { getOAuth2Client } from '@/lib/google';
import Form from '@/lib/models/form';
import Integration from '@/lib/models/integration';
import { createOrUpdateIntegration } from '@/lib/services/integration';
import type { GoogleSheetsConfig } from '@/lib/validations';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');

  if (!code || !stateParam) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // State must be the signed token issued by /api/auth/google/login
  const state = verifyOAuthState(stateParam);
  if (!state) {
    return NextResponse.json(
      {
        error:
          'Invalid or expired state. Start the Google Sheets connection again from your form.',
      },
      { status: 400 }
    );
  }

  const { formId } = state;
  const returnTo =
    state.returnTo && isSafeReturnPath(state.returnTo)
      ? state.returnTo
      : undefined;

  try {
    // The browser finishing the flow must be the user who started it
    const user = await getCurrentUser(request);
    if (!user || user._id.toString() !== state.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const form = await Form.findOne({ _id: formId, userId: user._id });
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const oauth2Client = getOAuth2Client();

    // 1. Swap code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.json(
        { error: 'No refresh token. Re-consent required.' },
        { status: 400 }
      );
    }

    // 2. Get user info to name the integration nicely
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    const integrationsTab = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/forms/${formId}?tab=integrations`;

    // Reconnect: swap in the new token but keep writing to the same sheet
    if (state.reconnect) {
      const existing = await Integration.findOne({
        formId: form._id,
        type: 'GOOGLE_SHEETS',
      });
      if (!existing) {
        return NextResponse.redirect(
          `${integrationsTab}&sheets=reconnect_failed`
        );
      }

      const config = decryptJSON<GoogleSheetsConfig>(existing.configEncrypted);
      try {
        // drive.file scope: only the account that created the sheet can open it
        await sheets.spreadsheets.get({
          spreadsheetId: config.spreadsheetId,
          fields: 'spreadsheetId',
        });
      } catch {
        return NextResponse.redirect(
          `${integrationsTab}&sheets=reconnect_failed`
        );
      }

      existing.configEncrypted = encryptJSON({
        ...config,
        refreshToken: tokens.refresh_token,
        email: userInfo.data.email,
      });
      await existing.save();

      return NextResponse.redirect(`${integrationsTab}&sheets=reconnected`);
    }

    // 3. Create a new Google Spreadsheet for this form
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `${form.name} Submissions`,
        },
        sheets: [
          {
            properties: {
              title: 'Sheet1',
            },
          },
        ],
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'Failed to create spreadsheet' },
        { status: 500 }
      );
    }

    // 4. Create or update the integration with all config
    await createOrUpdateIntegration({
      formId,
      type: 'GOOGLE_SHEETS',
      name: `Google Sheets (${userInfo.data.email})`,
      config: {
        refreshToken: tokens.refresh_token,
        email: userInfo.data.email,
        spreadsheetId,
        sheetName: 'Sheet1',
      },
      enabled: true,
    });

    // 5. Redirect back to your app's integration UI
    const redirectUrl = returnTo
      ? `${process.env.NEXT_PUBLIC_APP_URL}${returnTo}`
      : integrationsTab;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}

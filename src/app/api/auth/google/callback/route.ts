import { connectDB } from "@/lib/db";
import { getOAuth2Client } from "@/lib/google";
import { createOrUpdateIntegration } from "@/lib/services/integration";
import Form from "@/lib/models/form";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const formId = searchParams.get("state"); // This is the formId you passed in login

  if (!code || !formId) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    await connectDB();
    const oauth2Client = getOAuth2Client();

    // 1. Swap code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.json({ error: "No refresh token. Re-consent required." }, { status: 400 });
    }

    // 2. Get user info to name the integration nicely
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // 3. Fetch form to get the name for the spreadsheet
    const form = await Form.findById(formId);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // 4. Create a new Google Spreadsheet for this form
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `${form.name} Submissions`,
        },
        sheets: [
          {
            properties: {
              title: "Sheet1",
            },
          },
        ],
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Failed to create spreadsheet" }, { status: 500 });
    }

    // 5. Create or update the integration with all config
    await createOrUpdateIntegration({
      formId,
      type: "GOOGLE_SHEETS",
      name: `Google Sheets (${userInfo.data.email})`,
      config: {
        refreshToken: tokens.refresh_token,
        email: userInfo.data.email,
        spreadsheetId,
        sheetName: "Sheet1",
      },
      enabled: true
    });

    // 6. Redirect back to your app's integration UI
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/forms/${formId}?tab=integrations`);

  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
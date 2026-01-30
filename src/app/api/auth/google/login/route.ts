
import { getOAuth2Client } from "@/lib/google";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const queryParameters = request.nextUrl.searchParams;
  const formId = queryParameters.get("formId");

  if(!formId) {
    return NextResponse.json({ error: "No formId provided" }, { status: 400 });
  }

  const oauth2Client = getOAuth2Client();

  // Generate the URL the user needs to visit to authorize your app
  const url = oauth2Client.generateAuthUrl({
    // 'offline' is crucial. It tells Google to give us a Refresh Token.
    access_type: "offline", 
    
    // 'consent' forces the screen to appear. 
    // Without this, Google won't send a Refresh Token on subsequent logins.
    prompt: "consent", 

    state: formId, // Pass the formId in the state parameter so we can verify it later and attach oauth with a form id
    
    scope: [
      "https://www.googleapis.com/auth/userinfo.email", // To identify who they are
      "https://www.googleapis.com/auth/userinfo.profile", // To get their name
      "https://www.googleapis.com/auth/drive.file", // To create/edit sheets
    ],
  });

  return NextResponse.redirect(url);
}
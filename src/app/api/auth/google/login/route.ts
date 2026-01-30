import { NextRequest, NextResponse } from 'next/server';

import { getOAuth2Client } from '@/lib/google';

export async function GET(request: NextRequest) {
  const queryParameters = request.nextUrl.searchParams;
  const formId = queryParameters.get('formId');
  const returnTo = queryParameters.get('returnTo');

  if (!formId) {
    return NextResponse.json({ error: 'No formId provided' }, { status: 400 });
  }

  const oauth2Client = getOAuth2Client();

  // Encode formId and optional returnTo in state parameter
  const stateData = JSON.stringify({
    formId,
    ...(returnTo && { returnTo }),
  });

  // Generate the URL the user needs to visit to authorize your app
  const url = oauth2Client.generateAuthUrl({
    // 'offline' is crucial. It tells Google to give us a Refresh Token.
    access_type: 'offline',

    // 'consent' forces the screen to appear.
    // Without this, Google won't send a Refresh Token on subsequent logins.
    prompt: 'consent',

    state: stateData, // Pass formId and returnTo in state parameter

    scope: [
      'https://www.googleapis.com/auth/userinfo.email', // To identify who they are
      'https://www.googleapis.com/auth/userinfo.profile', // To get their name
      'https://www.googleapis.com/auth/drive.file', // To create/edit sheets
    ],
  });

  return NextResponse.redirect(url);
}

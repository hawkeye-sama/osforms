import { isValidObjectId } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

import { isSafeReturnPath, requireAuth, signOAuthState } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { decryptJSON } from '@/lib/encryption';
import { getOAuth2Client } from '@/lib/google';
import Form from '@/lib/models/form';
import Integration from '@/lib/models/integration';

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) {
    return error;
  }

  const queryParameters = request.nextUrl.searchParams;
  const formId = queryParameters.get('formId');
  const returnTo = queryParameters.get('returnTo');
  const reconnect = queryParameters.get('reconnect') === '1';

  if (!formId || !isValidObjectId(formId)) {
    return NextResponse.json({ error: 'No formId provided' }, { status: 400 });
  }
  if (returnTo && !isSafeReturnPath(returnTo)) {
    return NextResponse.json({ error: 'Invalid returnTo' }, { status: 400 });
  }

  await connectDB();

  // Only the form's owner may connect Google Sheets to it
  const form = await Form.exists({ _id: formId, userId: user._id });
  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  // Reconnect keeps the existing sheet, which only the Google account that
  // created it can open, so preselect that account on Google's screen
  let loginHint: string | undefined;
  if (reconnect) {
    const existing = await Integration.findOne({
      formId,
      type: 'GOOGLE_SHEETS',
    }).select('configEncrypted');
    if (!existing) {
      return NextResponse.json(
        { error: 'No Google Sheets integration to reconnect' },
        { status: 404 }
      );
    }
    loginHint = decryptJSON<{ email?: string }>(existing.configEncrypted).email;
  }

  const oauth2Client = getOAuth2Client();

  // Signed, short-lived state: the callback trusts nothing it can't verify
  const state = signOAuthState({
    userId: user._id.toString(),
    formId,
    ...(returnTo && { returnTo }),
    ...(reconnect && { reconnect }),
  });

  // Generate the URL the user needs to visit to authorize your app
  const url = oauth2Client.generateAuthUrl({
    // 'offline' is crucial. It tells Google to give us a Refresh Token.
    access_type: 'offline',

    // 'consent' forces the screen to appear.
    // Without this, Google won't send a Refresh Token on subsequent logins.
    prompt: 'consent',

    state,
    ...(loginHint && { login_hint: loginHint }),

    scope: [
      'https://www.googleapis.com/auth/userinfo.email', // To identify who they are
      'https://www.googleapis.com/auth/userinfo.profile', // To get their name
      'https://www.googleapis.com/auth/drive.file', // To create/edit sheets
    ],
  });

  return NextResponse.redirect(url);
}

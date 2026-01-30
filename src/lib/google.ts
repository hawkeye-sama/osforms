import { google } from 'googleapis';

export const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    // This MUST match exactly what you put in Google Cloud Console
    process.env.NEXT_PUBLIC_APP_URL + "/api/auth/google/callback" 
  );
};
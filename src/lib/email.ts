import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generate a cryptographically secure 6-digit OTP code
 */
export function generateOTP(): string {
  // Generate a random number between 0 and 999999
  const randomBytes = crypto.randomBytes(4);
  const randomNumber = randomBytes.readUInt32BE(0);
  const otp = (randomNumber % 1000000).toString().padStart(6, '0');
  return otp;
}

/**
 * Send verification email with OTP code
 */
export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<void> {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your osforms account</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background-color: #0a0a0a;
      color: #fafafa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 48px 24px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #fafafa;
      text-decoration: none;
      letter-spacing: -0.02em;
    }
    .card {
      background-color: #1c1c1c;
      border: 2px solid #333333;
      border-radius: 12px;
      padding: 32px;
      margin-bottom: 24px;
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #fafafa;
      margin: 0 0 16px 0;
      letter-spacing: -0.02em;
    }
    .description {
      font-size: 16px;
      color: #a8a8a8;
      line-height: 1.6;
      margin: 0 0 32px 0;
    }
    .otp-container {
      background-color: #0a0a0a;
      border: 1px solid #333333;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      margin-bottom: 24px;
    }
    .otp-label {
      font-size: 12px;
      color: #858585;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 700;
      color: #fafafa;
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      letter-spacing: 0.1em;
      margin: 0;
    }
    .expiry {
      font-size: 14px;
      color: #858585;
      margin: 16px 0 0 0;
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #616161;
      line-height: 1.6;
    }
    .footer a {
      color: #a8a8a8;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">osforms</div>
    </div>
    
    <div class="card">
      <h1 class="title">Verify your email</h1>
      <p class="description">
        Thanks for signing up! Please use the verification code below to confirm your email address and complete your account setup.
      </p>
      
      <div class="otp-container">
        <div class="otp-label">Verification Code</div>
        <p class="otp-code">${code}</p>
        <p class="expiry">This code expires in 30 minutes</p>
      </div>
      
      <p class="description">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
    
    <div class="footer">
      <p>
        This email was sent by osforms<br>
        Questions? Contact us at <a href="mailto:support@osforms.com">support@osforms.com</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const textContent = `
Verify your osforms account

Thanks for signing up! Please use the verification code below to confirm your email address:

Verification Code: ${code}

This code expires in 30 minutes.

If you didn't request this code, you can safely ignore this email.

---
This email was sent by osforms
Questions? Contact us at support@osforms.com
  `.trim();

  try {
    await resend.emails.send({
      from: 'osforms <noreply@osforms.com>',
      to: email,
      subject: 'Verify your osforms account',
      html: htmlContent,
      text: textContent,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

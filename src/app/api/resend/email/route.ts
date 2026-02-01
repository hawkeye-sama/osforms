import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

import { forwardEmail } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);
const SIGNING_SECRET = process.env.RESEND_EMAIl_SIGNING_SECRET;

export async function POST(req: NextRequest) {
  if (!SIGNING_SECRET) {
    console.error('RESEND_EMAIl_SIGNING_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook configuration error' },
      { status: 500 }
    );
  }

  try {
    const rawBody = await req.text();
    const headersList = req.headers;

    const svixId = headersList.get('svix-id');
    const svixTimestamp = headersList.get('svix-timestamp');
    const svixSignature = headersList.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: 'Missing svix headers' },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    // The resend SDK provides a built-in webhook verification helper
    const payload = resend.webhooks.verify({
      payload: rawBody,
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
      webhookSecret: SIGNING_SECRET,
    });

    // Process the event
    if (payload.type === 'email.received') {
      // The SDK types (ReceivedEmailEventData) are missing text and html fields
      // but they are present in the actual webhook payload.
      const data = payload.data as any;
      const { from, to, subject, text, html } = data;

      // Forward the email in the background
      forwardEmail({
        from,
        to,
        subject,
        text,
        html,
      }).catch((err) => console.error('Error in forwardEmail:', err));

      return NextResponse.json({ success: true, message: 'Email forwarded' });
    }

    return NextResponse.json({ success: true, message: 'Event ignored' });
  } catch (error) {
    console.error('Webhook verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }
}

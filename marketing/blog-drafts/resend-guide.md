# OSForms Implementation Guide: Zero-Cost Form Notifications (via Resend)

One of the biggest pain points in the form backend world is the "Logo Tax" and "Submission Tax." You build a contact form, and suddenly you're paying $20/month just to get an email notification without a "Powered by X" badge.

**OSForms fixes this with a "Bring Your Own Keys" (BYOK) approach.**

By using your own Resend API key, you get professional-grade email notifications for $0 (on Resend’s generous free tier).

### Prerequisites
1.  A working OSForms instance (Local or Vercel).
2.  A [Resend](https://resend.com) account.

---

### Step 1: Create your Resend API Key
Head over to your Resend dashboard and generate a new API key. Make sure you've verified your sending domain if you want to send from a custom email (e.g., `contact@yourdomain.com`).

### Step 2: Configure the Integration in OSForms
In your OSForms dashboard:
1.  Navigate to **Integrations** -> **Add Integration**.
2.  Select **Email (Resend)**.
3.  Enter your details:
    *   **API Key:** Your Resend key from Step 1.
    *   **From:** The "From" address (e.g., `onboarding@resend.dev` for test, or your verified domain).
    *   **To:** Your personal email where you want to receive alerts.
    *   **Subject:** Something descriptive (e.g., "New Lead from Marketing Site").

### Step 3: Link to your Form
Once the integration is created, go to your **Form Settings** and toggle the Resend integration to **Active**.

### Step 4: The Code
Your HTML/Next.js form doesn't need to change at all. Just point it to your OSForms endpoint:

```html
<form action="https://your-osforms.com/api/v1/f/YOUR_FORM_ID" method="POST">
  <input type="email" name="email" placeholder="Your Email" required />
  <textarea name="message" placeholder="How can we help?"></textarea>
  <button type="submit">Send Message</button>
</form>
```

### Why this is better:
-   **No Middleman:** The email is triggered directly from your Resend account via the OSForms backend.
-   **Full Branding:** There are no "Powered by OSForms" footers in your emails.
-   **Scalable:** You aren't limited by OSForms; you're only limited by Resend's free tier (currently 3,000 emails/month).

**Total Cost: $0.**
**Total Setup Time: < 2 minutes.**

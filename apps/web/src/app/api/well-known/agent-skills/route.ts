import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

// Agent Skills discovery — served at /.well-known/agent-skills/index.json via a
// rewrite. Tells autonomous agents what OSForms can do and how to invoke it.
export function GET() {
  const doc = {
    version: '1.0',
    name: 'OSForms',
    description:
      'Open-source, bring-your-own-key form backend. Submit form data to an endpoint; it is stored and routed to the form owner’s own integrations (Resend email, Google Sheets, webhooks).',
    homepage: SITE_URL,
    documentation: `${SITE_URL}/docs`,
    skills: [
      {
        name: 'submit-form',
        description:
          'Submit data to an OSForms form. Stores the submission and triggers the form’s configured integrations.',
        method: 'POST',
        endpoint: `${SITE_URL}/api/v1/f/{slug}`,
        contentTypes: [
          'application/json',
          'application/x-www-form-urlencoded',
          'multipart/form-data',
        ],
        auth: 'none (public per-form endpoint)',
        response:
          'JSON { "success": true } unless the form has a redirect URL configured.',
        documentation: `${SITE_URL}/docs`,
      },
    ],
  };

  return new Response(JSON.stringify(doc, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

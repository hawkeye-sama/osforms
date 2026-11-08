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
          'JSON requests (Content-Type or Accept application/json) always get JSON { "success": true, "message": "Submission received" }. HTML form posts get a 303 redirect when the form has a redirect URL set, otherwise the same JSON.',
        documentation: `${SITE_URL}/docs/api-reference/submit-form`,
      },
      {
        name: 'pull-submissions',
        description:
          'Read a form’s stored submissions. Read-only; the API key only sees the forms it was scoped to. The form query parameter accepts the form ID or its endpoint slug. Rate limited to 60 requests per minute per key.',
        method: 'GET',
        endpoint: `${SITE_URL}/api/v1/submissions?formId={formIdOrSlug}`,
        contentTypes: ['application/json'],
        auth: 'Authorization: Bearer osf_live_... (API key created in Dashboard → Settings → API Keys)',
        response:
          'JSON { "data": [{ "id", "formId", "submittedAt", "fields" }], "nextCursor", "hasMore" }. Optional query: limit (1-100, default 25), cursor, since (ISO 8601), order (asc|desc), fields (comma-separated). Single submission: GET /api/v1/submissions/{id}.',
        documentation: `${SITE_URL}/docs/api-reference/pull-submissions`,
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

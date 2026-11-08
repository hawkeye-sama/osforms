import type { DigestEncoding } from './webhook-signature-hmac';

/**
 * How popular senders sign webhooks. Every entry is taken from the sender's
 * own docs (linked in `docsUrl`) or, for OSForms, from
 * src/lib/integrations/webhook.ts. Last checked November 2026.
 *
 * Plain data (no 'use client'), so the server page and the client tool both
 * import it directly.
 */

export type PresetId = 'custom' | 'osforms' | 'github' | 'stripe' | 'shopify';

export interface PresetExample {
  payload: string;
  secret: string;
  /** What the sender would put in the header for this payload + secret. */
  signature: string;
  /** Where the example comes from, shown next to the "Load example" button. */
  source: string;
}

export interface WebhookPreset {
  id: PresetId;
  name: string;
  /** Header the signature arrives in. */
  header: string | null;
  /** Value format as shown in docs, e.g. `sha256=<hex>`. */
  format: string;
  encoding: DigestEncoding;
  /** What the HMAC is computed over. */
  signs: string;
  /** What the HMAC key is. */
  key: string;
  /** Stripe-style `<timestamp>.<body>` signing. */
  usesTimestamp: boolean;
  /** Prefix the sender puts before the digest. */
  prefix: string;
  docsUrl: string | null;
  docsLabel: string | null;
  note: string;
  example: PresetExample | null;
}

const OSFORMS_EXAMPLE_PAYLOAD = JSON.stringify({
  event: 'form.submission',
  formId: '64f1a2b3c4d5e6f7a8b9c0d2',
  formName: 'Contact Form',
  submissionId: '64f1a2b3c4d5e6f7a8b9c0d1',
  submittedAt: '2026-11-08T09:14:02.511Z',
  data: { name: 'Ada', email: 'ada@example.com', message: 'Hi' },
});

export const PRESETS: WebhookPreset[] = [
  {
    id: 'custom',
    name: 'Custom',
    header: null,
    format: '<digest>',
    encoding: 'hex',
    signs: 'Whatever you paste as the payload',
    key: 'The secret you enter',
    usesTimestamp: false,
    prefix: '',
    docsUrl: null,
    docsLabel: null,
    note: 'Plain HMAC generator. Pick the algorithm and output encoding yourself.',
    example: null,
  },
  {
    id: 'osforms',
    name: 'OSForms',
    header: 'X-osforms-Signature',
    format: '<hex>',
    encoding: 'hex',
    signs: 'The exact raw JSON request body',
    key: 'The signing secret you set on the webhook',
    usesTimestamp: false,
    prefix: '',
    docsUrl: '/docs/integrations/webhooks',
    docsLabel: 'OSForms webhook docs',
    note: 'Lowercase hex HMAC-SHA256 with no prefix and no timestamp. The header is only sent when the webhook has a signing secret.',
    example: {
      payload: OSFORMS_EXAMPLE_PAYLOAD,
      secret: 'my-signing-secret',
      signature:
        '5a0e242ab2051668949fc23cd0709a59945ff71e8d261e0e376249e344908d66',
      source: 'Sample submission payload with a made-up secret',
    },
  },
  {
    id: 'github',
    name: 'GitHub',
    header: 'X-Hub-Signature-256',
    format: 'sha256=<hex>',
    encoding: 'hex',
    signs: 'The raw request body (payload)',
    key: "Your webhook's secret token",
    usesTimestamp: false,
    prefix: 'sha256=',
    docsUrl:
      'https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries',
    docsLabel: 'GitHub: Validating webhook deliveries',
    note: 'The value always starts with sha256=. The older X-Hub-Signature header uses HMAC-SHA1 and exists only for legacy reasons.',
    example: {
      payload: 'Hello, World!',
      secret: "It's a Secret to Everybody",
      signature:
        'sha256=757107ea0eb2509fc211221cce984b8a37570b6d7586c22c46f4379c8b043e17',
      source: "Test values from GitHub's docs",
    },
  },
  {
    id: 'stripe',
    name: 'Stripe',
    header: 'Stripe-Signature',
    format: 't=<unix>,v1=<hex>',
    encoding: 'hex',
    signs: '<timestamp>.<raw body> (the t= value, a dot, then the body)',
    key: 'The endpoint signing secret (starts with whsec_)',
    usesTimestamp: true,
    prefix: '',
    docsUrl: 'https://docs.stripe.com/webhooks#verify-manually',
    docsLabel: 'Stripe: Verify webhook signatures manually',
    note: "Only v1 is a live scheme; ignore v0 and anything else. Stripe's libraries also reject timestamps older than 5 minutes by default. This tool checks the HMAC only, not the age.",
    example: {
      payload:
        '{"id":"evt_test_webhook","object":"event","type":"payment_intent.succeeded"}',
      secret: 'whsec_test_secret',
      signature:
        't=1492774577,v1=add268875c77da0b0493b2ae7deba5dabc736b8c4b5a40755158e5471b4c3fe2',
      source: 'Made-up event and secret, not a real Stripe delivery',
    },
  },
  {
    id: 'shopify',
    name: 'Shopify',
    header: 'X-Shopify-Hmac-SHA256',
    format: '<base64>',
    encoding: 'base64',
    signs: 'The raw request body',
    key: "Your app's client secret",
    usesTimestamp: false,
    prefix: '',
    docsUrl: 'https://shopify.dev/docs/apps/build/webhooks/subscribe/https',
    docsLabel: 'Shopify: Deliver webhooks through HTTPS',
    note: 'Base64, not hex. After you rotate the client secret, Shopify says it can take up to an hour before digests use the new one.',
    example: {
      payload: '{"id":820982911946154500,"email":"jon@example.com"}',
      secret: 'my-app-client-secret',
      signature: 'g2J/HlfCpQ+/q9AwtXhcF3mOOOtBrdl4kHpAOqKHlr4=',
      source: 'Made-up payload and secret, not a real Shopify delivery',
    },
  },
];

export function getPreset(id: PresetId): WebhookPreset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}

/** The header value a sender would produce for this digest. */
export function formatHeaderValue(
  preset: WebhookPreset,
  digest: string,
  timestamp: string | null
): string {
  if (preset.usesTimestamp) {
    return `t=${timestamp ?? '<timestamp>'},v1=${digest}`;
  }
  return `${preset.prefix}${digest}`;
}

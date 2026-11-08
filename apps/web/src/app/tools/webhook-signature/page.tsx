import { Lock } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { CursorGridGlow } from '@/components/blog/cursor-grid-glow';
import { Footer } from '@/components/layout/footer';
import { LandingNavbar } from '@/components/layout/landing-navbar';
import { WebhookSignatureCopyButton } from '@/components/tools/webhook-signature-copy-button';
import { PRESETS } from '@/components/tools/webhook-signature-presets';
import { WebhookSignatureTool } from '@/components/tools/webhook-signature-tool';
import { Button } from '@/components/ui/button';
import { SITE_URL } from '@/lib/site';
import { GITHUB_REPO_URL, ORGANIZATION_ID } from '@/lib/structured-data';

const PAGE_PATH = '/tools/webhook-signature';
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
// The root layout's "%s | OSForms" template is appended to this.
const TITLE = 'Webhook Signature Verifier (HMAC-SHA256)';
const H1 = 'Webhook Signature Verifier & HMAC-SHA256 Generator';
const DESCRIPTION =
  'Free HMAC-SHA256 generator and webhook signature verifier. Check GitHub, Stripe, Shopify and OSForms signatures in hex or base64, right in your browser.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'webhook signature verifier',
    'hmac sha256 generator',
    'hmac sha256 online',
    'verify webhook signature online',
    'webhook hmac',
    'x-hub-signature-256',
    'stripe-signature',
    'x-shopify-hmac-sha256',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `${TITLE} | OSForms`,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    siteName: 'OSForms',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'OSForms webhook signature verifier',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | OSForms`,
    description: DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
  },
};

const FAQ = [
  {
    question: 'Is it safe to paste my webhook secret into this tool?',
    answer:
      'The HMAC is computed in your browser with the Web Crypto API. The page sends no request containing your payload, secret or signature, and stores nothing. For a production secret, the safest habit is still to test with a staging secret, or rotate the secret afterwards if your policy requires it.',
  },
  {
    question: "Why doesn't my computed signature match the header?",
    answer:
      'You are almost always hashing different bytes than the sender did. Common causes: the body was parsed and re-serialized, a trailing newline was added or dropped, the secret is from another environment or has a stray space, the header is base64 while you compare hex, or (for Stripe) the timestamp was left out of the signed string.',
  },
  {
    question: 'Should a webhook signature be hex or base64?',
    answer:
      'Whatever the sender documents. Both encode the same 32 bytes for HMAC-SHA256: hex as 64 characters, base64 as 44. OSForms and GitHub send lowercase hex, Shopify sends base64. When you verify here, the tool accepts either and tells you which one it read.',
  },
  {
    question: 'Does a valid signature protect against replay attacks?',
    answer:
      'No. A signature proves who sent the body and that it was not changed, not that it is the first delivery. Stripe signs a timestamp with the body so you can reject old requests. OSForms and GitHub sign the body only, so record each event ID you process (the submissionId for OSForms) and skip repeats.',
  },
  {
    question: 'Can I verify a Stripe-Signature header here?',
    answer:
      'Yes. Choose the Stripe preset, paste the raw body and your whsec_ secret, then paste the whole Stripe-Signature header. The tool signs "timestamp.body" and checks it against every v1 value. It does not check the 5-minute age limit that Stripe libraries apply, so use the official library in production.',
  },
];

const NODE_VERIFY = `// verify-webhook.mjs (Node.js 18+)
import crypto from 'node:crypto';

export function verifySignature(rawBody, header, secret, options = {}) {
  const { prefix = '', encoding = 'hex' } = options;
  if (typeof header !== 'string' || !header.startsWith(prefix)) {
    return false;
  }
  const received = Buffer.from(header.slice(prefix.length), 'utf8');
  const expected = Buffer.from(
    crypto.createHmac('sha256', secret).update(rawBody).digest(encoding),
    'utf8'
  );
  // timingSafeEqual throws when lengths differ, so check that first
  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected)
  );
}

// OSForms: verifySignature(raw, req.get('x-osforms-signature'), secret)
// GitHub:  verifySignature(raw, req.get('x-hub-signature-256'), secret, { prefix: 'sha256=' })
// Shopify: verifySignature(raw, req.get('x-shopify-hmac-sha256'), secret, { encoding: 'base64' })`;

const NODE_EXPRESS = `// server.mjs
import express from 'express';
import { verifySignature } from './verify-webhook.mjs';

const app = express();

// Raw body on the webhook route. Register it before any app.use(express.json()).
app.post(
  '/webhooks/osforms',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const ok =
      Buffer.isBuffer(req.body) &&
      verifySignature(
        req.body,
        req.get('x-osforms-signature'),
        process.env.OSFORMS_WEBHOOK_SECRET
      );
    if (!ok) {
      return res.status(401).send('Invalid signature');
    }
    const event = JSON.parse(req.body.toString('utf8'));
    console.log('Submission', event.submissionId, event.data);
    res.sendStatus(200);
  }
);

app.listen(3000);`;

const PYTHON_VERIFY = `# verify_webhook.py (Python 3.8+, Flask 2+)
import hashlib
import hmac
import json
import os

from flask import Flask, abort, request


def verify_signature(raw_body: bytes, header: str, secret: str, prefix: str = "") -> bool:
    if not header or not header.startswith(prefix):
        return False
    expected = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    # compare_digest is constant-time; comparing bytes means odd header text can't raise
    return hmac.compare_digest(header[len(prefix):].encode(), expected.encode())


app = Flask(__name__)


@app.post("/webhooks/osforms")
def osforms_webhook():
    raw = request.get_data()  # exact bytes, read before any JSON parsing
    signature = request.headers.get("X-osforms-Signature", "")
    if not verify_signature(raw, signature, os.environ["OSFORMS_WEBHOOK_SECRET"]):
        abort(401)
    event = json.loads(raw)
    print("Submission", event["submissionId"], event["data"])
    return {"ok": True}`;

/** Long inline code (Python one-liners, header values) wraps instead of widening the page. */
const CODE_WRAP = '[&_:not(pre)>code]:[overflow-wrap:anywhere]';

function CodeBlock({ filename, code }: { filename: string; code: string }) {
  return (
    <figure className="border-border my-6 min-w-0 overflow-hidden rounded-xl border">
      <figcaption className="border-border bg-card flex items-center justify-between gap-3 border-b px-4 py-2">
        <span className="text-muted-foreground font-mono text-xs">
          {filename}
        </span>
        <WebhookSignatureCopyButton value={code} label={`Copy ${filename}`} />
      </figcaption>
      <pre className="bg-background overflow-x-auto p-4 text-[13px] leading-relaxed sm:p-5">
        <code className="text-foreground font-mono">{code}</code>
      </pre>
    </figure>
  );
}

export default function WebhookSignaturePage() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': `${PAGE_URL}#app`,
      name: 'Webhook Signature Verifier',
      alternateName: 'HMAC-SHA256 Generator',
      url: PAGE_URL,
      description: DESCRIPTION,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      browserRequirements: 'Requires a browser with the Web Crypto API',
      isAccessibleForFree: true,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'HMAC-SHA256, HMAC-SHA1 and HMAC-SHA512',
        'Hex and base64 output',
        'Verify a received signature, including sha256= and Stripe t=,v1= formats',
        'Presets for OSForms, GitHub, Stripe and Shopify webhooks',
        'Runs entirely in the browser',
      ],
      publisher: { '@id': ORGANIZATION_ID },
      creator: { '@id': ORGANIZATION_ID },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Webhook Signature Verifier',
          item: PAGE_URL,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ];

  const senders = PRESETS.filter((p) => p.header);

  return (
    <div className="dark bg-background text-foreground relative min-h-screen">
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <div className="bg-grid-glow pointer-events-none fixed inset-0" />
      <CursorGridGlow />
      <LandingNavbar />

      <main className="relative pt-28 pb-24 sm:pt-36">
        <div className="mx-auto max-w-6xl px-8">
          <nav
            aria-label="Breadcrumb"
            className="text-muted-foreground mb-6 flex items-center gap-2 font-mono text-xs tracking-widest uppercase"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="text-muted-foreground/50" aria-hidden="true">
              /
            </span>
            <span className="text-foreground" aria-current="page">
              Webhook signature verifier
            </span>
          </nav>

          <header className="mb-12 max-w-3xl">
            <h1 className="text-foreground text-3xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl">
              {H1}
            </h1>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              Paste a webhook&apos;s raw body, the signing secret and the
              signature header. The tool computes the HMAC (SHA-256 by default)
              in hex or base64 and tells you whether it matches what the sender
              sent. Presets cover OSForms, GitHub, Stripe and Shopify.
            </p>
            <p className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
              <Lock className="text-foreground h-4 w-4 shrink-0" aria-hidden />
              Runs in your browser; nothing is uploaded.
            </p>
          </header>

          <WebhookSignatureTool />

          <article
            className={`blog-content mx-auto mt-20 max-w-3xl ${CODE_WRAP}`}
          >
            <h2>What is an HMAC webhook signature?</h2>
            <p>
              A webhook is an HTTP request a service sends to your URL when
              something happens: a payment succeeds, a form is submitted, a
              commit is pushed. Anyone who finds that URL can post to it too, so
              senders sign each request. They compute an HMAC (hash-based
              message authentication code) over the request body using a secret
              that only you and they know, and put the result in a header.
            </p>
            <p>
              Your server repeats the calculation on the bytes it received. If
              its result equals the header, the request came from someone
              holding the secret and the body was not changed on the way.
              HMAC-SHA256 is the usual choice: 32 bytes of output, written as 64
              hex characters or 44 base64 characters. The tool above does the
              same calculation your server should, so you can check a captured
              request by hand before debugging your code.
            </p>

            <h2>How popular senders sign webhooks</h2>
            <div className="my-6 overflow-x-auto [&_td]:px-2! sm:[&_td]:px-4! [&_th]:px-2! sm:[&_th]:px-4!">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Sender</th>
                    <th scope="col">Header</th>
                    <th scope="col">Value</th>
                    <th scope="col">Signed content</th>
                  </tr>
                </thead>
                <tbody>
                  {senders.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.docsUrl ? (
                          <a
                            href={p.docsUrl}
                            {...(p.docsUrl.startsWith('http')
                              ? { target: '_blank', rel: 'noopener noreferrer' }
                              : {})}
                          >
                            {p.name}
                          </a>
                        ) : (
                          p.name
                        )}
                      </td>
                      <td>
                        <code>{p.header}</code>
                      </td>
                      <td>
                        <code>{p.format}</code>
                      </td>
                      <td>{p.signs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm">
              Each row links to the sender&apos;s own documentation. Checked
              November 2026.
            </p>

            <h2>4 common webhook signature mistakes</h2>
            <h3>1. Signing parsed JSON instead of the raw body</h3>
            <p>
              Body parsers turn bytes into objects, and turning the object back
              into a string with <code>JSON.stringify</code> or{' '}
              <code>json.dumps</code> rarely gives the same bytes: whitespace,
              key order, unicode escapes and number formatting can all change.
              Hash the raw body first, then parse it. In Express that means{' '}
              <code>express.raw()</code> on the webhook route, in a Next.js
              Route Handler <code>await req.text()</code>, and in Flask{' '}
              <code>request.get_data()</code>.
            </p>
            <h3>2. Comparing with == instead of a constant-time function</h3>
            <p>
              A normal string comparison stops at the first different character,
              so its timing leaks how much of a forged signature was right. Use{' '}
              <code>crypto.timingSafeEqual</code> in Node.js (check the lengths
              first, because it throws when they differ) or{' '}
              <code>hmac.compare_digest</code> in Python.
            </p>
            <h3>3. Mixing up hex and base64</h3>
            <p>
              The same 32 bytes can be written two ways. OSForms and GitHub send
              hex, Shopify sends base64, and comparing one against the other
              always fails. Prefixes matter too: GitHub puts{' '}
              <code>sha256=</code> in front of the digest. Paste a header into
              the tool and it tells you which encoding it read.
            </p>
            <h3>4. Ignoring replay protection</h3>
            <p>
              A valid signature proves who sent the body, not that you are
              seeing it for the first time. Anyone who captures a signed request
              can send it again. Stripe signs a timestamp along with the body,
              and its libraries reject requests older than five minutes by
              default. OSForms and GitHub sign the body only, so store the IDs
              you have processed and skip repeats. For OSForms that is the{' '}
              <code>submissionId</code> inside the signed body, and since
              OSForms does not retry webhooks, a repeated ID is never a
              legitimate redelivery.
            </p>

            <h2>Verify a webhook signature in Node.js</h2>
            <p>
              One function covers hex and base64 senders, with an optional
              prefix. It uses only the built-in <code>node:crypto</code> module:
            </p>
            <CodeBlock filename="verify-webhook.mjs" code={NODE_VERIFY} />
            <p>
              And an Express route that reads the raw body before checking it:
            </p>
            <CodeBlock filename="server.mjs" code={NODE_EXPRESS} />
            {/* TODO(after 2026-11-23): link the full Node.js guide at
                /verify-webhook-signature-nodejs here once that post is live. */}

            <h2>Verify a webhook signature in Python</h2>
            <p>
              The standard library has everything you need. With Flask,{' '}
              <code>request.get_data()</code> returns the exact bytes:
            </p>
            <CodeBlock filename="verify_webhook.py" code={PYTHON_VERIFY} />
            <p>
              For a base64 sender such as Shopify, build the expected value with{' '}
              <code>
                base64.b64encode(hmac.new(secret.encode(), raw_body,
                hashlib.sha256).digest()).decode()
              </code>{' '}
              and compare it the same way.
            </p>

            <p>
              The{' '}
              <Link href="/docs/integrations/webhooks" prefetch={false}>
                OSForms webhook docs
              </Link>{' '}
              list every payload field and the request timeout. If you are still
              choosing where form data should go, start with{' '}
              <Link href="/handle-form-submissions">
                how to handle form submissions without a backend
              </Link>
              .
            </p>
          </article>

          {/* ── FAQ (same data as the FAQPage JSON-LD above) ── */}
          <section
            className="mx-auto mt-16 max-w-3xl"
            aria-labelledby="faq-heading"
          >
            <h2
              id="faq-heading"
              className="text-foreground mb-6 text-2xl font-semibold tracking-tight"
            >
              Frequently asked questions
            </h2>
            <div className="border-border border-t">
              {FAQ.map((item, i) => (
                <div
                  key={item.question}
                  className="border-border grid grid-cols-[2rem_1fr] gap-x-4 border-b py-6"
                >
                  <span className="text-muted-foreground/70 font-mono text-sm tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-foreground mb-2 font-semibold">
                      {item.question}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <div className="border-border bg-card/40 mx-auto mt-16 max-w-3xl rounded-xl border p-6 text-center sm:p-10">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              Receive form submissions as signed webhooks with OSForms
            </h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
              Point your HTML or React form at OSForms and get every submission
              as a JSON webhook signed with HMAC-SHA256. 100 free submissions a
              month, every integration included.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="focus-visible:ring-offset-background px-6"
              >
                <Link href="/signup">Get Started Free →</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-foreground focus-visible:ring-offset-background px-6"
              >
                <a
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ★ Star on GitHub
                </a>
              </Button>
            </div>
            <p className="text-muted-foreground mt-3 text-xs">
              Open source (MIT). Self-host it if you prefer.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

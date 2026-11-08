import type { Metadata } from 'next';
import Link from 'next/link';

import { CursorGridGlow } from '@/components/blog/cursor-grid-glow';
import { Footer } from '@/components/layout/footer';
import { LandingNavbar } from '@/components/layout/landing-navbar';
import { HtmlFormGeneratorTool } from '@/components/tools/html-form-generator-tool';
import { Button } from '@/components/ui/button';
import { SITE_URL } from '@/lib/site';
import {
  GITHUB_REPO_URL,
  ORGANIZATION_ID,
  WEBSITE_ID,
} from '@/lib/structured-data';

const PAGE_URL = `${SITE_URL}/tools/html-form-generator`;
const TITLE = 'Free HTML Contact Form Generator';
const DESCRIPTION =
  'Free HTML contact form generator. Pick fields, add a honeypot, preview it live and copy accessible form code for OSForms or any backend. No signup needed.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'html form generator',
    'contact form generator',
    'html contact form generator',
    'contact form code generator',
    'html form builder',
    'contact form html code',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `${TITLE} | OSForms`,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
  },
  twitter: {
    title: `${TITLE} | OSForms`,
    description: DESCRIPTION,
  },
};

const FAQ = [
  {
    question: 'Is this HTML form generator free?',
    answer:
      'Yes. It runs entirely in your browser, so nothing you type is sent anywhere and there is no signup. The output is plain HTML you can use on any site, with OSForms or with any other backend.',
  },
  {
    question: 'Does the generated contact form need JavaScript?',
    answer:
      'No. The default output is a plain HTML form that posts to your action URL and works with JavaScript turned off. The optional fetch version adds a small script that sends JSON and shows a success message on the page. If that script fails to load, the form still posts normally.',
  },
  {
    question: 'Where do contact form submissions go?',
    answer:
      "To the URL in the form's action attribute. With an OSForms endpoint, each submission is stored in your dashboard and forwarded to the integrations you connect: email through your own Resend key, a Google Sheet, or a webhook.",
  },
  {
    question: 'How do I stop spam on an HTML contact form?',
    answer:
      'Start with the honeypot field this generator adds, and set the same field name in your form backend so it can drop submissions that fill it in. If spam still gets through, add reCAPTCHA, hCaptcha, or Cloudflare Turnstile. OSForms verifies all three with your own secret key and rate limits each form per IP address.',
  },
  {
    question: 'Can I use the generated form without OSForms?',
    answer:
      'Yes. Change the action URL to any endpoint that accepts a POST, such as your own server route or a serverless function. The name attributes become the keys your backend receives. If you keep the honeypot, make your backend reject submissions where hp_company_site has a value.',
  },
];

/** Long inline code (URL-encoded bodies, endpoints) wraps instead of widening the page. */
const CODE_WRAP = '[&_:not(pre)>code]:[overflow-wrap:anywhere]';

function JsonLd() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': `${PAGE_URL}#app`,
      name: 'HTML Contact Form Generator',
      url: PAGE_URL,
      description: DESCRIPTION,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      inLanguage: 'en',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Field builder with name, email, phone, subject, message, company, dropdown and consent checkbox presets',
        'Accessible output with label/id pairs, required, input types and autocomplete',
        'Optional honeypot spam field',
        'Unstyled or basic CSS output',
        'Plain HTML post or JavaScript fetch submit',
        'Live sandboxed preview and copy to clipboard',
      ],
      isPartOf: { '@id': WEBSITE_ID },
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
          name: 'HTML Contact Form Generator',
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

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

export default function HtmlFormGeneratorPage() {
  return (
    <div className="dark bg-background text-foreground relative min-h-screen">
      <JsonLd />
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
              HTML Form Generator
            </span>
          </nav>

          <header className="mb-12 max-w-3xl">
            <p className="text-muted-foreground mb-4 font-mono text-[11px] tracking-widest uppercase">
              Free tool · Runs in your browser
            </p>
            <h1 className="text-foreground text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl">
              {TITLE}
            </h1>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
              Build a contact form, preview it, and copy clean, accessible HTML.
              Pick your fields, add a honeypot for spam, and point the form at
              OSForms or any backend that accepts a POST. Nothing leaves your
              browser and there&apos;s no signup.
            </p>
          </header>

          <HtmlFormGeneratorTool />

          {/* ── CTA ─────────────────────────────── */}
          <aside
            aria-labelledby="cta-heading"
            className="border-border bg-card/40 mt-16 rounded-xl border p-6 text-center sm:p-10"
          >
            <h2
              id="cta-heading"
              className="text-foreground text-xl font-bold tracking-tight"
            >
              Get a free endpoint for this form
            </h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-sm leading-relaxed">
              100 submissions/month, with email, Google Sheets, and webhooks
              running on your own keys. Paste the endpoint into the action URL
              above and you&apos;re done.
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
          </aside>

          {/* ── Explainer ───────────────────────── */}
          <article
            className={`blog-content mx-auto mt-20 max-w-3xl ${CODE_WRAP}`}
          >
            <h2>How an HTML contact form gets submitted</h2>
            <p>
              A <code>&lt;form&gt;</code> element on its own doesn&apos;t send
              email. When someone clicks submit, the browser collects every
              field that has a <code>name</code> attribute and sends it to the
              URL in <code>action</code>, using the <code>method</code> you set.
              For a contact form that&apos;s a <code>POST</code> with a body
              like{' '}
              <code>name=Jane&amp;email=jane%40example.com&amp;message=Hi</code>
              .
            </p>
            <p>
              Something has to be listening at that URL. A static site on GitHub
              Pages or an S3 bucket can serve your HTML but can&apos;t accept a
              POST, so the submission goes nowhere. You have three options:
              write your own server route, deploy a serverless function, or
              point <code>action</code> at a form backend that stores the
              submission and forwards it. The tradeoffs are covered in{' '}
              <Link href="/handle-form-submissions">
                How to Handle Form Submissions Without a Backend
              </Link>
              .
            </p>
            <p>
              The generator above writes the form half. The <code>name</code>{' '}
              attributes become the keys you see in your inbox or spreadsheet,
              so keep them short and stable: <code>email</code>, not{' '}
              <code>Your Email Address</code>.
            </p>

            <h2>The contact form fields that matter</h2>
            <p>
              Most contact forms need three fields: name, email, and message.
              Each extra field costs you completions, so add phone, company, or
              a topic dropdown only when you&apos;ll act on the answer.
            </p>
            <ul>
              <li>
                <strong>Email</strong> uses <code>type=&quot;email&quot;</code>,
                so phones show a keyboard with <code>@</code> and the browser
                checks the format before sending.
              </li>
              <li>
                <strong>Autocomplete tokens</strong> (<code>name</code>,{' '}
                <code>email</code>, <code>tel</code>, <code>organization</code>)
                let browsers fill fields in one tap.
              </li>
              <li>
                <strong>Message</strong> is a <code>&lt;textarea&gt;</code>, so
                longer messages stay readable while typing.
              </li>
              <li>
                <strong>Dropdowns</strong> start with an empty option, so{' '}
                <code>required</code> forces a real choice instead of quietly
                sending the first value.
              </li>
              <li>
                <strong>Consent checkbox</strong>: add one if your privacy
                policy says you ask for it. It sends <code>yes</code> when
                ticked and nothing when it isn&apos;t.
              </li>
            </ul>

            <h2>Spam protection: honeypot and CAPTCHA</h2>
            <p>
              A honeypot is a field people can&apos;t see but bots fill in,
              because they complete every input they find. The generator moves
              it off-screen instead of using <code>display:none</code> (some
              bots skip fields hidden that way), takes it out of the tab order
              with <code>tabindex=&quot;-1&quot;</code>, hides it from screen
              readers with <code>aria-hidden=&quot;true&quot;</code>, and turns
              off autocomplete. The name <code>hp_company_site</code> is
              deliberately odd so browsers and password managers leave it alone.
            </p>
            <p>
              In OSForms the honeypot is opt-in per form. Open the form&apos;s
              Settings and set <strong>Honeypot Field Name</strong> to{' '}
              <code>hp_company_site</code>; the names must match exactly. When a
              submission arrives with that field filled in, OSForms returns a
              normal success response but doesn&apos;t store it, so the bot gets
              no signal that it was caught.
            </p>
            <p>
              Honeypots stop basic bots. For targeted spam, add a CAPTCHA.
              OSForms verifies Google reCAPTCHA (v2 and v3), hCaptcha, and
              Cloudflare Turnstile with your own secret key. Add the
              provider&apos;s widget to the form with your site key. OSForms
              picks the verifier from the token field the widget posts (
              <code>g-recaptcha-response</code>, <code>h-captcha-response</code>
              , or <code>cf-turnstile-response</code>) and strips the token
              before storing the submission. The secret is saved on the form as{' '}
              <code>recaptchaSecret</code>, one setting for all three providers,
              through <code>PATCH /api/v1/forms/&#123;id&#125;</code>. Each form
              is also rate limited per IP address, 10 submissions a minute by
              default.
            </p>

            <h2>Accessibility checklist</h2>
            <ul>
              <li>
                Every control has a visible <code>&lt;label&gt;</code> tied to
                it with matching <code>for</code> and <code>id</code>.
                Placeholders are hints, not labels: they vanish as soon as
                someone types.
              </li>
              <li>
                Required fields carry the <code>required</code> attribute, so
                screen readers announce them. The visual asterisk is{' '}
                <code>aria-hidden</code> and explained in a note above the
                fields.
              </li>
              <li>
                Inputs use the right <code>type</code> and{' '}
                <code>autocomplete</code> token (WCAG 1.3.5, Identify Input
                Purpose).
              </li>
              <li>
                Focus stays visible. The basic CSS adds a 2px outline on{' '}
                <code>:focus-visible</code>.
              </li>
              <li>
                Submit is a real{' '}
                <code>&lt;button type=&quot;submit&quot;&gt;</code>, so Enter
                and Space work without extra code.
              </li>
              <li>
                In the fetch version the result message sits in a{' '}
                <code>role=&quot;status&quot;</code> region, so screen readers
                read it out.
              </li>
              <li>
                The honeypot is out of the tab order and hidden from assistive
                tech, so keyboard and screen reader users never land on it.
              </li>
            </ul>

            <h2>Connect the form to OSForms in 3 steps</h2>
            <ol>
              <li>
                <strong>Create a form.</strong>{' '}
                <Link href="/signup">Sign up free</Link>, create a form, and
                copy its endpoint:{' '}
                <code>https://osforms.com/api/v1/f/your-slug</code>.
              </li>
              <li>
                <strong>Paste the endpoint.</strong> Put it in the Form action
                URL field above, or replace <code>YOUR_FORM_SLUG</code> in the
                code you copied. In the form&apos;s Settings, set the Honeypot
                Field Name to <code>hp_company_site</code>. For the plain HTML
                version, also set a Redirect URL: OSForms then answers with a
                303 redirect to your thank-you page instead of showing JSON.
              </li>
              <li>
                <strong>Add integrations.</strong> Send each submission to your
                inbox with your own Resend key (
                <Link href="/form-email-notifications">
                  contact form email with Resend
                </Link>
                ), append rows to a{' '}
                <Link href="/form-to-google-sheets">Google Sheet</Link>, or POST
                to a signed webhook. Every submission is also stored in your
                dashboard.
              </li>
            </ol>
            <p>
              The free plan covers 100 submissions a month with every
              integration included. For a longer walkthrough that ends with
              email in your inbox, read{' '}
              <Link href="/html-contact-form">
                How to Make an HTML Contact Form That Sends Email
              </Link>
              .
            </p>
          </article>

          {/* ── FAQ ─────────────────────────────── */}
          <section
            className="mx-auto mt-20 max-w-3xl"
            aria-labelledby="faq-heading"
          >
            <h2
              id="faq-heading"
              className="text-foreground mb-8 text-2xl font-bold tracking-tight"
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
        </div>
      </main>

      <Footer />
    </div>
  );
}

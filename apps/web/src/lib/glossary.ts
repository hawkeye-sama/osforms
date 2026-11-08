import { GITHUB_REPO_URL } from '@/lib/structured-data';

/**
 * Content for /glossary. Every "In OSForms" line was checked against the code
 * (apps/web/src) on GLOSSARY_UPDATED; re-check it if the behavior it names
 * changes. Links point only at published posts and the Mintlify docs.
 *
 * Text conventions:
 * - `definition` is plain text. It is quoted verbatim in the DefinedTerm
 *   JSON-LD, so it must stand on its own (name the term, no "it").
 * - `context` and `osforms` may wrap code in backticks; the page renders those
 *   spans as <code>.
 */

export interface GlossaryLink {
  href: string;
  label: string;
}

export interface GlossaryTerm {
  /** Anchor id: /glossary#{slug}. Never rename a published slug. */
  slug: string;
  term: string;
  definition: string;
  context: string;
  osforms?: string;
  link: GlossaryLink;
}

/** Date the glossary content was last reviewed (YYYY-MM-DD). */
export const GLOSSARY_UPDATED = '2026-11-08';

const DOCS_SUBMIT: GlossaryLink = {
  href: '/docs/api-reference/submit-form',
  label: 'Docs: the submission endpoint',
};

const DOCS_WEBHOOKS: GlossaryLink = {
  href: '/docs/integrations/webhooks',
  label: 'Docs: webhooks and signature verification',
};

const TERMS: GlossaryTerm[] = [
  {
    slug: 'api-key-encryption-at-rest',
    term: 'API key encryption at rest',
    definition:
      'API key encryption at rest means storing third-party credentials in a database only in encrypted form, so a leaked database dump or backup does not expose usable keys.',
    context:
      'The usual choice is an authenticated cipher such as AES-256-GCM, which detects tampering as well as hiding the value. The encryption key lives outside the database, typically in an environment variable or a secrets manager, and the app decrypts a credential only when it calls the provider. Encryption at rest does not protect against an attacker who controls the running server, so it adds to access control rather than replacing it.',
    osforms:
      'Integration configs (Resend API keys, Google refresh tokens, webhook secrets) are encrypted with AES-256-GCM using a random IV per value, and decrypted only when an integration runs.',
    link: {
      href: '/bring-your-own-key',
      label: 'BYOK for form backends: what bring your own key means',
    },
  },
  {
    slug: 'application-x-www-form-urlencoded',
    term: 'application/x-www-form-urlencoded',
    definition:
      'application/x-www-form-urlencoded is the default encoding a browser uses to submit an HTML form that has no enctype attribute: each field becomes a percent-encoded name=value pair, and pairs are joined with an ampersand.',
    context:
      'A form with name and email fields sends a body like `name=Ada+Lovelace&email=ada%40example.com` (spaces become `+`). Every server framework parses it, but it carries only text, so a file input sends just the file name. Fields that share a name, such as a group of checkboxes, appear as repeated pairs.',
    osforms:
      'The submission endpoint parses urlencoded bodies and collects repeated field names into an array.',
    link: {
      href: '/html-contact-form',
      label: 'How to make an HTML contact form that sends email',
    },
  },
  {
    slug: 'auto-reply',
    term: 'Auto-reply (autoresponder)',
    definition:
      'An auto-reply, or autoresponder, is an email sent automatically to the person who submitted a form, usually to confirm that their message arrived.',
    context:
      'Sending one needs three things: the submitter’s address from a field in the submission, a verified sending domain, and a template. Because the recipient address comes from user input, a bot can use an unprotected form to send your auto-reply to people who never filled it in, so pair auto-replies with spam protection. Keep the content short and transactional so mailbox providers do not treat it as marketing.',
    osforms:
      'The Resend email integration can send an auto-reply from your own Resend account. It uses the email field you name, or detects a common one such as `email`, and supports `{{field}}` placeholders in the subject and body.',
    link: {
      href: '/form-email-notifications',
      label: 'How to send contact form email with Resend',
    },
  },
  {
    slug: 'byok',
    term: 'BYOK (bring your own key)',
    definition:
      'BYOK (bring your own key) is a model where a service runs on credentials you supply, such as your own email provider API key, instead of reselling access to its own provider account.',
    context:
      'You pay the provider directly at its own rates, the provider account and its logs stay yours, and you can cut off access at any time by rotating the key. The tradeoff is setup: you create the provider account, verify a sending domain if email is involved, and keep the key valid. In cloud security, BYOK can also mean supplying your own encryption keys to a cloud provider; for form backends it means integration credentials.',
    osforms:
      'Every integration runs on your accounts: your Resend API key, your Google account through OAuth, and your own webhook URL and secret. Integrations are not a paid add-on.',
    link: {
      href: '/bring-your-own-key',
      label: 'BYOK for form backends: what bring your own key means',
    },
  },
  {
    slug: 'captcha',
    term: 'CAPTCHA',
    definition:
      'A CAPTCHA is a challenge-response test that tries to tell human visitors from automated scripts before a form submission is accepted.',
    context:
      'Form CAPTCHAs run as a widget that writes a token into a hidden field. The server sends that token and a secret key to the provider’s siteverify endpoint and rejects the submission if verification fails, so the check has to happen server side. Google reCAPTCHA v2 shows a checkbox or image challenge, reCAPTCHA v3 runs invisibly and returns a score from 0.0 (likely bot) to 1.0 (likely human), hCaptcha is a privacy-focused alternative, and Cloudflare Turnstile usually passes without any visible challenge.',
    osforms:
      'reCAPTCHA v2 and v3, hCaptcha, and Cloudflare Turnstile are supported. OSForms picks the verifier from the token field the widget posts (`g-recaptcha-response`, `h-captcha-response`, or `cf-turnstile-response`), rejects reCAPTCHA v3 scores below 0.5, and strips the token before storing. The secret key is set through the forms API (`recaptchaSecret`).',
    link: DOCS_SUBMIT,
  },
  {
    slug: 'conversational-form',
    term: 'Conversational form',
    definition:
      'A conversational form shows one question at a time in a full-screen or chat-like flow, instead of presenting every field on a single page.',
    context:
      'Typeform made the pattern popular. One question per screen can make long surveys and onboarding flows feel lighter, and lets later questions depend on earlier answers. For short forms, such as a three-field contact form, a classic layout is usually faster to scan and fill. Accessibility needs deliberate work: focus management, keyboard navigation, and announcing progress to screen readers.',
    osforms:
      'The `OSForm` component in `@osforms/react` renders a form schema in conversational mode (the default) or classic mode, with Enter to advance and a progress bar.',
    link: {
      href: '/conversational-form-react',
      label: 'How to add a conversational form to React',
    },
  },
  {
    slug: 'cors',
    term: 'CORS and allowed origins',
    definition:
      'CORS (Cross-Origin Resource Sharing) is the browser mechanism that decides whether JavaScript running on one origin may read the response to a request it sent to a different origin.',
    context:
      'A `fetch()` from your site to a form backend on another domain only succeeds in script if the backend answers with a matching `Access-Control-Allow-Origin` header, and a JSON request triggers an `OPTIONS` preflight first. A plain HTML form post is a page navigation, so CORS does not apply to it. Browsers enforce CORS, not servers, so it never stops curl or a bot; a server-side allowed-origins list, which rejects requests whose `Origin` header is not listed, stops other websites from posting to your endpoint from the browser.',
    osforms:
      'Each form has an optional allowed-origins list. A submission whose `Origin` header is not on the list gets a 403; requests that send no `Origin` header, such as server-to-server calls, are not blocked. An empty list accepts every origin.',
    link: {
      href: '/nextjs-form-submission',
      label: 'How to build a Next.js contact form without a database',
    },
  },
  {
    slug: 'data-export',
    term: 'Data export (CSV)',
    definition:
      'Data export is the ability to download all stored form submissions in a portable format, most often CSV, so the data can move to a spreadsheet, database, or another tool.',
    context:
      'CSV is the lowest common denominator: one row per submission, one column per field. Forms change over time, so a good export uses every field name ever submitted as a column and leaves blanks where a submission lacks one. Values that contain commas, quotes, or line breaks must be quoted (RFC 4180). Bulk export is the practical test of data ownership: if you cannot get everything out, you are locked in.',
    osforms:
      'Each form has a CSV export of all its submissions: ID, date, then every field seen across submissions. For scripted access, use the pull API.',
    link: {
      href: '/own-your-form-data',
      label: 'Why your form tool shouldn’t own your data',
    },
  },
  {
    slug: 'form-action',
    term: 'Form action and method',
    definition:
      'The action attribute of an HTML form element is the URL the browser sends the form data to on submit, and the method attribute sets the HTTP method, GET or POST.',
    context:
      'With `method="get"` the fields are appended to the URL as a query string, which suits search forms but puts the data in browser history and server logs. `method="post"` sends the fields in the request body and is the right choice for anything that stores data, like a contact form. A form without an action submits to the current page URL, and the `enctype` attribute sets how a POST body is encoded.',
    osforms:
      'Set `action` to your form endpoint, `https://osforms.com/api/v1/f/{slug}`, and `method` to `post`.',
    link: {
      href: '/html-contact-form',
      label: 'How to make an HTML contact form that sends email',
    },
  },
  {
    slug: 'form-backend',
    term: 'Form backend',
    definition:
      'A form backend is a hosted service that receives HTML form submissions at a URL, stores them, and forwards them to email or other tools, so a website needs no server code of its own to process forms.',
    context:
      'Handling a form POST yourself means running a server, parsing the body, filtering spam, storing the data, and sending email. Static sites and front-end apps skip that by pointing the form’s action (or a `fetch()` call) at a form backend endpoint. Services differ mainly in spam protection, integrations, data export, pricing, and whether you can self-host.',
    osforms:
      'OSForms is an open-source (MIT) form backend with 100 free submissions a month. Resend email, Google Sheets, and webhook integrations run on your own keys.',
    link: {
      href: '/form-backend-setup',
      label: 'What is a form backend? (And how to set one up)',
    },
  },
  {
    slug: 'form-endpoint',
    term: 'Form endpoint',
    definition:
      'A form endpoint is the URL that accepts submissions for one specific form, usually containing a unique ID that tells the backend which form and account the data belongs to.',
    context:
      'An endpoint is public by design: it sits in your page source, so anyone can find it and post to it. That is why endpoints rely on server-side controls such as rate limits, honeypot fields, CAPTCHA, and origin checks rather than on keeping the URL secret. A good endpoint accepts the common body encodings and answers browser posts with a redirect and script requests with JSON.',
    osforms:
      'Each form gets an endpoint at `/api/v1/f/{slug}`, where the slug is a random 12-character ID. It accepts urlencoded, multipart, and JSON bodies.',
    link: DOCS_SUBMIT,
  },
  {
    slug: 'form-submission',
    term: 'Form submission',
    definition:
      'A form submission is one set of field values sent from a form to a server, together with the request metadata that arrives with it.',
    context:
      'Servers usually store a submission as a record holding the field data, a timestamp, and metadata such as IP address, user agent, and origin, which help with spam analysis and debugging. Field names come from each input’s `name` attribute; an input without a `name` is never sent, a common cause of "missing" fields. Unchecked checkboxes are left out of the body too.',
    osforms:
      'Each stored submission keeps the field data plus IP address, user agent, and origin. The pull API returns only the field data and timestamp, never that metadata.',
    link: {
      href: '/handle-form-submissions',
      label: 'How to handle form submissions without a backend',
    },
  },
  {
    slug: 'google-sheets-integration',
    term: 'Google Sheets integration',
    definition:
      'A Google Sheets integration appends each form submission as a new row in a Google spreadsheet, writing through the Google Sheets API with access the sheet owner grants through OAuth.',
    context:
      'With OAuth the owner approves access on a Google consent screen. The integration stores a refresh token and trades it for short-lived access tokens each time it writes. If the owner revokes access, or the OAuth app is left in Google’s testing mode (where refresh tokens expire after 7 days), writes fail until the account is reconnected. The other detail to get right is column mapping, because new form fields need new columns.',
    osforms:
      'You connect a Google account with OAuth and pick a spreadsheet. OSForms adds missing columns to the header row automatically and fills Submission ID and Submitted At columns on every row.',
    link: {
      href: '/form-to-google-sheets',
      label: 'How to send form submissions to Google Sheets',
    },
  },
  {
    slug: 'headless-form',
    term: 'Headless form',
    definition:
      'A headless form is a form whose markup, styling, and validation you write yourself, sent to a backend that only receives and processes the data and imposes no UI.',
    context:
      'Headless is the opposite of an embedded form builder that renders its own iframe or widget. You keep full control of design, accessibility, and client-side validation in your own codebase, and the backend accepts whatever field names you send. The cost is that you write the HTML or components, and the backend cannot validate fields it knows nothing about.',
    osforms:
      'A form created without the form builder is headless: its endpoint accepts any field names. Forms made with the builder store a schema that `@osforms/react` can render.',
    link: {
      href: '/html-contact-form',
      label: 'How to make an HTML contact form that sends email',
    },
  },
  {
    slug: 'hmac-signature',
    term: 'HMAC signature',
    definition:
      'An HMAC signature is a hash of a message computed with a shared secret key, for example with HMAC-SHA256, and sent alongside the message so the receiver can confirm who sent it and that the body was not changed.',
    context:
      'The sender computes the HMAC over the exact request body and puts the result, usually hex, in a header. The receiver recomputes it over the raw body bytes it received, before any JSON parsing or re-serializing, and compares the two in constant time (in Node, `crypto.timingSafeEqual`). Without the secret nobody can produce a valid signature, which is what makes a public webhook URL safe to expose.',
    osforms:
      'When a webhook has a secret, OSForms sends an `X-osforms-Signature` header: the raw hex HMAC-SHA256 of the JSON body, with no `sha256=` prefix.',
    link: DOCS_WEBHOOKS,
  },
  {
    slug: 'honeypot-field',
    term: 'Honeypot field',
    definition:
      'A honeypot field is a form input hidden from human visitors but present in the HTML, so automated bots fill it in; a submission with the honeypot filled is treated as spam.',
    context:
      'Simple bots fill every input they find, so an empty honeypot is a cheap sign of a real person. Hide it with CSS, for example positioned off screen, and add `tabindex="-1"`, `autocomplete="off"`, and `aria-hidden="true"` on its wrapper so keyboard users, screen readers, and autofill skip it. A honeypot adds zero friction for people but does nothing against targeted or browser-driven bots, so pair it with a CAPTCHA or rate limit.',
    osforms:
      'You choose the honeypot field name per form. If that field arrives non-empty, OSForms returns a normal success response but does not store the submission or run integrations.',
    link: {
      href: '/html-contact-form',
      label: 'How to make an HTML contact form that sends email',
    },
  },
  {
    slug: 'json-form-submission',
    term: 'JSON form submission',
    definition:
      'A JSON form submission sends form data as a JSON object in the request body with the header Content-Type: application/json, usually from JavaScript with fetch() rather than a native form post.',
    context:
      'HTML forms cannot send JSON on their own, so this is the path for React, Vue, Svelte, and other script-driven forms. JSON keeps numbers, booleans, arrays, and nested objects that a urlencoded body flattens into strings. `application/json` is not a CORS-safelisted content type, so a cross-origin JSON request triggers an `OPTIONS` preflight that the backend has to answer.',
    osforms:
      'JSON submissions always get a JSON response (`{ "success": true }`), never a redirect, even when the form has a redirect URL.',
    link: {
      href: '/forms-in-react',
      label: 'How to handle forms in React',
    },
  },
  {
    slug: 'multipart-form-data',
    term: 'multipart/form-data',
    definition:
      'multipart/form-data is an HTTP body encoding for forms that sends each field as a separate part divided by a boundary string, and it is the encoding browsers require for file uploads.',
    context:
      'Turn it on with `enctype="multipart/form-data"` on the form, or pass a `FormData` object to `fetch()`. When you use `fetch()`, do not set the `Content-Type` header yourself: the browser has to add the `boundary` parameter. Each part carries its own headers, which is how binary files travel next to text fields.',
    osforms:
      'Multipart bodies are accepted, but files are not stored. Each file is replaced with a placeholder such as `[File: cv.pdf, 48213 bytes]` and the file itself is discarded.',
    link: DOCS_SUBMIT,
  },
  {
    slug: 'pull-api',
    term: 'Pull API',
    definition:
      'A pull API lets your own code fetch stored submissions on demand over HTTP, the opposite of a webhook, which pushes each submission to you as it arrives.',
    context:
      'Pulling suits batch jobs, backfills, and systems that cannot expose a public URL to receive webhooks. A typical design uses read-only API keys, cursor-based pagination so pages stay stable while new data arrives, and a `since` parameter for incremental syncs. Many services offer both: webhooks for reacting in real time, and a pull API to recover anything a webhook missed.',
    osforms:
      '`GET /api/v1/submissions` takes a read-only `osf_live_` key scoped to the forms you choose and returns cursor-paginated submissions. Each key is limited to 60 requests a minute, and pulls do not count toward the monthly submission quota.',
    link: {
      href: '/docs/api-reference/pull-submissions',
      label: 'Docs: pull submissions',
    },
  },
  {
    slug: 'rate-limiting',
    term: 'Rate limiting',
    definition:
      'Rate limiting caps how many requests a client can make within a time window, such as 10 submissions per minute from one IP address, and rejects the excess.',
    context:
      'On a form endpoint, rate limiting slows down floods and scripted spam and protects downstream quotas such as your email provider’s. Rejected requests should get HTTP 429 Too Many Requests, ideally with a `Retry-After` header. Many people can share one IP address behind an office network or mobile carrier, so set per-IP limits high enough not to block real visitors.',
    osforms:
      'Each form has a per-IP limit, 10 submissions a minute by default and configurable per form. Requests over the limit get a 429 with `Retry-After`.',
    link: DOCS_SUBMIT,
  },
  {
    slug: 'redirect-after-submit',
    term: 'Redirect after submit (Post/Redirect/Get)',
    definition:
      'Redirect after submit, also called Post/Redirect/Get (PRG), is the pattern where a server answers a form POST with a redirect, usually 303 See Other, to a separate thank-you page instead of returning a page directly.',
    context:
      'A 303 tells the browser to load the new URL with GET, so refreshing the thank-you page does not resend the form and create a duplicate submission. Without it, reloading after a POST shows the "confirm form resubmission" prompt. Forms that submit with `fetch()` do not need a redirect: the server returns JSON and the script updates the page.',
    osforms:
      'Set a redirect URL on the form and browser posts get a 303 to it. Without one, or for JSON requests, the endpoint returns JSON.',
    link: {
      href: '/form-backend-setup',
      label: 'What is a form backend? (And how to set one up)',
    },
  },
  {
    slug: 'self-hosted-form-backend',
    term: 'Self-hosted form backend',
    definition:
      'A self-hosted form backend is form-processing software you run on your own server or cloud account, so submissions never pass through a third-party service.',
    context:
      'Teams self-host for data residency, compliance, or to remove usage limits. The cost is operations: you run the app and its database, apply updates, take backups, and own email deliverability. An open-source license is what makes self-hosting possible, and if the hosted and self-hosted versions share the same API, moving between them only changes the endpoint URL in your forms.',
    osforms:
      'OSForms is MIT-licensed and runs with one `docker compose up` (the app plus MongoDB). The self-hosting guide lives in the GitHub repo.',
    link: {
      href: `${GITHUB_REPO_URL}/blob/main/SELF_HOSTING.md`,
      label: 'Self-hosting guide on GitHub',
    },
  },
  {
    slug: 'spam-submission',
    term: 'Spam submission',
    definition:
      'A spam submission is an unwanted form entry sent by a bot or a person, usually carrying links, ads, or phishing content instead of a genuine message.',
    context:
      'Every public form endpoint gets spam eventually, because bots crawl the web for forms and post to them automatically. Defenses work in layers: a honeypot field catches simple bots, rate limiting slows floods, a CAPTCHA stops most automated posting, and an allowed-origins list stops other sites from posting to your endpoint from the browser. Server-side validation, such as required fields and length limits, filters much of what is left.',
    osforms:
      'Honeypot field, CAPTCHA, per-IP rate limit, and allowed origins are all set per form.',
    link: {
      href: '/handle-form-submissions',
      label: 'How to handle form submissions without a backend',
    },
  },
  {
    slug: 'static-site-form',
    term: 'Static site form',
    definition:
      'A static site form is an HTML form on a website served as prebuilt files, for example from GitHub Pages or a storage bucket, where no server-side code runs to receive the submission.',
    context:
      'Static hosts serve files but do not run your code on a POST, so the form has to send its data somewhere else: a form backend, a serverless function, or a third-party API. Pointing the form’s action at a form backend endpoint is the shortest path and works with plain HTML and no JavaScript. Hugo, Jekyll, Eleventy, and Astro in its default static mode all produce this kind of site.',
    osforms:
      'Point the form’s `action` at your OSForms endpoint; no JavaScript is required.',
    link: {
      href: '/handle-form-submissions',
      label: 'How to handle form submissions without a backend',
    },
  },
  {
    slug: 'transactional-email',
    term: 'Transactional email',
    definition:
      'Transactional email is a one-to-one message triggered by something a user did, such as a form notification, password reset, or receipt, as opposed to bulk marketing email.',
    context:
      'Transactional providers like Resend, Postmark, and Amazon SES send through an API and ask you to verify your sending domain with SPF and DKIM DNS records, which is what keeps messages out of spam folders. Sending from an unverified domain, or from a free mailbox address such as Gmail, usually fails or lands in spam. Form notifications and auto-replies are both transactional email.',
    osforms:
      'The email integration sends notifications through your own Resend account and your verified domain.',
    link: {
      href: '/form-email-notifications',
      label: 'How to send contact form email with Resend',
    },
  },
  {
    slug: 'webhook',
    term: 'Webhook',
    definition:
      'A webhook is an HTTP request that one service sends to a URL you provide when an event happens, such as a new form submission, so your code can react without polling.',
    context:
      'Your endpoint receives a POST with a JSON payload and should return a 2xx status quickly; slow or failing endpoints cause timeouts and, with some senders, retries. The URL is reachable by anyone, so verify an HMAC signature before trusting the payload. Webhooks connect a form to anything without a built-in integration: Slack, a CRM, an automation tool such as Zapier or Make, or your own API.',
    osforms:
      'Each submission sends a `form.submission` event (form ID and name, submission ID, timestamp, field data) by POST, PUT, or PATCH with a 30-second timeout. A failed delivery is logged and triggers an in-app notification and email alert; it is not retried automatically.',
    link: DOCS_WEBHOOKS,
  },
  {
    slug: 'webhook-replay-attack',
    term: 'Webhook replay attack',
    definition:
      'A webhook replay attack is when an attacker captures a genuine, correctly signed webhook request and sends it again later, so the receiver processes the same event twice.',
    context:
      'A signature alone does not stop a replay, because the replayed request is byte-for-byte authentic. The two common defenses are a signed timestamp that the receiver rejects once it is a few minutes old, and an idempotency check that records each event ID and ignores repeats. Serving the webhook URL over HTTPS also makes capturing a request much harder in the first place.',
    osforms:
      'The signature covers the body only and no timestamp header is sent, so make your handler idempotent by recording the `submissionId` from the payload and skipping IDs you have already processed.',
    link: DOCS_WEBHOOKS,
  },
];

/** All terms, sorted A to Z by display name. */
export const GLOSSARY_TERMS: GlossaryTerm[] = [...TERMS].sort((a, b) =>
  a.term.localeCompare(b.term, 'en', { sensitivity: 'base' })
);

/** First letter of a term, used for the A to Z jump nav. */
export function termLetter(term: GlossaryTerm): string {
  return term.term.charAt(0).toUpperCase();
}

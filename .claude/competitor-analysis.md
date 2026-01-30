# FreeForms - Competitor Analysis

Last updated: 2026-01-27

## Market Overview

Form backend services handle form submissions without server-side code. Users point HTML forms at an endpoint, and the service stores data + triggers integrations (email, Slack, Sheets, etc).

**The problem**: Every competitor paywalls integrations (Sheets, Slack, webhooks) behind $5-15+/month plans, even though the user's own API keys power these integrations.

**Our angle**: FreeForms is BYOK (Bring Your Own Keys). Integrations are free because users provide their own credentials. We only charge for submission volume/server costs.

---

## Competitor Breakdown

### Formspree (formspree.io)

| Tier | Price | Submissions/mo | Key Limits |
|------|-------|----------------|------------|
| Free | $0 | 50 | No plugins, 30-day archive, 2 emails, no file uploads |
| Personal | $15/mo | 200 | Basic plugins (Sheets, Slack, webhooks), 1GB uploads |
| Professional | $30/mo | 2,000 | Premium plugins (HubSpot, Salesforce, Notion), rules engine |
| Business | $90/mo | 20,000 | Custom honeypot, custom email templates/domains |

**What's paywalled**: ALL integrations (free = email only, no Sheets/Slack/webhooks), API access (Professional+), file uploads (paid only), custom spam rules (Business only), submission archive beyond 30 days.

**Weakness to exploit**: Free tier is basically useless (50 subs, no integrations, 30-day retention). $15/mo just for 200 submissions + basic Sheets.

---

### FormBold (formbold.com)

| Tier | Price | Submissions/mo | Key Limits |
|------|-------|----------------|------------|
| Free | $0 | 100 | 5 forms, 2 emails, no file attachments, no API, no webhooks |
| Starter | $4-6/mo | 3,000 | 100 forms, file attachments, API, webhooks |
| Premium | $9-15/mo | 5,000 | Autoresponder, custom redirects |
| Business | $16-24/mo | 15,000 | Branding removal, domain restrictions |

**What's paywalled**: API access (Starter+), webhooks (Starter+), file attachments (Starter+), autoresponder (Premium+), branding removal (Business).

**Weakness to exploit**: Free tier has no API, no webhooks, no file uploads. Integrations (Slack, Sheets, Notion) seem available but limited on free. The $4 starter is affordable but still charges for what could be free with BYOK.

---

### Basin (usebasin.com)

| Tier | Price | Submissions/mo | Key Limits |
|------|-------|----------------|------------|
| Free | $0 | 50 | 1 form, 30-day retention, basic only |
| Basic | $5.83/mo | 250 | 3 forms, 365-day retention, data export |
| Standard | $12.50/mo | 1,000 | Unlimited forms, Slack/Sheets/webhooks, API |
| Premium | $27.50/mo | 5,000 | Custom templates, custom domains, AI spam |
| Agency | $81.25/mo | 25,000 | Progressive capture, priority support |

**What's paywalled**: Google Sheets / Slack / webhooks / API all locked to Standard ($12.50/mo). Custom spam rules at Premium ($27.50/mo).

**Weakness to exploit**: Most expensive for integrations - $12.50/mo before you get Sheets or webhooks. Free tier is weakest (50 subs, 1 form, 30 days).

---

### Formcarry (formcarry.com)

| Tier | Price | Submissions/mo | Key Limits |
|------|-------|----------------|------------|
| Baby (Free) | $0 | 50 | 1 form, 1 team member |
| Starter | $5/mo | 500 | Unlimited forms, 1GB uploads, 500 integration calls |
| Basic | $15/mo | 2,000 | 5 team members, 2GB uploads |
| Premium | $80/mo | 30,000 | 20 team members, 30GB uploads |

**Notable**: Custom email server on ALL tiers (including free). File uploads on free tier. AJAX/API on all tiers. GDPR/CCPA compliant.

**Weakness to exploit**: Still charges $5/mo for more than 50 submissions. Integration calls are metered separately.

---

### Formspark (formspark.io)

| Model | Price | Submissions |
|-------|-------|-------------|
| Free | $0 | 500 total (not monthly) |
| Bundle | $25 one-time | 50,000 total (never expires) |

**Notable**: One-time payment model is unique. No monthly fees. 500 free submissions lifetime.

**Weakness to exploit**: Limited integrations, less active development.

---

## Competitive Matrix

| Feature | Formspree | FormBold | Basin | Formcarry | **FreeForms** |
|---------|-----------|----------|-------|-----------|---------------|
| Free submissions/mo | 50 | 100 | 50 | 50 | **200** |
| Free integrations | None | Limited | None | Limited | **All (BYOK)** |
| Google Sheets (free) | No | No | No | No | **Yes** |
| Webhooks (free) | No | No | No | No | **Yes** |
| Email notifications (free) | Yes (2) | Yes (2) | Yes | Yes | **Yes (unlimited)** |
| API access (free) | No | No | No | Yes | **Yes** |
| File uploads (free) | No | No | No | Yes | Future |
| Self-hostable | No | No | No | No | **Yes** |
| Open source | No | No | No | No | **Yes** |
| Submission archive | 30 days | ? | 30 days | Forever | **Forever** |

---

## Our Differentiators (FreeForms)

1. **BYOK = Free integrations forever**: Users bring their own Resend/SendGrid keys, Google service accounts, webhook URLs. We never charge for integrations.

2. **200 free submissions/month**: 2-4x more than competitors.

3. **All integrations on free tier**: Sheets, email, webhooks - competitors charge $5-15/mo for these.

4. **Open source + self-hostable**: No vendor lock-in. Docker-ready.

5. **Developer-first**: npm SDK, API access on free tier, clean documentation.

6. **Unlimited email recipients**: Competitors cap at 2 emails on free tiers.

7. **Permanent submission archive**: No 30-day delete like Formspree/Basin free tiers.

---

## Pricing Strategy

| Tier | Price | Submissions/mo | What You Get |
|------|-------|----------------|--------------|
| Free | $0 | 100 | All integrations (BYOK), unlimited forms, API access, permanent archive |
| Self-hosted | Free | Unlimited | Run your own instance, bring your own DB |

**Why this works**: Our costs are minimal (MongoDB storage, compute for submission processing). Users handle their own email/Sheets/webhook costs through their own accounts.

---

## Sources

- [Formspree Pricing](https://formspree.io/plans)
- [FormBold Pricing](https://formbold.com/pricing)
- [Basin Pricing](https://usebasin.com/pricing)
- [Formcarry Pricing](https://formcarry.com/pricing)
- [FormBold vs Formspree](https://formbold.com/alternatives/formspree)
- [FormBold Alternatives](https://formbold.com/alternatives)

# FreeForms Content & Copywriting Guide

This guide defines the writing style, messaging framework, and content strategy for all FreeForms copy—landing pages, documentation, UI, and marketing materials.

## Voice & Tone

### Brand Voice

**Technical but Approachable**

- Write for developers who value clarity over marketing speak
- Use technical terms when appropriate (API, webhook, HMAC, JWT)
- Explain complex concepts simply without dumbing down
- No buzzwords, no fluff, no corporate jargon

**Direct & Honest**

- Say what you mean in the fewest words
- No superlatives ("best," "fastest," "revolutionary")
- No vague promises ("seamless," "enterprise-grade," "next-generation")
- Transparency about limitations and pricing

**Confident but Not Arrogant**

- Assert value without bragging
- Let the product speak through examples
- Acknowledge competition respectfully
- Focus on differentiation, not superiority

### Tone Variations

| Context         | Tone               | Example                                                                    |
| --------------- | ------------------ | -------------------------------------------------------------------------- |
| Landing Page    | Confident, direct  | "Point your forms at FreeForms. We handle the rest."                       |
| Documentation   | Clear, instructive | "Set your redirect URL to display a success message after submission."     |
| Error Messages  | Helpful, specific  | "API key invalid. Check that you copied the full key from your dashboard." |
| Marketing Email | Friendly, casual   | "Quick update: We just shipped Google Sheets integration."                 |

---

## Messaging Framework

### Core Value Proposition

```
FreeForms is an open-source form backend where you bring your own API keys.
No vendor lock-in. No integration paywalls. 100 free submissions/month.
```

**What We Do**: Form backend SaaS with BYOK integrations
**Who We're For**: Developers building web applications
**Why We Exist**: Every competitor paywalls integrations behind paid plans
**Our Differentiator**: Free integrations because you use your own API keys

### Three Pillars (For Features Section)

1. **Zero Vendor Lock-In**
   - Problem: Competitors own your data and integration configs
   - Solution: Your API keys, your data, export anytime
   - Benefit: Switch providers or self-host without migration pain

2. **All Integrations Included**
   - Problem: Formspree charges $15/mo for email forwarding
   - Solution: Resend, Google Sheets, webhooks—all free
   - Benefit: Pay only your provider's costs (e.g., Resend's $0.10/1000 emails)

3. **Developer-First API**
   - Problem: Form backends built for marketers, not engineers
   - Solution: REST API, webhook signatures, CORS control, rate limiting
   - Benefit: Integrate in 2 minutes, customize to your exact needs

### Reasons to Believe

**Technical Credibility**:

- Open source (link to GitHub)
- AES-256-GCM encryption for API keys
- Webhook HMAC signatures (SHA-256)
- 99.9% uptime SLA (once we have data)

**No Hidden Costs**:

- 100 submissions/month free
- Upgrade to 2,000 for $9/mo (clear pricing)
- No per-integration fees
- No contact sales CTA

---

## Writing Rules

### Headlines

**Formula**: `[Benefit] + [Differentiator]`

✅ **Good**:

- "The Form Backend That Respects Your Keys"
- "Open Source Form Backend. Zero Lock-In."
- "BYOK Form Backend for Developers"

❌ **Bad**:

- "The Best Form Solution" (vague, superlative)
- "Revolutionary Form Management Platform" (buzzwords)
- "Enterprise-Grade Form Infrastructure" (meaningless)

**Character Limit**: 50 characters max (mobile screens)

### Subheadlines

**Formula**: `[What It Does] + [Key Benefit] + [Social Proof/Pricing]`

✅ **Good**:

```
Point your forms at FreeForms. We store submissions and route them to
your own Resend, Google Sheets, and webhooks. 100 free submissions/month.
```

❌ **Bad**:

```
Leverage our cutting-edge platform to seamlessly integrate your forms
with best-in-class tools and scale your business to new heights.
```

**Character Limit**: 120 characters (2 lines at 16px)

### Feature Descriptions

**Framework**: Feature → Benefit → Outcome

✅ **Good**:

```
Feature: Webhook HMAC signatures with SHA-256
Benefit: Verify requests came from FreeForms
Outcome: Prevent spam and replay attacks on your endpoint
```

Combined:

```
Webhook signatures (HMAC SHA-256) verify every request, preventing spam
and replay attacks on your endpoint.
```

❌ **Bad**:

```
Advanced security features protect your integrations with enterprise-grade
encryption and industry-standard protocols.
```

**Character Limit**: 140 characters (3 lines at 14px)

### Call-to-Action (CTA) Copy

**Primary CTA**: Use action verbs + benefit

✅ **Good**:

- "Get Started Free" (action + benefit)
- "Try FreeForms" (simple, direct)
- "Start Building" (action-oriented)

❌ **Bad**:

- "Sign Up" (generic, no benefit)
- "Learn More" (vague)
- "Request Demo" (B2B cliché, not for developer tools)

**Secondary CTA**: Low commitment, exploratory

✅ **Good**:

- "View on GitHub →"
- "Read the Docs →"
- "See Pricing →"

---

## Content Patterns

### Feature-Benefit Transformation

Every feature statement should transform into a user benefit.

| Feature (Bad)           | Benefit (Good)                                                  |
| ----------------------- | --------------------------------------------------------------- |
| "Advanced encryption"   | "Your API keys encrypted at rest with AES-256-GCM"              |
| "Seamless integrations" | "Connect Resend, Google Sheets, webhooks—5 minute setup"        |
| "Powerful API"          | "REST API with CORS control, rate limiting, webhook signatures" |
| "Flexible pricing"      | "100 free submissions/month. Upgrade to 2,000 for $9/mo"        |
| "Enterprise-ready"      | "HTTPS endpoints, API key auth, role-based access control"      |

### Technical vs Non-Technical Balance

**When to use technical terms**:

- API documentation
- Feature descriptions for developers
- Error messages
- Integration guides

**When to simplify**:

- Landing page headlines
- Pricing page
- Email subject lines
- Social media posts

**Example**:

- Technical: "POST to `/api/v1/f/{slug}` with `application/x-www-form-urlencoded` body"
- Simple: "Point your HTML form at your FreeForms endpoint"

### Social Proof Language

Avoid hyperbole. Use specific numbers when possible.

✅ **Good**:

- "Used by 500+ developers"
- "10,000+ forms submitted this month"
- "4.8/5 stars on GitHub"

❌ **Bad**:

- "Trusted by thousands of companies worldwide"
- "Industry-leading solution"
- "Loved by developers everywhere"

---

## Page-Specific Guidelines

### Landing Page

**Hero Section**:

- Headline: 40-50 characters, bold claim
- Subheadline: 100-120 characters, clarify what you do
- CTA: "Get Started Free" (primary), "View on GitHub →" (secondary)

**Features Section**:

- 3 features only (focus on top differentiators)
- Icon + Heading + 2-3 sentence description
- Link to docs for details ("Learn more →")

**Pricing Section**:

- Lead with free tier: "100 Free Submissions/Month"
- Show upgrade path: "$9/mo for 2,000 submissions"
- No "Contact Sales" CTA

### Documentation

**Structure**:

- Start with what the user will accomplish
- Show code examples first, explain after
- Use active voice: "Send a POST request" not "A POST request is sent"
- Include error messages and troubleshooting

**Example**:

```markdown
## Submit a Form

Send a POST request to your form endpoint:

[code example]

FreeForms will store the submission and trigger your integrations.
```

### Error Messages

**Pattern**: `[What happened] + [Why it happened] + [How to fix it]`

✅ **Good**:

```
API key invalid. The key must start with "ff_live_" and be 32 characters.
Copy the full key from your dashboard.
```

❌ **Bad**:

```
Authentication failed. Please try again.
```

### Email

**Subject Lines**:

- Use sentence case, not Title Case
- Lead with benefit or news
- 40 characters max (mobile preview)

✅ **Good**:

- "Google Sheets integration is live"
- "You have 50 submissions this week"
- "Your form endpoint is ready"

❌ **Bad**:

- "Exciting News from FreeForms!"
- "Don't Miss Out on Our Latest Features"

**Body**:

- Start with the update or action needed
- Use bullet points for multiple items
- Include direct link to relevant page
- Sign with "– The FreeForms Team"

---

## Competitor Differentiation

### How to Talk About Competitors

**Never**:

- Name competitors directly
- Use negative language ("unlike X who...")
- Make unverifiable claims ("we're faster than...")

**Do**:

- Compare categories: "Most form backends paywall integrations"
- State facts: "Formspree charges $15/mo for email forwarding"
- Emphasize your approach: "We don't charge for integrations because you use your own API keys"

### Positioning Statement

```
For developers who need form backends without vendor lock-in,
FreeForms is an open-source SaaS where you bring your own API keys—
unlike Formspree, FormBold, and Basin who charge $5-15/mo per integration
even though your API keys power them.
```

---

## SEO Content Guidelines

### Meta Titles

**Pattern**: `[Primary Keyword] – [Differentiator] | FreeForms`

✅ **Good**:

```
Form Backend API – BYOK Integrations | FreeForms
Open Source Form Backend with Resend Integration | FreeForms
```

**Character Limit**: 60 characters

### Meta Descriptions

**Pattern**: `[What it does] + [Key benefit] + [CTA/Pricing]`

✅ **Good**:

```
Developer-first form backend with Resend, Google Sheets, and webhook
integrations. Bring your own API keys. 100 free submissions/month.
```

**Character Limit**: 155 characters

### Blog Post Structure

1. **Title**: Problem-focused or how-to (e.g., "How to Add Resend Email to HTML Forms")
2. **Intro**: State the problem (2-3 sentences)
3. **Solution**: Show FreeForms solution with code
4. **Steps**: Clear numbered list with code examples
5. **Conclusion**: Link to docs or signup

**Tone**: Instructional, not promotional

---

## Words to Avoid

| Avoid            | Use Instead                           |
| ---------------- | ------------------------------------- |
| Seamless         | Quick, 5-minute setup, Easy           |
| Enterprise-grade | Specific features (HTTPS, auth, etc.) |
| Revolutionary    | New, Different                        |
| Leverage         | Use                                   |
| Cutting-edge     | Modern, Latest                        |
| Synergy          | (just don't)                          |
| Best-in-class    | (show, don't tell)                    |
| World-class      | (meaningless)                         |
| Next-generation  | (avoid)                               |
| Robust           | Reliable, Fast                        |

---

## Word List (Approved Terms)

**Preferred Verbs**:

- Store, Send, Route, Connect, Configure, Deploy, Build, Ship

**Preferred Adjectives**:

- Open, Free, Simple, Fast, Secure, Flexible, Direct

**Technical Terms (Use freely)**:

- API, REST, JSON, webhook, HMAC, SHA-256, AES-256-GCM, CORS, JWT, endpoint, slug, POST, GET

---

## Testing & Iteration

### A/B Test Priorities

1. **Headlines**: Test 3 variations focused on different benefits
2. **CTA Copy**: "Get Started Free" vs "Try FreeForms" vs "Start Building"
3. **Feature Order**: Which of the 3 pillars resonates most?
4. **Social Proof**: "Used by X developers" vs testimonial quote

### Copy Review Checklist

Before publishing any copy:

- [ ] No buzzwords or marketing jargon
- [ ] Specific, not vague (numbers, features, timeframes)
- [ ] Benefit-focused, not feature-list
- [ ] Honest about limitations
- [ ] Technically accurate (review with dev)
- [ ] Scannable (short paragraphs, bullets)
- [ ] Active voice ("You configure" not "Configuration is done")
- [ ] Consistent brand voice (direct, technical, honest)

---

## Examples in Context

### Landing Page Hero (Full Example)

```
Headline:
The Form Backend That Respects Your Keys

Subheadline:
Point your forms at FreeForms. We store submissions and route them to
your own Resend, Google Sheets, and webhooks. 100 free submissions/month.

Primary CTA: Get Started Free
Secondary CTA: View on GitHub →
```

### Feature Card (Full Example)

```
Icon: [Unlock]

Heading:
Zero Vendor Lock-In

Body:
Your API keys, your data, your control. Switch providers or self-host
anytime. No proprietary formats, no export fees, no lock-in.
```

### Documentation Intro (Full Example)

```
# Quick Start

Get your form backend running in 2 minutes:

1. Create a form in your dashboard
2. Copy your form endpoint URL
3. Point your HTML form at the endpoint
4. Configure integrations (Resend, Sheets, webhooks)

That's it. Submissions are stored and routed to your integrations.
```

---

## Sources & References

This guide is based on 2026 best practices from:

- [The Ultimate Guide to SaaS Copywriting 2026](https://www.phoebelown.com/blog/the-ultimate-guide-to-saas-copywriting-20-tips-tricks-and-best-practices)
- [17 SaaS Copywriting Tips for 2026](https://www.madx.digital/learn/saas-copywriting)
- [Best CTA Placement Strategies for 2026](https://www.landingpageflow.com/post/best-cta-placement-strategies-for-landing-pages)
- [B2B SaaS Value Proposition Framework](https://www.t2d3.pro/resources/value-proposition-framework)
- [B2B Messaging Framework Guide](https://productiveshop.com/b2b-messaging-framework/)
- [Landing Page Optimization Best Practices 2026](https://prismic.io/blog/landing-page-optimization-best-practices)

---

## Version History

- **v1.0** (2026-01-28): Initial guide based on research and FreeForms positioning

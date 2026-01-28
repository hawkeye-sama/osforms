# FreeForms Landing Page Guide

This guide defines the structure, content, and implementation details for the FreeForms landing page, aligned with our monotone dark theme design system.

## Design Philosophy

**Developer-First Minimalism**: No marketing fluff. Show the product, state the value, let developers decide in seconds. Inspired by Linear, Vercel, GitHub, and Resend's clarity-focused approach.

**Key Principles**:
- Product screenshots > Abstract illustrations
- Code examples > Feature lists
- Clear value proposition > Marketing copy
- Interactive demos > Static images
- Minimal motion that adds meaning

---

## Page Structure

```
1. Navigation Bar (sticky)
2. Hero Section
3. Code Example Section
4. Features Grid (3 features)
5. Integrations Showcase
6. Pricing Callout
7. Final CTA
8. Footer
```

**Total Length**: ~3-4 viewport heights (no endless scroll)

---

## 1. Navigation Bar

### Layout

```
Logo                    [Docs] [Pricing] [GitHub] [Sign In] [Get Started →]
```

### Specifications

```css
position: sticky
top: 0
z-index: 50
background: var(--bg-base) / 0.8
backdrop-filter: blur(12px)
border-bottom: 1px solid var(--border-subtle)
height: 64px
padding: 0 32px
```

**Desktop Layout**:
- Logo (left): Text "FreeForms" in font-weight 600, color `--text-primary`
- Nav Links (center/right): font-size 14px, color `--text-secondary`, hover → `--text-primary`
- Sign In: Ghost button
- Get Started: Primary button (white CTA)

**Mobile** (`< md`):
- Hide nav links
- Show hamburger menu icon (right side)
- Keep logo and Get Started button only

### Behavior

- **Scroll Effect**: Border becomes more visible as user scrolls (opacity 0 → 1)
- **Active State**: Current page link has color `--text-primary`
- **No logo animation**: Static, professional

---

## 2. Hero Section

### Layout

```
        ┌─────────────────────────────────────┐
        │                                     │
        │    [Headline: 1 line, bold]         │
        │    [Subheadline: 2 lines, muted]    │
        │                                     │
        │    [CTA Button] [Secondary Link]    │
        │                                     │
        │    ┌─────────────────────────────┐  │
        │    │  Code Example with Tabs     │  │
        │    │  (HTML / React / cURL)      │  │
        │    └─────────────────────────────┘  │
        │                                     │
        └─────────────────────────────────────┘
```

### Content

**Headline** (5xl, 700 weight):
```
The Form Backend That Respects Your Keys
```

Alternative options:
- "Open Source Form Backend. Zero Lock-In."
- "BYOK Form Backend for Developers"

**Subheadline** (lg, 400 weight, `--text-secondary`):
```
Point your forms at FreeForms. We store submissions and route them to
your own Resend, Google Sheets, and webhooks. 200 free submissions/month.
```

**CTA Buttons**:
- Primary: "Get Started Free" (links to `/signup`)
- Secondary: "View on GitHub →" (ghost button, links to repo)

### Code Example Component

**Design**:
```css
background: var(--bg-element)
border: 1px solid var(--border-default)
border-radius: 12px
max-width: 720px
margin: 48px auto 0
padding: 0
overflow: hidden
```

**Tab Bar**:
```css
background: var(--bg-subtle)
border-bottom: 1px solid var(--border-default)
padding: 12px 16px
display: flex
gap: 8px

/* Tab */
font-size: 14px
padding: 6px 12px
border-radius: 6px
color: var(--text-tertiary)

/* Active Tab */
background: var(--bg-hover)
color: var(--text-primary)
```

**Code Content**:
```html
<!-- HTML Tab -->
<form action="https://api.freeforms.dev/f/your-slug" method="POST">
  <input name="email" type="email" placeholder="Email" required />
  <input name="message" placeholder="Message" required />
  <button type="submit">Send</button>
</form>
```

```jsx
// React Tab
<form action="https://api.freeforms.dev/f/your-slug" method="POST">
  <input name="email" type="email" placeholder="Email" required />
  <input name="message" placeholder="Message" required />
  <button type="submit">Send</button>
</form>
```

```bash
# cURL Tab
curl -X POST https://api.freeforms.dev/f/your-slug \
  -d "email=user@example.com" \
  -d "message=Hello from cURL"
```

**Syntax Highlighting**: Grayscale only (see DESIGN_GUIDE.md)

### Spacing

```css
padding: 128px 32px 96px
text-align: center
```

---

## 3. Features Grid

### Layout

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Icon       │  │   Icon       │  │   Icon       │
│   Heading    │  │   Heading    │  │   Heading    │
│   Text       │  │   Text       │  │   Text       │
└──────────────┘  └──────────────┘  └──────────────┘
```

**Grid**: 3 columns on desktop, 1 column on mobile
**Gap**: 24px

### Content

**1. Zero Vendor Lock-In**
- Icon: Unlock (24px, `--text-primary`)
- Heading: "Zero Vendor Lock-In"
- Text: "Your API keys, your data, your control. Switch providers or self-host anytime. No proprietary formats."

**2. All Integrations Included**
- Icon: Plug (24px, `--text-primary`)
- Heading: "All Integrations Included"
- Text: "Resend email, Google Sheets, webhooks—all free. Competitors paywall these behind $15/mo. We don't."

**3. Developer-First API**
- Icon: Code (24px, `--text-primary`)
- Heading: "Developer-First API"
- Text: "REST API, webhook signatures, CORS control, rate limiting. Built for developers who read docs, not marketing pages."

### Card Specifications

```css
background: var(--bg-element)
border: 1px solid var(--border-default)
border-radius: 12px
padding: 32px 24px
text-align: center
transition: all 200ms ease

hover {
  border-color: var(--border-strong)
  transform: translateY(-2px)
}
```

**Icon Container**:
```css
width: 48px
height: 48px
margin: 0 auto 16px
display: flex
align-items: center
justify-content: center
```

**Heading**:
- font-size: xl (20px)
- font-weight: 600
- color: `--text-primary`
- margin-bottom: 12px

**Text**:
- font-size: sm (14px)
- color: `--text-secondary`
- line-height: 1.6

### Spacing

```css
padding: 96px 32px
max-width: 1200px
margin: 0 auto
```

---

## 4. Integrations Showcase

### Layout

```
        ┌─────────────────────────────────────┐
        │   "Integrations That Don't Cost Extra"│
        │                                     │
        │   ┌──────┐  ┌──────┐  ┌──────┐    │
        │   │Resend│  │Sheets│  │ Hook │    │
        │   └──────┘  └──────┘  └──────┘    │
        └─────────────────────────────────────┘
```

### Content

**Section Heading** (2xl, 600 weight, center):
```
Integrations That Don't Cost Extra
```

**Subheading** (base, `--text-secondary`, center):
```
Connect your own API keys. Pay only your provider's costs.
```

### Integration Cards (Horizontal Layout)

**Card Design**:
```css
display: flex
flex-direction: column
align-items: center
gap: 12px
padding: 24px
background: var(--bg-subtle)
border: 1px solid var(--border-default)
border-radius: 12px
min-width: 200px
```

**Cards**:
1. **Resend**
   - Logo: Resend wordmark (white)
   - Text: "Email forwarding with your API key"

2. **Google Sheets**
   - Logo: Google Sheets icon (grayscale)
   - Text: "Append rows to your spreadsheet"

3. **Webhooks**
   - Icon: Webhook symbol
   - Text: "POST to any endpoint with HMAC signing"

**Note**: Use grayscale versions of logos. If colored, convert to monotone.

### Spacing

```css
padding: 96px 32px
background: var(--bg-base)
text-align: center
```

---

## 5. Pricing Callout

### Layout

```
        ┌─────────────────────────────────────┐
        │                                     │
        │     "200 Free Submissions/Month"    │
        │     "No credit card required"       │
        │                                     │
        │     [Get Started Free →]            │
        │                                     │
        └─────────────────────────────────────┘
```

### Content

**Headline** (3xl, 700 weight):
```
200 Free Submissions/Month
```

**Subtext** (base, `--text-secondary`):
```
No credit card required. Upgrade to 2,000 for $9/mo.
```

**CTA**: Primary button "Get Started Free"

### Card Specifications

```css
max-width: 600px
margin: 0 auto
padding: 48px 32px
background: var(--bg-element)
border: 1px solid var(--border-default)
border-radius: 12px
text-align: center
```

### Spacing

```css
padding: 96px 32px
```

---

## 6. Final CTA Section

### Layout

```
        ┌─────────────────────────────────────┐
        │   "Ready to Own Your Form Backend?" │
        │   [Get Started Free]  [View Docs →] │
        └─────────────────────────────────────┘
```

### Content

**Headline** (2xl, 600 weight):
```
Ready to Own Your Form Backend?
```

**Buttons**:
- Primary: "Get Started Free"
- Secondary: "View Docs →"

### Spacing

```css
padding: 96px 32px
text-align: center
background: var(--bg-base)
```

---

## 7. Footer

### Layout (Desktop)

```
FreeForms                Product           Resources         Legal
Built by developers,     Pricing           Docs              Privacy
for developers.          GitHub            Blog              Terms
                         Changelog         Support
```

### Specifications

```css
padding: 64px 32px 32px
border-top: 1px solid var(--border-default)
background: var(--bg-base)
```

**Column Layout**:
- 4 columns on desktop
- Stack vertically on mobile
- Gap: 48px (desktop), 24px (mobile)

**Brand Column**:
- Logo + tagline
- font-size: sm
- color: `--text-tertiary`

**Link Columns**:
- Heading: font-weight 600, color `--text-primary`, font-size sm
- Links: font-size sm, color `--text-tertiary`, hover → `--text-primary`
- Gap: 8px

**Copyright**:
```css
text-align: center
padding-top: 32px
border-top: 1px solid var(--border-subtle)
font-size: xs
color: var(--text-quaternary)
```

---

## Motion & Interactions

### Animations

**Hero Section**:
- Fade in on load: headline → subheadline → CTA → code example
- Stagger delay: 100ms between elements
- Duration: 300ms
- Easing: ease-out

**Feature Cards**:
- Fade in when scrolled into view
- Transform: translateY(20px) → translateY(0)
- Duration: 200ms

**Code Tabs**:
- Instant switch (no animation)
- Content fades in: 150ms

### Hover States

**Buttons**:
- Primary: Scale 0.98 on active, background lightens
- Secondary: Border color intensifies

**Cards**:
- Border color: `--border-default` → `--border-strong`
- Transform: translateY(0) → translateY(-2px)
- Duration: 200ms

**Links**:
- Opacity: 1 → 0.8
- Duration: 150ms

---

## Copywriting Rules

### Tone

- **Direct**: "Point your forms at FreeForms" not "Leverage our platform"
- **Technical**: Show code, not buzzwords
- **Honest**: "200 free submissions" not "Unlimited free tier*"
- **Developer-First**: Assume the reader knows what an API is

### Feature-Benefit Transformation

❌ **Bad**: "Our platform has advanced encryption"
✅ **Good**: "Your API keys encrypted at rest with AES-256-GCM"

❌ **Bad**: "Seamless integration with popular tools"
✅ **Good**: "Connect Resend, Google Sheets, webhooks. All free."

❌ **Bad**: "Enterprise-grade infrastructure"
✅ **Good**: "99.9% uptime. Rate limiting. CORS control."

### Headline Formula

```
[What It Is] + [Key Differentiator]
```

Examples:
- "Form Backend That Respects Your Keys"
- "Open Source Form Backend. Zero Lock-In."
- "BYOK Form Backend for Developers"

### Character Limits

- Headline: 50 characters max
- Subheadline: 120 characters max (2 lines)
- Feature text: 140 characters max (3 lines)

---

## Mobile Optimizations

### Hero Section

```css
padding: 80px 24px 64px
```

- Headline: Reduce to 2.5rem (40px)
- Subheadline: Reduce to 1rem (16px)
- Stack CTA buttons vertically (gap: 12px)
- Code example: Full width, horizontal scroll

### Features Grid

- Single column layout
- Reduce card padding: 24px → 20px
- Reduce icon size: 24px → 20px

### Navigation

- Hide all links except logo and Get Started
- Show hamburger menu icon
- Mobile menu: Full-screen overlay with vertical nav

### Touch Targets

- All buttons: minimum 44x44px
- Increase link padding: 12px vertical
- Larger tap areas for tabs

---

## Technical Implementation

### Page Performance

**Critical Path**:
1. Load HTML + inline critical CSS
2. Render hero section (no JS required)
3. Lazy load code highlighting library
4. Lazy load feature card animations

**Fonts**:
```css
@font-face {
  font-family: 'Inter';
  font-display: swap;
  /* Preload weights: 400, 500, 600, 700 */
}
```

**Images**:
- Use SVG for icons (inline, not external files)
- No hero images (text-only hero)
- Lazy load integration logos

### SEO

**Title**:
```html
<title>FreeForms – Open Source Form Backend with BYOK Integrations</title>
```

**Meta Description**:
```html
<meta name="description" content="Developer-first form backend with Resend, Google Sheets, and webhook integrations. Bring your own API keys. 200 free submissions/month. No vendor lock-in.">
```

**Structured Data**:
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "FreeForms",
  "applicationCategory": "DeveloperApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

---

## Component Checklist

Before launch, ensure:

- [ ] All text uses design system typography scale
- [ ] All colors use CSS variables from DESIGN_GUIDE.md
- [ ] All buttons follow primary/secondary/ghost patterns
- [ ] All cards have consistent border-radius (12px)
- [ ] All hover states have 200ms transition
- [ ] All code blocks use grayscale syntax highlighting
- [ ] Mobile hamburger menu works
- [ ] Code tabs switch instantly
- [ ] CTAs link to `/signup`
- [ ] Footer links go to correct pages
- [ ] Meta tags for social sharing
- [ ] Favicon set
- [ ] Google Analytics (if needed)

---

## A/B Test Ideas (Post-Launch)

1. **Headline**: "Form Backend" vs "Form API" vs "Form Endpoint"
2. **CTA Text**: "Get Started Free" vs "Start Building" vs "Try FreeForms"
3. **Hero Layout**: Code example in hero vs separate section
4. **Social Proof**: Add "Used by 500+ developers" badge
5. **Pricing Position**: Above fold vs below features

---

## References & Inspiration

This guide is based on 2026 SaaS landing page best practices and analysis of:

- **Resend**: Minimal hero, code-first approach
- **Vercel**: Dark theme execution, interactive demos
- **Linear**: Typography hierarchy, monotone palette
- **GitHub**: Developer-focused copywriting
- **Stripe**: Clear CTAs, generous spacing

## Sources

Based on research from:
- [10 SaaS Landing Page Trends for 2026](https://www.saasframe.io/blog/10-saas-landing-page-trends-for-2026-with-real-examples)
- [20 Best SaaS Landing Pages + Best Practices](https://fibr.ai/landing-page/saas-landing-pages)
- [Vercel Design Guidelines](https://vercel.com/design/guidelines)
- [SaaS Landing Page Best Practices 2026](https://www.designstudiouiux.com/blog/saas-landing-page-design/)
- [Best SaaS Websites for Design Inspiration](https://www.bookmarkify.io/blog/best-saas-websites-of-2025-end-of-year-showcase)

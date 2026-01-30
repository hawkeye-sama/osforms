# FreeForms Design System

## 🎨 Color Palette

### Dark Elevated Theme

Based on best practices from Resend, Linear, Vercel, and Stripe. Dark foundation with white glow accents for visual interest.

```css
/* Background Layers (darkest to lightest) - Adjusted for better usability */
--bg-base: #0a0a0a /* Main background, near-black */ --bg-subtle: #1c1c1c
  /* Slightly elevated surfaces (was #141414) */ --bg-element: #212121
  /* Cards, panels, elevated elements (was #1A1A1A) */ --bg-hover: #292929
  /* Hover states on interactive elements (was #242424) */ --bg-active: #333333
  /* Active/pressed states (was #2E2E2E) */
  /* Borders (subtle to prominent) - Adjusted for better visibility */
  --border-subtle: #212121 /* Barely visible dividers (was #1A1A1A) */
  --border-default: #333333 /* Standard borders (was #2A2A2A) */
  --border-strong: #474747 /* Prominent borders, focused states (was #404040) */
  /* Text (lightest to darkest) - Improved contrast */ --text-primary: #fafafa
  /* Primary text, headings */ --text-secondary: #a8a8a8
  /* Secondary text, descriptions (was #A0A0A0) */ --text-tertiary: #858585
  /* Placeholder, disabled text (was #737373) */ --text-quaternary: #616161
  /* Very subtle text, hints (was #525252) */
  /* Accent (White Glow) - Increased visibility */ --accent: #ffffff
  /* Pure white for emphasis */ --accent-glow: rgba(255, 255, 255, 0.15)
  /* Subtle glow (was 0.12) */ --accent-glow-strong: rgba(255, 255, 255, 0.25)
  /* Strong glow on hover (was 0.20) */ /* Inverted (for CTAs) */
  --bg-inverted: #fafafa /* White/light buttons */ --text-inverted: #0a0a0a
  /* Text on white buttons */;
```

### Design Principles

1. **Dark Elevated**: Near-black base with layered darkness for depth
2. **White Glow Accent**: Subtle white glow on interactive elements and cards (8-12% opacity)
3. **Visible Grid Pattern**: Background grid with 8% white dots on 32px grid for subtle texture
4. **High Contrast**: Minimum 4.5:1 ratio for accessibility (WCAG AA)
5. **Animated Gradients**: Subtle radial gradients in hero and key sections
6. **Micro-Interactions**: Every interactive element has hover/focus animation
7. **Performance-First**: GPU-accelerated animations, 60fps target

---

## 📐 Typography

### Font Stack

- **Sans**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui
- **Mono**: "JetBrains Mono", "Fira Code", Consolas, monospace

### Type Scale

```text
xs:   0.75rem  (12px) - Helper text, fine print
sm:   0.875rem (14px) - Secondary labels, captions
base: 1rem     (16px) - Body text (default)
lg:   1.125rem (18px) - Emphasized body, subheadings
xl:   1.25rem  (20px) - Card titles
2xl:  1.5rem   (24px) - Section headings
3xl:  1.875rem (30px) - Page titles
4xl:  2.25rem  (36px) - Major headings
5xl:  3rem     (48px) - Hero titles
```

### Font Weights

- **400** (Regular) - Body text, paragraphs
- **500** (Medium) - Buttons, emphasized text
- **600** (Semibold) - Card headings, labels
- **700** (Bold) - Page headings, hero text

### Line Heights

- **Tight** (1.25) - Large headings, hero text
- **Normal** (1.5) - Body text, paragraphs
- **Relaxed** (1.75) - Long-form content

---

## 🔲 Spacing & Layout

### Base Unit: 4px

All spacing uses multiples of 4px for visual consistency.

```text
1:   4px    |  8:  32px   |  16: 64px
2:   8px    |  10: 40px   |  20: 80px
3:   12px   |  12: 48px   |  24: 96px
4:   16px   |  14: 56px   |  32: 128px
6:   24px   |
```

### Layout Constraints

#### Container Widths

- Max content width: `1280px`
- Prose/text width: `720px`
- Form width: `480px`

#### Section Padding

- Desktop: `96px` vertical, `32px` horizontal
- Tablet: `64px` vertical, `24px` horizontal
- Mobile: `48px` vertical, `16px` horizontal

#### Component Padding

- Cards: `24px` (desktop), `16px` (mobile)
- Buttons: `12px 24px` (default), `8px 16px` (small)
- Inputs: `12px 16px`

---

## 🎯 Components

### Buttons

#### Primary Button (CTA)

```css
background: var(--bg-inverted)     /* #FAFAFA */
color: var(--text-inverted)        /* #0F0F0F */
font-weight: 500
border: none
border-radius: 8px
padding: 12px 24px
transition: all 150ms ease

hover {
  background: #E0E0E0
  transform: translateY(-1px)
}

active {
  transform: translateY(0)
}
```

#### Secondary Button

```css
background: transparent
color: var(--text-primary)         /* #FAFAFA */
border: 1px solid var(--border-default)
font-weight: 500
border-radius: 8px
padding: 12px 24px

hover {
  background: var(--bg-subtle)
  border-color: var(--border-strong)
}
```

#### Ghost Button

```css
background: transparent
color: var(--text-secondary)       /* #B3B3B3 */
border: none
font-weight: 500

hover {
  color: var(--text-primary)
  background: var(--bg-subtle)
}
```

### Cards

```css
background: var(--bg-element)      /* #1A1A1A */
border: 2px solid var(--border-default)  /* Thicker border for better visibility */
border-radius: 12px
padding: 24px
box-shadow: 0 0 20px rgba(255, 255, 255, 0.06)  /* Subtle white glow */
transition: all 200ms ease

hover {
  border-color: var(--border-strong)
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.12)  /* Enhanced glow on hover */
  transform: translateY(-2px)
}
```

**Card Variants:**

- **Flat Card**: No border, subtle background `--bg-subtle`
- **Elevated Card**: Default style above with 2px border and glow effect for visual prominence
- **Interactive Card**: Adds hover effects with border color transition and enhanced glow

### Forms & Inputs

```css
/* Text Input */
background: var(--bg-base)         /* #0F0F0F */
border: 1px solid var(--border-default)
border-radius: 8px
padding: 12px 16px
color: var(--text-primary)
font-size: 14px

placeholder {
  color: var(--text-tertiary)
}

focus {
  border-color: var(--border-strong)
  outline: 2px solid var(--bg-hover)
  outline-offset: 0
}

disabled {
  opacity: 0.5
  cursor: not-allowed
}
```

### Code Blocks

```css
background: var(--bg-base)         /* Darker than cards */
border: 1px solid var(--border-subtle)
border-radius: 12px
padding: 16px
font-family: mono
font-size: 14px
line-height: 1.6
color: var(--text-primary)

/* Syntax Highlighting: Grayscale Only */
.keyword {
  color: #fafafa;
  font-weight: 600;
}
.string {
  color: #b3b3b3;
}
.comment {
  color: #737373;
  font-style: italic;
}
.function {
  color: #fafafa;
}
.variable {
  color: #d4d4d4;
}
```

### Tables

```css
/* Table Container */
border: 1px solid var(--border-default)
border-radius: 12px
overflow: hidden

/* Header */
th {
  background: var(--bg-subtle)
  color: var(--text-secondary)
  font-weight: 500
  text-align: left
  padding: 12px 16px
  border-bottom: 1px solid var(--border-default)
}

/* Row */
td {
  padding: 12px 16px
  border-bottom: 1px solid var(--border-subtle)
}

tr:hover {
  background: var(--bg-subtle)
}

tr:last-child td {
  border-bottom: none
}
```

---

## ✨ Motion & Animation

### Transition Durations

- **Instant**: `100ms` - Checkbox toggles, immediate feedback
- **Fast**: `150ms` - Hover states, button presses
- **Base**: `200ms` - Cards, dropdowns, tooltips
- **Slow**: `300ms` - Modals, drawers, page transitions
- **Slower**: `500ms` - Complex animations, large movements

### Easing Functions

- **Default**: `cubic-bezier(0.4, 0, 0.2, 1)` - Standard ease-in-out
- **Decelerate**: `cubic-bezier(0.0, 0.0, 0.2, 1)` - Entering elements
- **Accelerate**: `cubic-bezier(0.4, 0.0, 1, 1)` - Exiting elements
- **Sharp**: `cubic-bezier(0.4, 0.0, 0.6, 1)` - Fast, decisive movements

### Common Patterns

#### Fade In

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
animation: fadeIn 200ms ease-out;
```

#### Scale In

```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
animation: scaleIn 200ms ease-out;
```

#### Skeleton Loading

```css
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```

### Interaction Micro-Animations

- **Button Press**: Scale 0.98 on active
- **Card Hover**: Translate Y -2px + border color change
- **Link Hover**: Opacity 0.8
- **Focus**: Outline appears instantly (0ms), scales in 100ms

---

## 🌐 Page Layouts

### Landing Page Hero

```css
/* Hero Container */
padding: 128px 32px 96px
text-align: center
background: var(--bg-base)

/* Headline */
font-size: 3rem (48px)
font-weight: 700
color: var(--text-primary)
letter-spacing: -0.02em
line-height: 1.1
max-width: 900px
margin: 0 auto

/* Subheadline */
font-size: 1.25rem (20px)
font-weight: 400
color: var(--text-secondary)
line-height: 1.6
max-width: 720px
margin: 24px auto 40px

/* CTA */
Primary button (white on dark)
margin-top: 40px
```

### Feature Grid

- **Grid**: 3 columns on desktop, 1 on mobile
- **Gap**: 24px
- **Card Style**: Elevated card (see Components)
- **Icon Size**: 24px, color `--text-primary`
- **Heading**: font-weight 600, color `--text-primary`
- **Description**: font-size 14px, color `--text-secondary`

### Code Showcase

```css
/* Container */
background: var(--bg-element)
border: 1px solid var(--border-default)
border-radius: 12px
padding: 0
overflow: hidden

/* Header (filename bar) */
background: var(--bg-subtle)
padding: 12px 16px
border-bottom: 1px solid var(--border-default)
font-size: 14px
color: var(--text-tertiary)

/* Code Block */
background: var(--bg-base)
padding: 24px
font-family: mono
font-size: 14px
overflow-x: auto
```

### Dashboard Layout

#### Sidebar Navigation

```css
width: 240px
background: var(--bg-base)
border-right: 1px solid var(--border-default)
height: 100vh
position: fixed
padding: 24px 16px

/* Nav Item */
padding: 8px 12px
border-radius: 8px
color: var(--text-secondary)
font-size: 14px
font-weight: 500

/* Active Nav Item */
background: var(--bg-element)
color: var(--text-primary)

/* Hover */
background: var(--bg-subtle)
```

#### Main Content Area

```css
margin-left: 240px
padding: 32px
min-height: 100vh
background: var(--bg-base)
```

---

## 📱 Responsive Design

### Breakpoints

```css
sm:  640px   /* Mobile landscape, small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Small laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

### Mobile Optimizations

#### Typography Scaling

- Headings: Reduce by 20-30%
- Hero text: 2.5rem instead of 3rem
- Body text: Keep at 16px (never go below)

#### Layout Adjustments

- Stack all grids to single column below `md`
- Reduce vertical padding by 40% on mobile
- Increase horizontal padding for better touch targets
- Hide sidebar nav, show mobile hamburger menu

#### Touch Targets

- Minimum 44x44px for all interactive elements
- Increase button padding: `12px 20px` minimum
- Add more spacing between clickable items

#### Mobile Performance

- Serve smaller images on mobile (responsive images)
- Lazy load below-the-fold content
- Reduce animation complexity on low-end devices

---

## ⚡ Performance & Accessibility

### Optimization

#### Font Loading

```css
@font-face {
  font-family: 'Inter';
  font-display: swap; /* Show fallback immediately */
  /* ... */
}
```

#### Image Optimization

- Use WebP format with PNG/JPG fallback
- Lazy load images below the fold
- Use `loading="lazy"` attribute
- Implement responsive images with `srcset`

#### JavaScript

- Load non-critical scripts with `defer`
- Avoid layout shifts (reserve space for dynamic content)
- Use CSS for animations when possible

### Accessibility

#### Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Focus States

- Always show visible focus indicators
- Use high-contrast outlines (2px solid)
- Never remove outlines without replacement

#### Color Contrast

- Maintain WCAG AA standard (4.5:1 for text)
- Test all text/background combinations
- Use tools like WebAIM Contrast Checker

#### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Logical tab order
- Visible focus indicators
- Skip navigation links for screen readers

---

## 🎭 Design Philosophy

### Principles

**1. Monotone Hierarchy**
Use weight, size, and spacing to create hierarchy—not color. Every interface element should be clearly distinguishable by its typography and position alone.

**2. Consistent Elevation**
Each layer should be exactly one shade lighter than the one below it. Never skip steps in the grey scale.

**3. Functional Minimalism**
Remove any element that doesn't serve a clear purpose. Every pixel should earn its place.

**4. Developer-First**
Design for developers who value speed, clarity, and technical precision. No marketing fluff, no unnecessary decoration.

**5. Dark by Default**
Embrace darkness as the primary mode. This isn't an afterthought—it's the brand.

### What to Avoid

- ❌ Pure black backgrounds (#000000)
- ❌ Pure white text (#FFFFFF) on large text blocks
- ❌ Color accents (stay monotone)
- ❌ Decorative elements without purpose
- ❌ Complex gradients or shadows
- ❌ Rounded corners above 12px
- ❌ Multiple font families
- ❌ Excessive animations

### Inspiration

Reference these tools for best practices:

- **Linear**: Clean monotone hierarchy, subtle borders
- **Vercel**: Minimal, technical, perfect contrast
- **GitHub**: Consistent grey scale, functional design
- **Stripe**: Typography-driven hierarchy, clear spacing

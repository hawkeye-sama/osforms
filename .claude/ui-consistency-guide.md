# osforms UI Consistency Guide

This guide ensures consistent design across all components. osforms is a **dark-themed only** SaaS tool (no light mode).

## Core Principles

1. **Always Dark Theme** - No light mode toggle. Everything is dark.
2. **Explicit Text Colors** - Never rely on inherited colors for important text.
3. **Visible on Dark** - All elements must be clearly visible on dark backgrounds.
4. **Consistent Spacing** - Use standard spacing scale (4, 8, 12, 16, 24, 32, 48).

---

## Color Usage Rules

### Text Colors (ALWAYS explicit)

```tsx
// Primary text (headings, important labels)
className="text-foreground"  // #FAFAFA

// Secondary text (descriptions, helper text)
className="text-muted-foreground"  // #A8A8A8

// Example - Page Headers
<h1 className="text-3xl font-bold tracking-tight text-foreground">Page Title</h1>
<p className="text-muted-foreground mt-1">Description text here</p>

// Example - Section Headers
<h2 className="text-xl font-semibold text-foreground">Section Title</h2>

// Example - Card Titles
<CardTitle className="text-base font-semibold text-foreground">Card Title</CardTitle>
```

### Background Colors

```tsx
// Main background (darkest)
className = 'bg-background'; // #0A0A0A

// Cards, panels, elevated surfaces
className = 'bg-card'; // #212121

// Subtle elevation (sidebar, secondary surfaces)
className = 'bg-secondary'; // #292929

// Never use bg-background for inputs - use bg-card instead
```

### Border Colors

```tsx
// Standard borders
className = 'border-border'; // #333333

// On focus
className = 'focus-visible:border-border';
```

---

## Component Patterns

### Page Structure

```tsx
<div className="space-y-6">
  {/* Header */}
  <div>
    <h1 className="text-foreground text-3xl font-bold tracking-tight">
      Page Title
    </h1>
    <p className="text-muted-foreground mt-1">Page description</p>
  </div>

  {/* Content */}
  <Card>
    <CardHeader>
      <CardTitle className="text-foreground text-lg">Section</CardTitle>
      <CardDescription>Description</CardDescription>
    </CardHeader>
    <CardContent>...</CardContent>
  </Card>
</div>
```

### Empty States

```tsx
<Card>
  <CardContent className="flex flex-col items-center justify-center py-16">
    <Icon className="text-muted-foreground mb-4 h-12 w-12" />
    <h3 className="text-foreground text-lg font-semibold">Empty State Title</h3>
    <p className="text-muted-foreground mt-1 mb-6 text-sm">
      Empty state description
    </p>
    <Button>Action</Button>
  </CardContent>
</Card>
```

### Input Fields

```tsx
// Use bg-card for inputs, NOT bg-background
<Input className="bg-card text-foreground" />

// Disabled inputs
<Input disabled className="bg-secondary text-muted-foreground" />
```

### Icons

```tsx
// Primary icons (in headers, important actions)
<Icon className="h-5 w-5 text-foreground" />

// Secondary icons (decorative, less important)
<Icon className="h-4 w-4 text-muted-foreground" />
```

### Sidebar/Navigation

```tsx
// Container
<aside className="bg-card border-r">

// Logo
<Link className="text-xl font-bold tracking-tight text-foreground">osforms</Link>

// Active nav item
className="bg-secondary text-foreground"

// Inactive nav item
className="text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
```

### Charts (Recharts)

```tsx
// Use explicit hex colors, NOT CSS variables
<Line stroke="#FAFAFA" />
<XAxis stroke="#A8A8A8" />
<CartesianGrid stroke="#333333" />

// Tooltip
<div className="bg-card border-border text-foreground">
```

---

## Common Mistakes to Avoid

### ❌ Don't

```tsx
// Missing text color - text may be invisible
<h1 className="text-3xl font-bold">Title</h1>

// Using bg-background for inputs - too dark
<Input className="bg-background" />

// CSS variables in Recharts - won't work
<Line stroke="hsl(var(--primary))" />

// Relying on inherited colors for important text
<CardTitle>Title</CardTitle>
```

### ✅ Do

```tsx
// Explicit text color
<h1 className="text-3xl font-bold text-foreground">Title</h1>

// bg-card for inputs
<Input className="bg-card text-foreground" />

// Hex colors in Recharts
<Line stroke="#FAFAFA" />

// Explicit text color for card titles
<CardTitle className="text-foreground">Title</CardTitle>
```

---

## Color Reference

| Token                  | Hex     | Usage                         |
| ---------------------- | ------- | ----------------------------- |
| `--background`         | #0A0A0A | Main page background          |
| `--card`               | #212121 | Cards, panels, inputs         |
| `--secondary`          | #292929 | Hover states, subtle surfaces |
| `--border`             | #333333 | All borders                   |
| `--foreground`         | #FAFAFA | Primary text, headings        |
| `--muted-foreground`   | #A8A8A8 | Secondary text, descriptions  |
| `--primary`            | #FAFAFA | CTA buttons (inverted)        |
| `--primary-foreground` | #0A0A0A | Text on CTA buttons           |

---

## Testing Visibility

Before committing, check:

1. All headings visible on dark background
2. All labels visible in forms
3. Input text visible when typing
4. Icons visible in navbar/sidebar
5. Chart lines and labels visible
6. Empty states readable

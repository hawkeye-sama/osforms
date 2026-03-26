# @osforms/react

React component library for building beautiful conversational and classic form UIs that submit to [osforms](https://osforms.com) endpoints.

- **Typeform-quality UX** — smooth animated conversational forms, one question at a time
- **Zero config** — fetches your schema from the osforms dashboard automatically
- **Headless-friendly** — define schemas in code if you prefer, no dashboard required
- **Themeable** — match your brand with color, font, and shape overrides
- **Conditional logic** — show/hide fields based on previous answers
- **Open source** — MIT license

---

## Install

```bash
npm install @osforms/react
# or
pnpm add @osforms/react
# or
yarn add @osforms/react
```

> **Peer dependencies**: React 18+

---

## Quick Start

### Option 1 — Dashboard Builder (recommended)

Design your form visually in the osforms dashboard Builder tab, then drop in one component:

```tsx
import { OSForm } from '@osforms/react'

export default function ContactPage() {
  return <OSForm formId="your-form-slug" />
}
```

The component fetches your schema from osforms and renders it. That's it.

### Option 2 — Define schema in code (headless)

No dashboard needed. Pass the schema as a prop:

```tsx
import { OSForm } from '@osforms/react'
import type { FormSchema } from '@osforms/react'

const schema: FormSchema = {
  mode: 'conversational',
  fields: [
    {
      id: 'name',
      type: 'text',
      label: 'What is your name?',
      required: true,
      placeholder: 'Jane Smith',
    },
    {
      id: 'email',
      type: 'email',
      label: 'Your email address',
      required: true,
    },
    {
      id: 'role',
      type: 'radio',
      label: 'What describes you best?',
      required: true,
      options: [
        { id: 'dev', label: 'Developer', value: 'developer' },
        { id: 'design', label: 'Designer', value: 'designer' },
        { id: 'other', label: 'Other', value: 'other' },
      ],
      config: { autoAdvance: true },
    },
    {
      id: 'message',
      type: 'textarea',
      label: 'What can we help you with?',
      required: true,
    },
  ],
  welcomeScreen: {
    enabled: true,
    title: "Let's talk",
    description: "Fill in your details and we'll get back to you within 24 hours.",
    buttonLabel: 'Get started',
  },
  thankYouScreen: {
    enabled: true,
    title: "We got your message!",
    description: "We'll be in touch within 24 hours.",
  },
}

export default function ContactPage() {
  return (
    <OSForm
      schema={schema}
      endpoint="https://osforms.com/api/v1/f/your-form-slug"
    />
  )
}
```

---

## API Reference

### `<OSForm />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `formId` | `string` | — | Form slug from your osforms dashboard. Fetches schema automatically. Either `formId` or `schema` is required. |
| `schema` | `FormSchema` | — | Define schema in code. Requires `endpoint` when used without `formId`. |
| `endpoint` | `string` | auto | Submission URL. Auto-derived from `formId` when omitted. |
| `baseUrl` | `string` | `'https://osforms.com'` | Override for self-hosted instances. |
| `mode` | `'conversational' \| 'classic'` | schema default | Override the form's mode. |
| `theme` | `Partial<FormTheme>` | — | Theme overrides — merged with schema theme and osforms defaults. |
| `onComplete` | `(submissionId?: string) => void` | — | Called after a successful submission. |
| `onError` | `(error: Error) => void` | — | Called when a submission fails. |
| `loadingComponent` | `ReactNode` | built-in | Custom loading state while schema fetches. |
| `errorComponent` | `ReactNode` | built-in | Custom error state on fetch failure. |

---

## Form Modes

### Conversational (default)

One question at a time with smooth slide animations. Auto-advances on selection for choice fields. Keyboard-first: `Enter` to advance, `←` back.

```tsx
<OSForm formId="abc123" mode="conversational" />
```

### Classic

All fields on one page — standard form layout. Good for short contact forms where showing everything at once is faster.

```tsx
<OSForm formId="abc123" mode="classic" />
```

---

## Theming

Override any part of the default dark theme:

```tsx
// Light theme
<OSForm
  formId="abc123"
  theme={{
    colors: {
      background: '#ffffff',
      surface: '#f9fafb',
      primary: '#6366f1',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
    },
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: 'lg',
    buttonVariant: 'solid',
  }}
/>
```

### `FormTheme`

```ts
interface FormTheme {
  colors?: {
    background?: string      // page/form background
    surface?: string         // input/card background
    primary?: string         // buttons, progress bar, accents
    text?: string            // primary text
    textSecondary?: string   // labels, descriptions
    border?: string          // input borders
    error?: string           // validation errors
  }
  fontFamily?: string
  fontSize?: 'sm' | 'md' | 'lg'
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  buttonVariant?: 'solid' | 'outline' | 'ghost'
}
```

---

## Field Types

| Type | Description |
|------|-------------|
| `text` | Single-line text |
| `email` | Email with format validation |
| `textarea` | Multi-line text |
| `number` | Numeric input |
| `tel` | Phone number |
| `url` | URL with format validation |
| `select` | Dropdown single-select |
| `radio` | Single choice (visible option list) — auto-advances by default |
| `checkbox` | Multiple choice (multi-select) |
| `rating` | Star rating (1–5 by default) — auto-advances by default |
| `scale` | NPS-style numeric scale (1–10 by default) — auto-advances by default |
| `statement` | Display-only text block, no input |

---

## Conditional Logic

Show or hide fields based on previous answers:

```ts
{
  id: 'company',
  type: 'text',
  label: 'Where do you work?',
  required: false,
  conditionalLogic: {
    action: 'show',
    match: 'all',
    conditions: [
      {
        fieldId: 'role',
        operator: 'not_equals',
        value: 'other',
      },
    ],
  },
}
```

**Operators**: `equals` · `not_equals` · `contains` · `not_contains` · `greater_than` · `less_than` · `is_empty` · `is_not_empty`

---

## Welcome & Thank You Screens

```ts
const schema: FormSchema = {
  mode: 'conversational',
  fields: [...],

  welcomeScreen: {
    enabled: true,
    title: "Let's talk",
    description: 'Takes about 2 minutes.',
    buttonLabel: 'Start',
  },

  thankYouScreen: {
    enabled: true,
    title: "You're all set!",
    description: "We'll be in touch soon.",
    showSubmissionId: false,
    redirectUrl: 'https://yoursite.com/thanks',
    redirectDelay: 3,
  },
}
```

---

## Advanced: Using Hooks Directly

For fully custom rendering:

```tsx
import { useFormSchema, useFormState } from '@osforms/react'

function MyCustomForm({ slug }: { slug: string }) {
  const { schema, loading, error } = useFormSchema(slug)

  const [state, actions] = useFormState(
    schema,
    `https://osforms.com/api/v1/f/${slug}`,
    (submissionId) => console.log('submitted:', submissionId)
  )

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  const { currentField, visibleFields, currentIndex } = actions
  const { answers, errors, isComplete } = state

  if (isComplete) return <p>Thanks!</p>

  return (
    <div>
      <p>{currentField?.label}</p>
      {/* render your own field input */}
      <button onClick={() => actions.advance()}>Next</button>
    </div>
  )
}
```

---

## Source Tracking

Track which platform submitted the form (shows as a badge in your osforms dashboard):

```tsx
// Injected automatically via schema settings
const schema: FormSchema = {
  // ...
  settings: {
    source: 'webflow',  // 'react' | 'webflow' | 'wordpress' | 'embed' | 'api' | any string
  },
}
```

---

## Self-Hosting

Point the component at your own osforms instance:

```tsx
<OSForm
  formId="abc123"
  baseUrl="https://forms.yourcompany.com"
/>
```

---

## License

MIT — see [LICENSE](../../LICENSE)

---

Built with [osforms](https://osforms.com) — the open-source BYOK form backend.

/**
 * Pure HTML generation for the /tools/html-form-generator page.
 *
 * No React or browser APIs here, so the output can be unit-checked with plain
 * Node (every user-supplied value is HTML-escaped before it lands in markup).
 */

export type FieldKind =
  | 'name'
  | 'email'
  | 'phone'
  | 'subject'
  | 'message'
  | 'company'
  | 'select'
  | 'checkbox';

export interface FormField {
  id: string;
  kind: FieldKind;
  label: string;
  name: string;
  placeholder: string;
  required: boolean;
  /** Only used by `select` fields. */
  options: string[];
}

export type Styling = 'unstyled' | 'basic';
export type SubmitMode = 'html' | 'fetch';

export interface GeneratorOptions {
  action: string;
  submitText: string;
  honeypot: boolean;
  styling: Styling;
  submitMode: SubmitMode;
}

export interface GeneratedForm {
  /** Everything the user pastes into their page. */
  code: string;
  /** Markup for the sandboxed preview (no script). */
  previewDocument: string;
}

export const DEFAULT_ACTION = 'https://osforms.com/api/v1/f/YOUR_FORM_SLUG';
export const HONEYPOT_NAME = 'hp_company_site';
export const FORM_ID = 'contact-form';
const ID_PREFIX = 'contact';

interface FieldPreset {
  title: string;
  label: string;
  name: string;
  placeholder: string;
  required: boolean;
  options?: string[];
}

export const FIELD_PRESETS: Record<FieldKind, FieldPreset> = {
  name: {
    title: 'Name',
    label: 'Name',
    name: 'name',
    placeholder: 'Jane Doe',
    required: true,
  },
  email: {
    title: 'Email',
    label: 'Email',
    name: 'email',
    placeholder: 'jane@example.com',
    required: true,
  },
  phone: {
    title: 'Phone',
    label: 'Phone',
    name: 'phone',
    placeholder: '+1 555 123 4567',
    required: false,
  },
  subject: {
    title: 'Subject',
    label: 'Subject',
    name: 'subject',
    placeholder: 'What is this about?',
    required: false,
  },
  message: {
    title: 'Message',
    label: 'Message',
    name: 'message',
    placeholder: 'How can we help?',
    required: true,
  },
  company: {
    title: 'Company',
    label: 'Company',
    name: 'company',
    placeholder: 'Acme Inc.',
    required: false,
  },
  select: {
    title: 'Dropdown',
    label: 'Topic',
    name: 'topic',
    placeholder: 'Choose a topic',
    required: false,
    options: ['General question', 'Sales', 'Support'],
  },
  checkbox: {
    title: 'Consent checkbox',
    label: 'I agree to be contacted about my enquiry.',
    name: 'consent',
    placeholder: '',
    required: true,
  },
};

export const FIELD_KINDS = Object.keys(FIELD_PRESETS) as FieldKind[];

/** Input type and autocomplete token per preset (textarea/select/checkbox handled separately). */
const INPUT_META: Partial<
  Record<FieldKind, { type: string; autocomplete?: string }>
> = {
  name: { type: 'text', autocomplete: 'name' },
  email: { type: 'email', autocomplete: 'email' },
  phone: { type: 'tel', autocomplete: 'tel' },
  subject: { type: 'text' },
  company: { type: 'text', autocomplete: 'organization' },
};

export function createField(kind: FieldKind, id: string): FormField {
  const preset = FIELD_PRESETS[kind];
  return {
    id,
    kind,
    label: preset.label,
    name: preset.name,
    placeholder: preset.placeholder,
    required: preset.required,
    options: preset.options ? [...preset.options] : [],
  };
}

/** Keep `name` attributes to safe characters; spaces become underscores. */
export function sanitizeName(raw: string): string {
  return raw.replace(/\s+/g, '_').replace(/[^A-Za-z0-9_.-]/g, '');
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type AttrValue = string | boolean | undefined;

function attrs(list: Array<[string, AttrValue]>): string {
  return list
    .filter(([, v]) => v !== undefined && v !== false && v !== '')
    .map(([k, v]) =>
      v === true ? ` ${k}` : ` ${k}="${escapeHtml(String(v))}"`
    )
    .join('');
}

interface ResolvedField extends FormField {
  /** Unique, sanitized name attribute. */
  attrName: string;
  /** Unique id used by the label/control pair. */
  domId: string;
}

/**
 * Names a control can't safely take: they shadow HTMLFormElement members
 * (form.action, form.reset, form.submit…) used by browsers and the fetch
 * script, or would turn `contact-<name>` into the form/status element id.
 */
const RESERVED_NAMES = [
  'action',
  'method',
  'submit',
  'reset',
  'elements',
  'length',
  'target',
  'enctype',
  'encoding',
  'addEventListener',
  'querySelector',
  'getAttribute',
  'form',
  'form-status',
];

/**
 * Fill in empty names from the preset and de-duplicate them (name, name_2…),
 * reserving the honeypot name so a real field can never collide with it.
 */
export function resolveFields(
  fields: FormField[],
  honeypot: boolean
): ResolvedField[] {
  const used = new Set<string>([
    ...RESERVED_NAMES,
    ...(honeypot ? [HONEYPOT_NAME] : []),
  ]);
  return fields.map((field) => {
    const base = sanitizeName(field.name) || FIELD_PRESETS[field.kind].name;
    let attrName = base;
    let n = 2;
    while (used.has(attrName)) {
      attrName = `${base}_${n}`;
      n += 1;
    }
    used.add(attrName);
    return { ...field, attrName, domId: `${ID_PREFIX}-${attrName}` };
  });
}

function labelText(field: ResolvedField): string {
  const text = escapeHtml(
    field.label.trim() || FIELD_PRESETS[field.kind].label
  );
  return field.required ? `${text} <span aria-hidden="true">*</span>` : text;
}

function renderField(field: ResolvedField, styled: boolean): string[] {
  const wrapClass = styled
    ? attrs([['class', field.kind === 'checkbox' ? 'field checkbox' : 'field']])
    : '';
  const placeholder = field.placeholder.trim();
  const label = `    <label for="${escapeHtml(field.domId)}">${labelText(field)}</label>`;

  if (field.kind === 'checkbox') {
    return [
      `  <div${wrapClass}>`,
      `    <input${attrs([
        ['type', 'checkbox'],
        ['id', field.domId],
        ['name', field.attrName],
        ['value', 'yes'],
        ['required', field.required],
      ])}>`,
      label,
      '  </div>',
    ];
  }

  if (field.kind === 'message') {
    return [
      `  <div${wrapClass}>`,
      label,
      `    <textarea${attrs([
        ['id', field.domId],
        ['name', field.attrName],
        ['rows', '5'],
        ['placeholder', placeholder],
        ['required', field.required],
      ])}></textarea>`,
      '  </div>',
    ];
  }

  if (field.kind === 'select') {
    const options = field.options.map((o) => o.trim()).filter(Boolean);
    return [
      `  <div${wrapClass}>`,
      label,
      `    <select${attrs([
        ['id', field.domId],
        ['name', field.attrName],
        ['required', field.required],
      ])}>`,
      `      <option value="">${escapeHtml(placeholder || 'Choose one')}</option>`,
      ...options.map(
        (o) =>
          `      <option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`
      ),
      '    </select>',
      '  </div>',
    ];
  }

  const meta = INPUT_META[field.kind] ?? { type: 'text' };
  return [
    `  <div${wrapClass}>`,
    label,
    `    <input${attrs([
      ['type', meta.type],
      ['id', field.domId],
      ['name', field.attrName],
      ['autocomplete', meta.autocomplete],
      ['placeholder', placeholder],
      ['required', field.required],
    ])}>`,
    '  </div>',
  ];
}

const BASIC_CSS = `<style>
  .contact-form { display: grid; gap: 1rem; max-width: 32rem; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #111; }
  .contact-form .field { display: grid; gap: 0.375rem; }
  .contact-form label { font-size: 0.875rem; font-weight: 600; }
  .contact-form input, .contact-form select, .contact-form textarea { box-sizing: border-box; width: 100%; padding: 0.625rem 0.75rem; font: inherit; color: inherit; background: #fff; border: 1px solid #8a8a8a; border-radius: 6px; }
  .contact-form textarea { min-height: 8rem; resize: vertical; }
  .contact-form input:focus-visible, .contact-form select:focus-visible, .contact-form textarea:focus-visible, .contact-form button:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
  .contact-form .checkbox { display: flex; gap: 0.5rem; align-items: flex-start; }
  .contact-form .checkbox input { width: auto; margin: 0.2rem 0 0; }
  .contact-form .checkbox label { font-weight: 400; }
  .contact-form .form-note, .contact-form .form-status { margin: 0; font-size: 0.875rem; color: #444; }
  .contact-form button { justify-self: start; padding: 0.75rem 1.25rem; font: inherit; font-weight: 600; color: #fff; background: #111; border: 0; border-radius: 6px; cursor: pointer; }
  .contact-form button:disabled { opacity: 0.6; cursor: wait; }
</style>`;

const HONEYPOT_STYLE =
  'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden';

function fetchScript(): string {
  return `<script>
  (() => {
    const form = document.getElementById('${FORM_ID}');
    const status = document.getElementById('${FORM_ID}-status');
    const button = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      button.disabled = true;
      status.textContent = 'Sending...';

      try {
        const res = await fetch(form.getAttribute('action'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        const result = await res.json().catch(() => ({}));

        if (res.ok) {
          form.reset();
          status.textContent = 'Thanks! Your message has been sent.';
        } else {
          status.textContent = result.error || 'Something went wrong. Please try again.';
        }
      } catch {
        status.textContent = 'Network error. Check your connection and try again.';
      } finally {
        button.disabled = false;
      }
    });
  })();
</script>`;
}

export function generateForm(
  fields: FormField[],
  options: GeneratorOptions
): GeneratedForm {
  const styled = options.styling === 'basic';
  const resolved = resolveFields(fields, options.honeypot);
  const action = options.action.trim() || DEFAULT_ACTION;
  const submitText = escapeHtml(options.submitText.trim() || 'Send message');
  const hasRequired = resolved.some((f) => f.required);

  const head: string[] = [
    '<!-- Contact form generated at https://osforms.com/tools/html-form-generator -->',
  ];
  if (action.includes('YOUR_FORM_SLUG')) {
    head.push(
      '<!-- Replace YOUR_FORM_SLUG with the endpoint slug from your OSForms dashboard, or point action at your own backend. -->'
    );
  }

  const form: string[] = [
    `<form${attrs([
      ['id', FORM_ID],
      ['class', styled ? 'contact-form' : undefined],
      ['action', action],
      ['method', 'POST'],
    ])}>`,
  ];

  if (hasRequired) {
    form.push(
      `  <p${attrs([['class', styled ? 'form-note' : undefined]])}>Fields marked * are required.</p>`
    );
  }

  for (const field of resolved) {
    form.push(...renderField(field, styled));
  }

  if (options.honeypot) {
    const hpId = `${ID_PREFIX}-${HONEYPOT_NAME}`;
    form.push(
      `  <!-- Honeypot: hidden from people, bots fill it in. In OSForms, set this form's Honeypot Field Name to "${HONEYPOT_NAME}". -->`,
      `  <div style="${HONEYPOT_STYLE}" aria-hidden="true">`,
      `    <label for="${hpId}">Leave this field empty</label>`,
      `    <input type="text" id="${hpId}" name="${HONEYPOT_NAME}" tabindex="-1" autocomplete="off">`,
      '  </div>'
    );
  }

  form.push(`  <button type="submit">${submitText}</button>`);

  if (options.submitMode === 'fetch') {
    form.push(
      `  <p${attrs([
        ['id', `${FORM_ID}-status`],
        ['class', styled ? 'form-status' : undefined],
        ['role', 'status'],
        ['aria-live', 'polite'],
      ])}></p>`
    );
  }

  form.push('</form>');

  const markup = [...(styled ? [BASIC_CSS] : []), ...form].join('\n');
  const code = [
    ...head,
    markup,
    ...(options.submitMode === 'fetch' ? [fetchScript()] : []),
  ].join('\n');

  const previewDocument = [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>Form preview</title>',
    '<style>html { background: #fff; color: #111; } body { margin: 20px; }</style>',
    '</head>',
    '<body>',
    markup,
    '</body>',
    '</html>',
  ].join('\n');

  return { code, previewDocument };
}

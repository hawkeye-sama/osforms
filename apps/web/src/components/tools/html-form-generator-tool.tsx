'use client';

import { Check, Copy, Plus, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import type {
  FieldKind,
  FormField,
  Styling,
  SubmitMode,
} from './html-form-generator-code';
import {
  createField,
  DEFAULT_ACTION,
  FIELD_KINDS,
  FIELD_PRESETS,
  generateForm,
  HONEYPOT_NAME,
  resolveFields,
} from './html-form-generator-code';
import { HtmlFormGeneratorFieldCard } from './html-form-generator-field-card';

function defaultFields(): FormField[] {
  return [
    createField('name', 'f1'),
    createField('email', 'f2'),
    createField('message', 'f3'),
  ];
}

const sectionHeader = 'mb-4 flex min-h-10 items-center justify-between gap-4';
const sectionHeading = 'text-foreground text-xl font-semibold tracking-tight';
const labelClass = 'text-foreground mb-2 block';
const hintClass = 'text-muted-foreground mt-1.5 text-xs leading-relaxed';

/** Rough rendered height per field so the preview iframe fits without scrolling. */
const PREVIEW_HEIGHT: Record<FieldKind, number> = {
  name: 82,
  email: 82,
  phone: 82,
  subject: 82,
  company: 82,
  select: 82,
  message: 210,
  checkbox: 44,
};

interface Choice<T extends string> {
  value: T;
  label: string;
  hint: string;
}

function ChoiceGroup<T extends string>({
  legend,
  name,
  value,
  choices,
  onChange,
}: {
  legend: string;
  name: string;
  value: T;
  choices: Choice<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-foreground mb-2 text-sm font-medium">
        {legend}
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {choices.map((choice) => {
          const checked = choice.value === value;
          return (
            <label
              key={choice.value}
              className={cn(
                'has-[:focus-visible]:ring-ring/60 cursor-pointer rounded-md border p-3 transition-colors has-[:focus-visible]:ring-2',
                checked
                  ? 'border-foreground/50 bg-secondary'
                  : 'border-border bg-card hover:bg-secondary/50'
              )}
            >
              <input
                type="radio"
                name={name}
                value={choice.value}
                checked={checked}
                onChange={() => onChange(choice.value)}
                className="sr-only"
              />
              <span className="text-foreground block text-sm font-medium">
                {choice.label}
              </span>
              <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                {choice.hint}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function HtmlFormGeneratorTool() {
  const [fields, setFields] = useState<FormField[]>(defaultFields);
  const [action, setAction] = useState(DEFAULT_ACTION);
  const [submitText, setSubmitText] = useState('Send message');
  const [honeypot, setHoneypot] = useState(true);
  const [styling, setStyling] = useState<Styling>('basic');
  const [submitMode, setSubmitMode] = useState<SubmitMode>('html');
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const nextId = useRef(4);
  const focusTarget = useRef<string | null>(null);

  // Restore keyboard focus after a reorder/remove moves DOM nodes around.
  useEffect(() => {
    if (focusTarget.current) {
      document.getElementById(focusTarget.current)?.focus();
      focusTarget.current = null;
    }
  });

  const { code, previewDocument } = generateForm(fields, {
    action,
    submitText,
    honeypot,
    styling,
    submitMode,
  });
  const outputNames = resolveFields(fields, honeypot).map((f) => f.attrName);

  const previewHeight = Math.min(
    1100,
    Math.max(
      320,
      150 +
        fields.reduce((sum, f) => sum + PREVIEW_HEIGHT[f.kind], 0) +
        (submitMode === 'fetch' ? 30 : 0)
    )
  );

  const labelOf = (f: FormField) =>
    f.label.trim() || FIELD_PRESETS[f.kind].label;

  function addField(kind: FieldKind) {
    const id = `f${nextId.current}`;
    nextId.current += 1;
    setFields((prev) => [...prev, createField(kind, id)]);
    setAnnouncement(
      `${FIELD_PRESETS[kind].title} field added at position ${fields.length + 1}.`
    );
  }

  function updateField(id: string, patch: Partial<FormField>) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  }

  function moveField(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= fields.length) {
      return;
    }
    const next = [...fields];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    setFields(next);

    let focusDir: 'up' | 'down' = direction === -1 ? 'up' : 'down';
    if (target === 0) {
      focusDir = 'down';
    } else if (target === next.length - 1) {
      focusDir = 'up';
    }
    focusTarget.current = `${moved.id}-${focusDir}`;
    setAnnouncement(
      `${labelOf(moved)} moved to position ${target + 1} of ${next.length}.`
    );
  }

  function removeField(index: number) {
    const removed = fields[index];
    const next = fields.filter((_, i) => i !== index);
    setFields(next);

    const neighbour = next[index] ?? next[index - 1];
    focusTarget.current = neighbour ? `${neighbour.id}-label` : 'hfg-add-name';
    setAnnouncement(`${labelOf(removed)} removed.`);
  }

  function reset() {
    setFields(defaultFields());
    setAction(DEFAULT_ACTION);
    setSubmitText('Send message');
    setHoneypot(true);
    setStyling('basic');
    setSubmitMode('html');
    setAnnouncement('Form reset to name, email and message.');
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setAnnouncement('Form code copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setAnnouncement('Copy failed. Select the code and copy it manually.');
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {/* ── Builder ─────────────────────────────── */}
      <div className="space-y-8">
        <section aria-labelledby="hfg-fields-heading">
          <div className={sectionHeader}>
            <h2 id="hfg-fields-heading" className={sectionHeading}>
              Fields
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={reset}
              className="text-muted-foreground hover:text-foreground h-10 sm:h-9"
            >
              <RotateCcw aria-hidden="true" />
              Reset
            </Button>
          </div>

          {fields.length > 0 ? (
            <ol className="space-y-4">
              {fields.map((field, i) => (
                <HtmlFormGeneratorFieldCard
                  key={field.id}
                  field={field}
                  index={i}
                  total={fields.length}
                  outputName={outputNames[i]}
                  onChange={(patch) => updateField(field.id, patch)}
                  onMove={(dir) => moveField(i, dir)}
                  onRemove={() => removeField(i)}
                />
              ))}
            </ol>
          ) : (
            <p className="border-border text-muted-foreground rounded-xl border border-dashed p-4 text-center text-sm sm:p-6">
              No fields yet. Add one below.
            </p>
          )}

          <div className="mt-6">
            <h3 className="text-foreground mb-2 text-sm font-medium">
              Add a field
            </h3>
            <div className="flex flex-wrap gap-2">
              {FIELD_KINDS.map((kind) => (
                <Button
                  key={kind}
                  id={`hfg-add-${kind}`}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addField(kind)}
                  className="text-foreground h-10 gap-1.5 sm:h-9"
                >
                  <Plus aria-hidden="true" />
                  {FIELD_PRESETS[kind].title}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="hfg-options-heading">
          <div className={sectionHeader}>
            <h2 id="hfg-options-heading" className={sectionHeading}>
              Options
            </h2>
          </div>

          <div className="border-border bg-card/40 space-y-6 rounded-xl border p-4 sm:p-6">
            <div>
              <Label htmlFor="hfg-action" className={labelClass}>
                Form action URL
              </Label>
              <Input
                id="hfg-action"
                value={action}
                inputMode="url"
                spellCheck={false}
                autoCapitalize="off"
                className="font-mono text-xs sm:text-sm"
                aria-describedby="hfg-action-hint"
                onChange={(e) => setAction(e.target.value)}
              />
              <p id="hfg-action-hint" className={hintClass}>
                Where the browser sends the data, with{' '}
                <code>method=&quot;POST&quot;</code>. Paste your OSForms
                endpoint, or any backend that accepts a form POST.
              </p>
            </div>

            <div>
              <Label htmlFor="hfg-submit" className={labelClass}>
                Submit button text
              </Label>
              <Input
                id="hfg-submit"
                value={submitText}
                onChange={(e) => setSubmitText(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <Switch
                  id="hfg-honeypot"
                  checked={honeypot}
                  onCheckedChange={setHoneypot}
                  aria-describedby="hfg-honeypot-hint"
                />
                <Label htmlFor="hfg-honeypot" className="text-foreground">
                  Add a honeypot field for spam
                </Label>
              </div>
              <p id="hfg-honeypot-hint" className={hintClass}>
                Adds an off-screen input named{' '}
                <code className="text-foreground font-mono">
                  {HONEYPOT_NAME}
                </code>{' '}
                that people never see (aria-hidden, tabindex=-1,
                autocomplete=off). In OSForms the honeypot name is set per form:
                open the form&apos;s Settings and enter{' '}
                <code className="text-foreground font-mono">
                  {HONEYPOT_NAME}
                </code>{' '}
                as the Honeypot Field Name. It has to match exactly.
              </p>
            </div>

            <ChoiceGroup<Styling>
              legend="Styling"
              name="hfg-styling"
              value={styling}
              onChange={setStyling}
              choices={[
                {
                  value: 'basic',
                  label: 'Basic CSS',
                  hint: 'A small scoped <style> block. No framework.',
                },
                {
                  value: 'unstyled',
                  label: 'Unstyled',
                  hint: 'Plain markup that inherits your site’s CSS.',
                },
              ]}
            />

            <ChoiceGroup<SubmitMode>
              legend="How it submits"
              name="hfg-mode"
              value={submitMode}
              onChange={setSubmitMode}
              choices={[
                {
                  value: 'html',
                  label: 'Plain HTML post',
                  hint: 'No JavaScript. The browser navigates to the response.',
                },
                {
                  value: 'fetch',
                  label: 'JavaScript (fetch)',
                  hint: 'Posts JSON and shows a success message on the page.',
                },
              ]}
            />

            <div className="border-border bg-background/60 rounded-xl border p-4">
              <h3 className="text-foreground text-sm font-semibold">
                What happens after submit
              </h3>
              <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                {submitMode === 'html'
                  ? 'With a plain HTML post to OSForms, set a Redirect URL in the form’s Settings and the endpoint answers with a 303 redirect to your thank-you page. Without one, the browser shows the JSON response ({"success": true}).'
                  : 'The script sends JSON, so OSForms always answers with JSON (never a redirect) and the script prints a success or error message under the button. Without JavaScript the form still posts normally.'}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── Output ──────────────────────────────── */}
      <section
        aria-labelledby="hfg-output-heading"
        className="min-w-0 lg:sticky lg:top-24"
      >
        <div className={sectionHeader}>
          <h2 id="hfg-output-heading" className={sectionHeading}>
            Your form
          </h2>
          <Button
            type="button"
            size="sm"
            onClick={copyCode}
            className="focus-visible:ring-offset-background h-10 sm:h-9"
          >
            {copied ? (
              <Check aria-hidden="true" />
            ) : (
              <Copy aria-hidden="true" />
            )}
            {copied ? 'Copied' : 'Copy HTML'}
          </Button>
        </div>

        <Tabs defaultValue="preview">
          <TabsList className="bg-card border-border border">
            <TabsTrigger
              value="preview"
              className="text-muted-foreground data-[state=active]:bg-secondary data-[state=active]:text-foreground"
            >
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="code"
              className="text-muted-foreground data-[state=active]:bg-secondary data-[state=active]:text-foreground"
            >
              HTML
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <div className="border-border overflow-hidden rounded-xl border bg-white">
              <iframe
                title="Preview of the generated contact form"
                sandbox=""
                srcDoc={previewDocument}
                style={{ height: previewHeight }}
                className="block w-full bg-white"
              />
            </div>
            <p className="text-muted-foreground mt-1.5 text-xs">
              Preview on a plain white page. Submitting is disabled here.
            </p>
          </TabsContent>

          <TabsContent value="code" className="mt-4">
            <div
              role="region"
              aria-label="Generated HTML code"
              tabIndex={0}
              className="border-border bg-background focus-visible:ring-ring/60 max-h-[70vh] overflow-auto rounded-xl border focus-visible:ring-2 focus-visible:outline-none"
            >
              <pre className="text-foreground/90 p-4 font-mono text-xs leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

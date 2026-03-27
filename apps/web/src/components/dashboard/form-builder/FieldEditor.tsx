'use client';

import type { FieldOption, FormField } from '@osforms/types';
import { Plus, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface FieldEditorProps {
  field: FormField;
  onChange: (updated: FormField) => void;
  onDelete: () => void;
}

export function FieldEditor({ field, onChange, onDelete }: FieldEditorProps) {
  function update(patch: Partial<FormField>) {
    onChange({ ...field, ...patch });
  }

  function updateConfig(patch: Partial<NonNullable<FormField['config']>>) {
    onChange({ ...field, config: { ...field.config, ...patch } });
  }

  function updateValidation(
    patch: Partial<NonNullable<FormField['validation']>>
  ) {
    onChange({ ...field, validation: { ...field.validation, ...patch } });
  }

  // ── Options helpers ────────────────────────────────────────────────────────
  function addOption() {
    const n = (field.options?.length ?? 0) + 1;
    const opt: FieldOption = {
      id: crypto.randomUUID(),
      label: `Option ${n}`,
      value: `option_${n}`,
    };
    update({ options: [...(field.options ?? []), opt] });
  }

  function updateOption(id: string, label: string) {
    update({
      options: (field.options ?? []).map((o) =>
        o.id === id
          ? { ...o, label, value: label.toLowerCase().replace(/\s+/g, '_') }
          : o
      ),
    });
  }

  function removeOption(id: string) {
    update({ options: (field.options ?? []).filter((o) => o.id !== id) });
  }

  const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <p className="text-foreground text-xs font-semibold tracking-wider uppercase">
          Field Settings
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground h-7 w-7"
          onClick={onDelete}
          title="Delete field"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {/* Label */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs">
            Question / Label <span className="text-red-400">*</span>
          </Label>
          <Input
            value={field.label}
            onChange={(e) => update({ label: e.target.value })}
            placeholder="e.g. What is your name?"
            className="bg-card text-sm"
          />
        </div>

        {/* Field key (optional override) */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs">
            Field key{' '}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Input
            value={field.id}
            onChange={(e) =>
              update({
                id: e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, '_')
                  .replace(/^_+/, ''),
              })
            }
            placeholder="auto_generated_from_label"
            className="bg-card font-mono text-xs"
            spellCheck={false}
          />
          <p className="text-muted-foreground text-xs">
            Submission key in payloads &amp; webhooks. Auto-set from label if
            left as-is.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs">
            Description (optional)
          </Label>
          <Input
            value={field.description ?? ''}
            onChange={(e) =>
              update({ description: e.target.value || undefined })
            }
            placeholder="Helper text shown below the label"
            className="bg-card text-sm"
          />
        </div>

        {/* Placeholder (text-like fields only) */}
        {['text', 'email', 'tel', 'url', 'number', 'textarea'].includes(
          field.type
        ) && (
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs">Placeholder</Label>
            <Input
              value={field.placeholder ?? ''}
              onChange={(e) =>
                update({ placeholder: e.target.value || undefined })
              }
              placeholder="Input placeholder text"
              className="bg-card text-sm"
            />
          </div>
        )}

        {/* Required toggle */}
        {field.type !== 'statement' && (
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground text-xs">Required</Label>
              <p className="text-muted-foreground text-xs">
                User must answer this field
              </p>
            </div>
            <Switch
              checked={field.required}
              onCheckedChange={(v) => update({ required: v })}
            />
          </div>
        )}

        {/* ── Options editor ──────────────────────────────────────────────── */}
        {hasOptions && (
          <div className="space-y-2">
            <Label className="text-foreground text-xs">Options</Label>
            <div className="space-y-1.5">
              {(field.options ?? []).map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <Input
                    value={opt.label}
                    onChange={(e) => updateOption(opt.id, e.target.value)}
                    className="bg-card text-sm"
                    placeholder="Option label"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground h-8 w-8 shrink-0"
                    onClick={() => removeOption(opt.id)}
                    disabled={(field.options?.length ?? 0) <= 1}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={addOption}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add option
            </Button>
          </div>
        )}

        {/* ── Rating config ───────────────────────────────────────────────── */}
        {field.type === 'rating' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs">Max Stars</Label>
              <Input
                type="number"
                min={3}
                max={10}
                value={field.config?.maxRating ?? 5}
                onChange={(e) =>
                  updateConfig({ maxRating: Number(e.target.value) })
                }
                className="bg-card text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-xs">
                Auto-advance on select
              </Label>
              <Switch
                checked={field.config?.autoAdvance ?? true}
                onCheckedChange={(v) => updateConfig({ autoAdvance: v })}
              />
            </div>
          </div>
        )}

        {/* ── Scale config ────────────────────────────────────────────────── */}
        {field.type === 'scale' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs">Min</Label>
                <Input
                  type="number"
                  value={field.config?.scaleMin ?? 1}
                  onChange={(e) =>
                    updateConfig({ scaleMin: Number(e.target.value) })
                  }
                  className="bg-card text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground text-xs">Max</Label>
                <Input
                  type="number"
                  value={field.config?.scaleMax ?? 10}
                  onChange={(e) =>
                    updateConfig({ scaleMax: Number(e.target.value) })
                  }
                  className="bg-card text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs">Low end label</Label>
              <Input
                value={field.config?.scaleLowLabel ?? ''}
                onChange={(e) =>
                  updateConfig({ scaleLowLabel: e.target.value })
                }
                placeholder="e.g. Not likely"
                className="bg-card text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground text-xs">High end label</Label>
              <Input
                value={field.config?.scaleHighLabel ?? ''}
                onChange={(e) =>
                  updateConfig({ scaleHighLabel: e.target.value })
                }
                placeholder="e.g. Very likely"
                className="bg-card text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-xs">
                Auto-advance on select
              </Label>
              <Switch
                checked={field.config?.autoAdvance ?? true}
                onCheckedChange={(v) => updateConfig({ autoAdvance: v })}
              />
            </div>
          </div>
        )}

        {/* ── Textarea rows ───────────────────────────────────────────────── */}
        {field.type === 'textarea' && (
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs">Rows</Label>
            <Input
              type="number"
              min={2}
              max={12}
              value={field.config?.rows ?? 4}
              onChange={(e) => updateConfig({ rows: Number(e.target.value) })}
              className="bg-card text-sm"
            />
          </div>
        )}

        {/* ── Validation ──────────────────────────────────────────────────── */}
        {['text', 'textarea'].includes(field.type) && (
          <div className="space-y-2">
            <Label className="text-foreground text-xs">Validation</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Min length
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={field.validation?.minLength ?? ''}
                  onChange={(e) =>
                    updateValidation({
                      minLength: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="0"
                  className="bg-card text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  Max length
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={field.validation?.maxLength ?? ''}
                  onChange={(e) =>
                    updateValidation({
                      maxLength: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="∞"
                  className="bg-card text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Statement content ───────────────────────────────────────────── */}
        {field.type === 'statement' && (
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs">Content</Label>
            <textarea
              value={field.description ?? ''}
              onChange={(e) =>
                update({ description: e.target.value || undefined })
              }
              placeholder="Statement text shown to the user..."
              rows={4}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

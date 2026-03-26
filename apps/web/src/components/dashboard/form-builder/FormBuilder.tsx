'use client';

import { OSForm } from '@osforms/react';
import type { FormField, FormMode, FormSchema } from '@osforms/types';
import {
  Eye,
  EyeOff,
  Layers,
  Loader2,
  MessageCircle,
  RefreshCw,
  Save,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { FieldEditor } from './FieldEditor';
import { FieldList } from './FieldList';
import { FieldPalette } from './FieldPalette';
import type { FieldTypeMeta } from './constants';
import { FIELD_TYPE_DEFAULTS } from './constants';

const EMPTY_SCHEMA: FormSchema = {
  mode: 'conversational',
  fields: [],
  settings: {
    showProgressBar: true,
    allowBack: true,
    showKeyboardHints: true,
    animationStyle: 'slide',
    submitLabel: 'Submit',
  },
  welcomeScreen: { enabled: false, title: 'Welcome', buttonLabel: 'Start' },
  thankYouScreen: { enabled: true, title: 'Thanks for your response!' },
};

interface FormBuilderProps {
  formId: string;
  initialSchema: FormSchema | null;
}

export function FormBuilder({ formId, initialSchema }: FormBuilderProps) {
  const [schema, setSchema] = useState<FormSchema>(
    initialSchema ?? EMPTY_SCHEMA
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const selectedField = schema.fields.find((f) => f.id === selectedId) ?? null;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function patchSchema(patch: Partial<FormSchema>) {
    setSchema((s) => ({ ...s, ...patch }));
    setIsDirty(true);
  }

  function patchFields(fields: FormField[]) {
    patchSchema({ fields });
  }

  // ── Field actions ──────────────────────────────────────────────────────────

  function addField(type: FieldTypeMeta['type']) {
    const id = `${type}_${Math.random().toString(36).slice(2, 8)}`;
    const defaults = FIELD_TYPE_DEFAULTS[type] ?? {};
    const field: FormField = {
      id,
      type,
      label: '',
      required: false,
      ...defaults,
    };
    patchFields([...schema.fields, field]);
    setSelectedId(id);
  }

  function updateField(updated: FormField) {
    // Use selectedId as the stable lookup — updated.id may differ if user changed the key
    const prevId = selectedId ?? updated.id;
    const prev = schema.fields.find((f) => f.id === prevId);
    let final = updated;

    const idChangedByUser = updated.id !== prevId;

    if (idChangedByUser) {
      // User manually edited the key — sync selectedId
      setSelectedId(updated.id);
    } else if (prev && updated.label !== prev.label && updated.label.trim()) {
      // Label changed and key wasn't manually edited — auto-derive from label
      const otherIds = schema.fields
        .filter((f) => f.id !== prevId)
        .map((f) => f.id);
      const base =
        updated.label
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '') || 'field';
      let slug = base;
      let n = 2;
      while (otherIds.includes(slug)) {
        slug = `${base}_${n}`;
        n++;
      }
      final = { ...updated, id: slug };
      setSelectedId(slug);
    }

    patchFields(schema.fields.map((f) => (f.id === prevId ? final : f)));
  }

  function deleteField(id: string) {
    patchFields(schema.fields.filter((f) => f.id !== id));
    setSelectedId(null);
  }

  function reorderFields(fields: FormField[]) {
    patchFields(fields);
  }

  // ── Mode ───────────────────────────────────────────────────────────────────

  function setMode(mode: FormMode) {
    patchSchema({ mode });
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/forms/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formSchema: schema }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Failed to save');
      }
      setIsDirty(false);
      toast.success('Builder saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-background border-border flex h-[calc(100vh-220px)] min-h-140 flex-col overflow-hidden rounded-lg border">
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="border-border flex items-center gap-3 border-b px-4 py-2.5">
        {/* Mode selector */}
        <div className="bg-secondary flex items-center rounded-md p-0.5">
          {(['conversational', 'classic'] as FormMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setMode(mode)}
              className={cn(
                'flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium capitalize transition-all',
                schema.mode === mode
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {mode === 'conversational' ? (
                <MessageCircle className="h-3 w-3" />
              ) : (
                <Layers className="h-3 w-3" />
              )}
              {mode}
            </button>
          ))}
        </div>

        {/* Field count */}
        <Badge variant="secondary" className="text-xs">
          {schema.fields.length} field{schema.fields.length !== 1 ? 's' : ''}
        </Badge>

        {/* Dirty indicator */}
        {isDirty && (
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Unsaved changes
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Save */}
        <Button size="sm" onClick={handleSave} disabled={!isDirty || saving}>
          {saving ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="mr-2 h-3.5 w-3.5" />
          )}
          {saving ? 'Saving...' : 'Save'}
        </Button>

        {/* Preview toggle */}
        <Button
          size="sm"
          variant={previewing ? 'default' : 'outline'}
          onClick={() => {
            setPreviewing((v) => !v);
            setPreviewKey((k) => k + 1);
          }}
        >
          {previewing ? (
            <EyeOff className="mr-2 h-3.5 w-3.5" />
          ) : (
            <Eye className="mr-2 h-3.5 w-3.5" />
          )}
          {previewing ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      {previewing ? (
        /* Preview mode */
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="border-border flex items-center justify-between border-b px-4 py-2">
            <p className="text-muted-foreground text-xs">
              Preview — submissions go to your real endpoint
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground h-7 gap-1.5 text-xs"
              onClick={() => setPreviewKey((k) => k + 1)}
            >
              <RefreshCw className="h-3 w-3" />
              Reset form
            </Button>
          </div>
          <div className="flex flex-1 items-start justify-center overflow-y-auto p-8">
            <div className="w-full max-w-xl">
              <OSForm
                key={previewKey}
                schema={schema}
                endpoint="/api/v1/preview"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Edit mode — three columns */
        <div className="flex min-h-0 flex-1">
          {/* Left: Palette */}
          <div className="border-border w-52 shrink-0 border-r">
            <FieldPalette onAdd={addField} />
          </div>

          {/* Center: Field list */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <FieldList
              fields={schema.fields}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onReorder={reorderFields}
              onAddFirst={() => addField('text')}
            />
          </div>

          {/* Right: Field editor */}
          <div className="border-border w-72 shrink-0 border-l">
            {selectedField ? (
              <FieldEditor
                field={selectedField}
                onChange={updateField}
                onDelete={() => deleteField(selectedField.id)}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Select a field to edit its settings
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

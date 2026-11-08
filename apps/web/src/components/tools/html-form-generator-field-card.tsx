'use client';

import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

import { badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import type { FormField } from './html-form-generator-code';
import { FIELD_PRESETS, sanitizeName } from './html-form-generator-code';

interface FieldCardProps {
  field: FormField;
  index: number;
  total: number;
  /** The name attribute that will actually be emitted (after de-duplication). */
  outputName: string;
  onChange: (patch: Partial<FormField>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

const iconButton = 'text-muted-foreground hover:text-foreground';
const labelClass = 'text-foreground mb-2 block';
const hintClass = 'text-muted-foreground mt-1.5 text-xs leading-relaxed';

export function HtmlFormGeneratorFieldCard({
  field,
  index,
  total,
  outputName,
  onChange,
  onMove,
  onRemove,
}: FieldCardProps) {
  const preset = FIELD_PRESETS[field.kind];
  const id = field.id;
  const displayLabel = field.label.trim() || preset.label;
  const typedName = sanitizeName(field.name);
  const renamed = typedName !== '' && typedName !== outputName;

  return (
    <li
      className="border-border bg-card/40 rounded-xl border p-4 sm:p-6"
      aria-labelledby={`${id}-heading`}
    >
      <div className="mb-4 flex min-h-10 items-center justify-between gap-2">
        <h4
          id={`${id}-heading`}
          className="text-foreground flex min-w-0 items-center gap-2 text-sm font-semibold"
        >
          <span className="text-muted-foreground font-mono text-xs tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="truncate">{displayLabel}</span>
          <span
            className={cn(
              badgeVariants({ variant: 'outline' }),
              'border-border text-muted-foreground shrink-0 rounded-md px-1.5 py-0 font-mono text-[10px] font-medium tracking-wide uppercase'
            )}
          >
            {preset.title}
          </span>
        </h4>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            id={`${id}-up`}
            className={iconButton}
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={`Move ${displayLabel} up`}
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            id={`${id}-down`}
            className={iconButton}
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={`Move ${displayLabel} down`}
          >
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={iconButton}
            onClick={onRemove}
            aria-label={`Remove ${displayLabel}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor={`${id}-label`} className={labelClass}>
            {field.kind === 'checkbox' ? 'Checkbox text' : 'Label'}
          </Label>
          <Input
            id={`${id}-label`}
            value={field.label}
            placeholder={preset.label}
            onChange={(e) => onChange({ label: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor={`${id}-name`} className={labelClass}>
            Name attribute
          </Label>
          <Input
            id={`${id}-name`}
            value={field.name}
            placeholder={preset.name}
            spellCheck={false}
            autoCapitalize="off"
            aria-describedby={`${id}-name-hint`}
            className="font-mono"
            onChange={(e) => onChange({ name: sanitizeName(e.target.value) })}
          />
          <p id={`${id}-name-hint`} className={hintClass}>
            {renamed ? (
              <>
                Duplicate or reserved name, so the output uses{' '}
                <code className="text-foreground font-mono">{outputName}</code>.
              </>
            ) : (
              'The key this value is stored under.'
            )}
          </p>
        </div>

        {field.kind !== 'checkbox' && (
          <div>
            <Label htmlFor={`${id}-placeholder`} className={labelClass}>
              {field.kind === 'select' ? 'Empty option text' : 'Placeholder'}
            </Label>
            <Input
              id={`${id}-placeholder`}
              value={field.placeholder}
              onChange={(e) => onChange({ placeholder: e.target.value })}
            />
          </div>
        )}

        {field.kind === 'select' && (
          <div className="sm:col-span-2">
            <Label htmlFor={`${id}-options`} className={labelClass}>
              Options (one per line)
            </Label>
            <Textarea
              id={`${id}-options`}
              rows={4}
              value={field.options.join('\n')}
              onChange={(e) =>
                onChange({ options: e.target.value.split('\n') })
              }
              className="border-border bg-card text-foreground focus-visible:ring-ring/20 focus-visible:ring-offset-0"
            />
          </div>
        )}

        <div className="flex items-center gap-3 sm:col-span-2">
          <Switch
            id={`${id}-required`}
            checked={field.required}
            onCheckedChange={(checked) => onChange({ required: checked })}
          />
          <Label htmlFor={`${id}-required`} className="text-foreground">
            Required
          </Label>
        </div>
      </div>
    </li>
  );
}

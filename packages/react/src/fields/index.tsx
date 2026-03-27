import type { FormField } from '@osforms/types';
import React, { KeyboardEvent } from 'react';
import type { ResolvedTheme } from '../utils/theme';

export interface FieldProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  onSubmit: (value?: unknown) => void;
  error?: string;
  theme: ResolvedTheme;
  autoFocus?: boolean;
  variant?: 'conversational' | 'classic';
}

// ─── Input style ──────────────────────────────────────────────────────────────

function inputStyle(
  theme: ResolvedTheme,
  hasError?: boolean,
  variant?: string,
  focused?: boolean
): React.CSSProperties {
  if (variant === 'conversational') {
    return {
      width: '100%',
      padding: '10px 0',
      background: 'transparent',
      border: 'none',
      borderBottom: `2px solid ${hasError ? theme.colors.error : focused ? theme.colors.primary : theme.colors.border}`,
      borderRadius: 0,
      color: theme.colors.text,
      fontSize: '20px',
      fontFamily: theme.fontFamily,
      outline: 'none',
      transition: 'border-color 150ms ease',
      caretColor: theme.colors.primary,
    };
  }
  return {
    width: '100%',
    padding: '12px 16px',
    background: theme.colors.surface,
    border: `1px solid ${hasError ? theme.colors.error : theme.colors.border}`,
    borderRadius: theme.borderRadius,
    color: theme.colors.text,
    fontSize: theme.fontSize,
    fontFamily: theme.fontFamily,
    outline: 'none',
    transition: 'border-color 150ms ease',
    boxSizing: 'border-box',
  };
}

// ─── Text / Email / Tel / URL / Number ───────────────────────────────────────

export function TextField({
  field,
  value,
  onChange,
  onSubmit,
  error,
  theme,
  autoFocus,
  variant,
}: FieldProps) {
  const [focused, setFocused] = React.useState(false);
  const typeMap: Record<string, string> = {
    text: 'text',
    email: 'email',
    tel: 'tel',
    url: 'url',
    number: 'number',
  };
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };
  return (
    <input
      type={typeMap[field.type] ?? 'text'}
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKey}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={field.placeholder}
      autoFocus={autoFocus}
      style={inputStyle(theme, !!error, variant, focused)}
    />
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

export function TextareaField({
  field,
  value,
  onChange,
  onSubmit,
  error,
  theme,
  autoFocus,
  variant,
}: FieldProps) {
  const [focused, setFocused] = React.useState(false);
  const rows = field.config?.rows ?? (variant === 'conversational' ? 3 : 4);
  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  };
  const style: React.CSSProperties =
    variant === 'conversational'
      ? {
          ...inputStyle(theme, !!error, variant, focused),
          resize: 'none',
          lineHeight: '1.6',
          padding: '10px 0',
        }
      : {
          ...inputStyle(theme, !!error),
          resize: 'vertical',
          lineHeight: '1.6',
        };

  return (
    <textarea
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKey}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={field.placeholder}
      rows={rows}
      autoFocus={autoFocus}
      style={style}
    />
  );
}

// ─── Radio ───────────────────────────────────────────────────────────────────

export function RadioField({
  field,
  value,
  onChange,
  onSubmit,
  theme,
  variant,
}: FieldProps) {
  const autoAdvance = field.config?.autoAdvance ?? true;
  const isConv = variant === 'conversational';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isConv ? '10px' : '8px',
      }}
    >
      {(field.options ?? []).map((opt, i) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              onChange(opt.value);
              if (autoAdvance) setTimeout(() => onSubmit(opt.value), 250);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: isConv ? '10px 14px' : '12px 16px',
              background: selected
                ? theme.colors.primary
                : theme.colors.surface,
              border: `1px solid ${selected ? theme.colors.primary : theme.colors.border}`,
              borderRadius: isConv ? '6px' : theme.borderRadius,
              color: selected ? theme.colors.background : theme.colors.text,
              fontSize: isConv ? '16px' : theme.fontSize,
              fontFamily: theme.fontFamily,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 150ms ease',
              width: '100%',
            }}
          >
            {isConv && (
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '4px',
                  border: `1px solid ${selected ? theme.colors.background : theme.colors.border}`,
                  background: selected
                    ? theme.colors.background
                    : 'transparent',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: selected
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
            )}
            {!isConv && (
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: `2px solid ${selected ? theme.colors.background : theme.colors.border}`,
                  background: selected
                    ? theme.colors.background
                    : 'transparent',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selected && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: theme.colors.primary,
                    }}
                  />
                )}
              </span>
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Checkbox ────────────────────────────────────────────────────────────────

export function CheckboxField({
  field,
  value,
  onChange,
  theme,
  variant,
}: FieldProps) {
  const selected: string[] = Array.isArray(value) ? (value as string[]) : [];
  const toggle = (v: string) => {
    onChange(
      selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]
    );
  };
  const isConv = variant === 'conversational';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {(field.options ?? []).map((opt) => {
        const checked = selected.includes(opt.value);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: isConv ? '10px 14px' : '12px 16px',
              background: checked ? theme.colors.primary : theme.colors.surface,
              border: `1px solid ${checked ? theme.colors.primary : theme.colors.border}`,
              borderRadius: isConv ? '6px' : theme.borderRadius,
              color: checked ? theme.colors.background : theme.colors.text,
              fontSize: isConv ? '16px' : theme.fontSize,
              fontFamily: theme.fontFamily,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 150ms ease',
              width: '100%',
            }}
          >
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                border: `2px solid ${checked ? theme.colors.background : theme.colors.border}`,
                background: checked ? theme.colors.background : 'transparent',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {checked && (
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path
                    d="M1 5L4.5 8.5L11 1"
                    stroke={theme.colors.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────

export function SelectField({
  field,
  value,
  onChange,
  onSubmit,
  error,
  theme,
  autoFocus,
  variant,
}: FieldProps) {
  const [focused, setFocused] = React.useState(false);
  const isConv = variant === 'conversational';
  return (
    <select
      value={String(value ?? '')}
      onChange={(e) => {
        onChange(e.target.value);
        onSubmit(e.target.value);
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      autoFocus={autoFocus}
      style={{
        ...inputStyle(theme, !!error, variant, focused),
        appearance: 'none',
        cursor: 'pointer',
        fontSize: isConv ? '20px' : theme.fontSize,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23a8a8a8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: isConv ? 'right 4px center' : 'right 16px center',
        paddingRight: isConv ? '28px' : '40px',
      }}
    >
      <option value="" disabled>
        {field.placeholder ?? 'Select an option...'}
      </option>
      {(field.options ?? []).map((opt) => (
        <option key={opt.id} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ─── Rating ──────────────────────────────────────────────────────────────────

export function RatingField({
  field,
  value,
  onChange,
  onSubmit,
  theme,
  variant,
}: FieldProps) {
  const max = field.config?.maxRating ?? 5;
  const current = Number(value ?? 0);
  const autoAdvance = field.config?.autoAdvance ?? true;
  const size = variant === 'conversational' ? '40px' : '32px';

  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => {
            onChange(star);
            if (autoAdvance) setTimeout(() => onSubmit(star), 300);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            fontSize: size,
            lineHeight: 1,
            color: star <= current ? '#fbbf24' : theme.colors.border,
            transition: 'color 100ms ease, transform 100ms ease',
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ─── Scale (NPS) ─────────────────────────────────────────────────────────────

export function ScaleField({
  field,
  value,
  onChange,
  onSubmit,
  theme,
  variant,
}: FieldProps) {
  const min = field.config?.scaleMin ?? 1;
  const max = field.config?.scaleMax ?? 10;
  const current = Number(value ?? -1);
  const autoAdvance = field.config?.autoAdvance ?? true;
  const nums = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  const isConv = variant === 'conversational';

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: isConv ? '5px' : '6px',
          flexWrap: 'nowrap',
          justifyContent: 'space-between',
        }}
      >
        {nums.map((n) => {
          const selected = n === current;
          return (
            <button
              key={n}
              type="button"
              onClick={() => {
                onChange(n);
                if (autoAdvance) setTimeout(() => onSubmit(n), 300);
              }}
              style={{
                width: isConv ? '44px' : '44px',
                height: isConv ? '44px' : '44px',
                background: selected
                  ? theme.colors.primary
                  : theme.colors.surface,
                border: `1px solid ${selected ? theme.colors.primary : theme.colors.border}`,
                borderRadius: isConv ? '6px' : theme.borderRadius,
                color: selected ? theme.colors.background : theme.colors.text,
                fontSize: isConv ? '16px' : '14px',
                fontFamily: theme.fontFamily,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                fontWeight: selected ? 600 : 400,
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      {(field.config?.scaleLowLabel || field.config?.scaleHighLabel) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px',
            fontSize: '12px',
            color: theme.colors.textSecondary,
          }}
        >
          <span>{field.config?.scaleLowLabel}</span>
          <span>{field.config?.scaleHighLabel}</span>
        </div>
      )}
    </div>
  );
}

// ─── Statement ────────────────────────────────────────────────────────────────

export function StatementField({ field, theme, variant }: FieldProps) {
  return (
    <p
      style={{
        fontSize: variant === 'conversational' ? '18px' : theme.fontSize,
        color: theme.colors.textSecondary,
        lineHeight: '1.7',
        margin: 0,
      }}
    >
      {field.description}
    </p>
  );
}

// ─── Field dispatcher ────────────────────────────────────────────────────────

export function FieldRenderer(props: FieldProps) {
  switch (props.field.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'url':
    case 'number':
      return <TextField {...props} />;
    case 'textarea':
      return <TextareaField {...props} />;
    case 'radio':
      return <RadioField {...props} />;
    case 'checkbox':
      return <CheckboxField {...props} />;
    case 'select':
      return <SelectField {...props} />;
    case 'rating':
      return <RatingField {...props} />;
    case 'scale':
      return <ScaleField {...props} />;
    case 'statement':
      return <StatementField {...props} />;
    default:
      return null;
  }
}

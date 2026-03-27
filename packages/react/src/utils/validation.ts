import type { FormField } from '@osforms/types';

export function validateField(field: FormField, value: unknown): string | null {
  const isEmpty =
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0);

  if (field.required && isEmpty) {
    return 'This field is required';
  }

  // Skip further validation if empty (field is optional)
  if (isEmpty) return null;

  // statement / divider — no validation
  if (field.type === 'statement' || field.type === 'divider') return null;

  const v = field.validation;
  const str = String(value);

  if (field.type === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
      return 'Please enter a valid email address';
    }
  }

  if (field.type === 'url') {
    try {
      new URL(str);
    } catch {
      return 'Please enter a valid URL';
    }
  }

  if (!v) return null;

  if (v.minLength !== undefined && str.length < v.minLength) {
    return `Minimum ${v.minLength} characters required`;
  }
  if (v.maxLength !== undefined && str.length > v.maxLength) {
    return `Maximum ${v.maxLength} characters allowed`;
  }
  if (v.pattern) {
    if (!new RegExp(v.pattern).test(str)) {
      return v.patternError ?? 'Invalid format';
    }
  }

  const num = Number(value);
  if (!isNaN(num)) {
    if (v.min !== undefined && num < v.min) {
      return `Minimum value is ${v.min}`;
    }
    if (v.max !== undefined && num > v.max) {
      return `Maximum value is ${v.max}`;
    }
  }

  return null;
}

import { useCallback, useMemo, useState } from 'react';
import type { FormField, FormSchema } from '@osforms/types';
import { getVisibleFields } from '../utils/conditional';
import { validateField } from '../utils/validation';

export interface FormState {
  answers: Record<string, unknown>;
  currentIndex: number;
  direction: 'forward' | 'backward';
  errors: Record<string, string>;
  isSubmitting: boolean;
  isComplete: boolean;
  showWelcome: boolean;
}

export interface FormStateActions {
  setAnswer: (fieldId: string, value: unknown) => void;
  advance: (overrideValue?: unknown) => boolean; // returns false if validation failed
  back: () => void;
  submit: () => Promise<void>;
  startForm: () => void; // dismisses welcome screen
  visibleFields: FormField[];
  currentField: FormField | undefined;
}

export function useFormState(
  schema: FormSchema | null,
  endpoint: string,
  onComplete?: () => void,
  onError?: (error: Error) => void
): [FormState, FormStateActions] {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showWelcome, setShowWelcome] = useState(
    () => schema?.welcomeScreen?.enabled ?? false
  );

  const visibleFields = useMemo(
    () => (schema ? getVisibleFields(schema.fields, answers) : []),
    [schema, answers]
  );

  const currentField = visibleFields[currentIndex];

  const setAnswer = useCallback((fieldId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    setErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  const advance = useCallback(
    (overrideValue?: unknown): boolean => {
      if (!currentField) return true;

      // Skip validation for statement fields
      if (currentField.type !== 'statement') {
        // Use overrideValue when provided (avoids stale closure on auto-advance)
        const valueToValidate =
          overrideValue !== undefined
            ? overrideValue
            : answers[currentField.id];
        const error = validateField(currentField, valueToValidate);
        if (error) {
          setErrors((prev) => ({ ...prev, [currentField.id]: error }));
          return false;
        }
      }

      if (currentIndex < visibleFields.length - 1) {
        setDirection('forward');
        setCurrentIndex((i) => i + 1);
      }
      return true;
    },
    [currentField, currentIndex, visibleFields.length, answers]
  );

  const back = useCallback(() => {
    if (currentIndex > 0) {
      setDirection('backward');
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const startForm = useCallback(() => {
    setShowWelcome(false);
  }, []);

  const submit = useCallback(async () => {
    if (!schema || isSubmitting) return;

    // Validate all visible fields
    const newErrors: Record<string, string> = {};
    for (const field of visibleFields) {
      if (field.type === 'statement') continue;
      const error = validateField(field, answers[field.id]);
      if (error) newErrors[field.id] = error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Jump to the first field with an error
      const firstErrorIndex = visibleFields.findIndex((f) => newErrors[f.id]);
      if (firstErrorIndex !== -1) {
        setDirection('backward');
        setCurrentIndex(firstErrorIndex);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Build payload: field IDs mapped to answers + _source tracking
      const payload: Record<string, unknown> = {};
      for (const field of visibleFields) {
        if (field.type === 'statement') continue;
        payload[field.id] = answers[field.id] ?? '';
      }
      if (schema.settings?.source) {
        payload['_source'] = schema.settings.source;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ??
            `Submission failed (${res.status})`
        );
      }

      setIsComplete(true);
      onComplete?.();
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error('Something went wrong. Please try again.');
      setErrors({ _form: error.message });
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [schema, isSubmitting, visibleFields, answers, endpoint, onComplete, onError]);

  const state: FormState = {
    answers,
    currentIndex,
    direction,
    errors,
    isSubmitting,
    isComplete,
    showWelcome,
  };

  const actions: FormStateActions = {
    setAnswer,
    advance,
    back,
    submit,
    startForm,
    visibleFields,
    currentField,
  };

  return [state, actions];
}

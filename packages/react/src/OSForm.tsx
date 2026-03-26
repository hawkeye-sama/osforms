import type { FormSchema, FormTheme } from '@osforms/types';
import React from 'react';
import { useFormSchema } from './hooks/useFormSchema';
import { ClassicRenderer } from './renderers/ClassicRenderer';
import { ConversationalRenderer } from './renderers/ConversationalRenderer';
import { resolveTheme } from './utils/theme';

export interface OSFormProps {
  /**
   * The form ID (slug) from your osforms dashboard.
   * The component fetches the schema automatically.
   * Either `formId` or `schema` is required.
   */
  formId?: string;

  /**
   * Pass a schema directly — no API fetch needed.
   * Useful for devs defining schemas in code without the dashboard builder.
   * Requires `endpoint` when used without `formId`.
   */
  schema?: FormSchema;

  /**
   * The osforms submission endpoint URL.
   * Defaults to `https://osforms.com/api/v1/f/{formId}` when using `formId`.
   * Required when using `schema` without `formId`.
   */
  endpoint?: string;

  /**
   * Base URL for the osforms API. Defaults to 'https://osforms.com'.
   * Override for self-hosted instances.
   */
  baseUrl?: string;

  /**
   * Override the form's mode. Falls back to the mode set in the schema.
   */
  mode?: 'conversational' | 'classic' | 'stepped';

  /**
   * Theme overrides — merged with the schema's theme and osforms defaults.
   */
  theme?: Partial<FormTheme>;

  /**
   * Called when the form is successfully submitted.
   */
  onComplete?: (submissionId?: string) => void;

  /**
   * Called when a submission error occurs.
   */
  onError?: (error: Error) => void;

  /**
   * Custom loading component.
   */
  loadingComponent?: React.ReactNode;

  /**
   * Custom error component.
   */
  errorComponent?: React.ReactNode;
}

export function OSForm({
  formId,
  schema: schemaProp,
  endpoint: endpointProp,
  baseUrl = 'https://osforms.com',
  mode: modeProp,
  theme: themeProp,
  onComplete,
  loadingComponent,
  errorComponent,
}: OSFormProps) {
  // ── Schema resolution ───────────────────────────────────────────────────────
  // If formId provided, fetch from API. Otherwise use the schema prop directly.
  const {
    schema: fetchedSchema,
    redirectUrl,
    loading,
    error,
  } = useFormSchema(formId ?? '', baseUrl);

  const schema = schemaProp ?? fetchedSchema;

  // ── Endpoint resolution ─────────────────────────────────────────────────────
  const endpoint =
    endpointProp ?? (formId ? `${baseUrl}/api/v1/f/${formId}` : '');

  // ── Loading state ───────────────────────────────────────────────────────────
  if (!schemaProp && loading) {
    return (
      <>
        {loadingComponent ?? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              color: '#a8a8a8',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
            }}
          >
            Loading form...
          </div>
        )}
      </>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (!schemaProp && error) {
    return (
      <>
        {errorComponent ?? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              color: '#ef4444',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}
      </>
    );
  }

  // ── No schema ───────────────────────────────────────────────────────────────
  if (!schema) {
    return null;
  }

  if (!endpoint) {
    console.error(
      '[OSForm] No endpoint provided. Pass `formId` or `endpoint`.'
    );
    return null;
  }

  // ── Resolve theme ────────────────────────────────────────────────────────────
  const resolvedTheme = resolveTheme({ ...schema.theme, ...themeProp });

  // ── Mode ─────────────────────────────────────────────────────────────────────
  const mode = modeProp ?? schema.mode ?? 'conversational';

  // ── Render ───────────────────────────────────────────────────────────────────
  const rendererProps = {
    schema,
    endpoint,
    redirectUrl,
    theme: resolvedTheme,
    onComplete,
  };

  if (mode === 'classic') {
    return <ClassicRenderer {...rendererProps} />;
  }

  // conversational (default) and stepped both use the conversational renderer for now
  return <ConversationalRenderer {...rendererProps} />;
}

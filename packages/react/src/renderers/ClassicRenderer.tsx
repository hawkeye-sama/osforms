import type { FormSchema } from '@osforms/types';
import React from 'react';
import { ThankYouScreen } from '../components/ThankYouScreen';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { FieldRenderer } from '../fields';
import { useFormState } from '../hooks/useFormState';
import type { ResolvedTheme } from '../utils/theme';

interface ClassicRendererProps {
  schema: FormSchema;
  endpoint: string;
  redirectUrl?: string | null;
  theme: ResolvedTheme;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  fullScreen?: boolean;
}

export function ClassicRenderer({
  schema,
  endpoint,
  redirectUrl,
  theme,
  onComplete,
  onError,
  fullScreen,
}: ClassicRendererProps) {
  const [state, actions] = useFormState(schema, endpoint, onComplete, onError);
  const { errors, isSubmitting, isComplete, showWelcome } = state;
  const { setAnswer, submit, startForm, visibleFields } = actions;

  const settings = schema.settings ?? {};

  const containerStyle: React.CSSProperties = fullScreen
    ? {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: theme.colors.background,
        fontFamily: theme.fontFamily,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }
    : {
        background: theme.colors.background,
        fontFamily: theme.fontFamily,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
      };

  if (showWelcome && schema.welcomeScreen?.enabled) {
    return (
      <div style={containerStyle}>
        <WelcomeScreen
          config={schema.welcomeScreen}
          onStart={startForm}
          theme={theme}
        />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div style={containerStyle}>
        {schema.thankYouScreen?.enabled ? (
          <ThankYouScreen
            config={schema.thankYouScreen}
            redirectUrl={redirectUrl}
            theme={theme}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '320px',
              padding: '48px 40px',
              color: theme.colors.text,
            }}
          >
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>
              Thanks for your response!
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div
        style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 32px' }}
      >
        {/* Form title */}
        {schema.settings?.source && (
          <div style={{ marginBottom: '36px' }}>
            <div
              style={{
                width: '32px',
                height: '3px',
                background: theme.colors.primary,
                borderRadius: '9999px',
              }}
            />
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
          noValidate
        >
          {visibleFields.map((field) => {
            if (field.type === 'divider') {
              return (
                <hr
                  key={field.id}
                  style={{
                    border: 'none',
                    borderTop: `1px solid ${theme.colors.border}`,
                    margin: 0,
                  }}
                />
              );
            }

            const error = errors[field.id];

            return (
              <div
                key={field.id}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                {field.type !== 'statement' && (
                  <label
                    style={{
                      display: 'block',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: theme.colors.text,
                      lineHeight: 1.3,
                    }}
                  >
                    {field.required && (
                      <span
                        style={{
                          color: theme.colors.error,
                          marginRight: '4px',
                        }}
                      >
                        *
                      </span>
                    )}
                    {field.label}
                  </label>
                )}
                {field.description && field.type !== 'statement' && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: theme.colors.textSecondary,
                      lineHeight: 1.5,
                    }}
                  >
                    {field.description}
                  </p>
                )}
                <FieldRenderer
                  field={field}
                  value={state.answers[field.id]}
                  onChange={(val) => setAnswer(field.id, val)}
                  onSubmit={() => {}}
                  error={error}
                  theme={theme}
                  variant="classic"
                />
                {error && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: theme.colors.error,
                      fontFamily: theme.fontFamily,
                    }}
                  >
                    {error}
                  </p>
                )}
              </div>
            );
          })}

          {errors['_form'] && (
            <p
              style={{
                margin: 0,
                padding: '12px 16px',
                background: `${theme.colors.error}18`,
                border: `1px solid ${theme.colors.error}40`,
                borderRadius: theme.borderRadius,
                color: theme.colors.error,
                fontSize: '14px',
              }}
            >
              {errors['_form']}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '13px 32px',
                background: isSubmitting
                  ? theme.colors.border
                  : theme.colors.primary,
                color: theme.colors.background,
                border: 'none',
                borderRadius: theme.borderRadius,
                fontSize: '15px',
                fontFamily: theme.fontFamily,
                fontWeight: 700,
                cursor: isSubmitting ? 'wait' : 'pointer',
                transition: 'opacity 150ms ease',
                letterSpacing: '0.01em',
              }}
            >
              {isSubmitting
                ? 'Submitting...'
                : (settings.submitLabel ?? 'Submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React from 'react'
import type { FormSchema } from '@osforms/types'
import { FieldRenderer } from '../fields'
import { WelcomeScreen } from '../components/WelcomeScreen'
import { ThankYouScreen } from '../components/ThankYouScreen'
import { useFormState } from '../hooks/useFormState'
import type { ResolvedTheme } from '../utils/theme'

interface ClassicRendererProps {
  schema: FormSchema
  endpoint: string
  redirectUrl?: string | null
  theme: ResolvedTheme
  onComplete?: (submissionId?: string) => void
}

export function ClassicRenderer({
  schema,
  endpoint,
  redirectUrl,
  theme,
  onComplete,
}: ClassicRendererProps) {
  const [state, actions] = useFormState(schema, endpoint, onComplete)
  const { errors, isSubmitting, isComplete, submissionId, showWelcome } = state
  const { setAnswer, submit, startForm, visibleFields } = actions

  const settings = schema.settings ?? {}

  const containerStyle: React.CSSProperties = {
    background: theme.colors.background,
    fontFamily: theme.fontFamily,
    borderRadius: theme.borderRadius,
    padding: '40px',
  }

  if (showWelcome && schema.welcomeScreen?.enabled) {
    return (
      <div style={containerStyle}>
        <WelcomeScreen config={schema.welcomeScreen} onStart={startForm} theme={theme} />
      </div>
    )
  }

  if (isComplete) {
    return (
      <div style={containerStyle}>
        {schema.thankYouScreen?.enabled ? (
          <ThankYouScreen
            config={schema.thankYouScreen}
            submissionId={submissionId}
            redirectUrl={redirectUrl}
            theme={theme}
          />
        ) : (
          <p style={{ color: theme.colors.text, fontSize: '20px', fontWeight: 600 }}>
            Thanks for your response!
          </p>
        )}
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <form
        onSubmit={(e) => { e.preventDefault(); submit() }}
        style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
        noValidate
      >
        {visibleFields.map((field) => {
          if (field.type === 'divider') {
            return (
              <hr
                key={field.id}
                style={{ border: 'none', borderTop: `1px solid ${theme.colors.border}` }}
              />
            )
          }

          const error = errors[field.id]

          return (
            <div key={field.id}>
              {field.type !== 'statement' && (
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: theme.colors.text,
                }}>
                  {field.required && (
                    <span style={{ color: theme.colors.error, marginRight: '4px' }}>*</span>
                  )}
                  {field.label}
                </label>
              )}
              {field.description && field.type !== 'statement' && (
                <p style={{
                  margin: '0 0 8px',
                  fontSize: '13px',
                  color: theme.colors.textSecondary,
                  lineHeight: 1.5,
                }}>
                  {field.description}
                </p>
              )}
              <FieldRenderer
                field={field}
                value={state.answers[field.id]}
                onChange={(val) => setAnswer(field.id, val)}
                onSubmit={() => {}}   // no auto-advance in classic mode
                error={error}
                theme={theme}
              />
              {error && (
                <p style={{
                  margin: '6px 0 0',
                  fontSize: '13px',
                  color: theme.colors.error,
                }}>
                  {error}
                </p>
              )}
            </div>
          )
        })}

        {errors['_form'] && (
          <p style={{ color: theme.colors.error, fontSize: '14px', margin: 0 }}>
            {errors['_form']}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '12px 28px',
            background: isSubmitting ? theme.colors.border : theme.colors.primary,
            color: theme.colors.background,
            border: 'none',
            borderRadius: theme.borderRadius,
            fontSize: theme.fontSize,
            fontFamily: theme.fontFamily,
            fontWeight: 600,
            cursor: isSubmitting ? 'wait' : 'pointer',
            alignSelf: 'flex-start',
            transition: 'background 150ms ease',
          }}
        >
          {isSubmitting ? 'Submitting...' : (settings.submitLabel ?? 'Submit')}
        </button>
      </form>
    </div>
  )
}

import React, { useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { FormSchema } from '@osforms/types'
import { FieldRenderer } from '../fields'
import { ProgressBar } from '../components/ProgressBar'
import { WelcomeScreen } from '../components/WelcomeScreen'
import { ThankYouScreen } from '../components/ThankYouScreen'
import { useFormState } from '../hooks/useFormState'
import type { ResolvedTheme } from '../utils/theme'

const variants = {
  enter: (direction: 'forward' | 'backward') => ({
    y: direction === 'forward' ? 48 : -48,
    opacity: 0,
  }),
  center: { y: 0, opacity: 1 },
  exit: (direction: 'forward' | 'backward') => ({
    y: direction === 'forward' ? -48 : 48,
    opacity: 0,
  }),
}

const transition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }

interface ConversationalRendererProps {
  schema: FormSchema
  endpoint: string
  redirectUrl?: string | null
  theme: ResolvedTheme
  onComplete?: (submissionId?: string) => void
}

export function ConversationalRenderer({
  schema,
  endpoint,
  redirectUrl,
  theme,
  onComplete,
}: ConversationalRendererProps) {
  const [state, actions] = useFormState(schema, endpoint, onComplete)
  const { currentIndex, direction, errors, isSubmitting, isComplete, submissionId, showWelcome } = state
  const { setAnswer, advance, back, submit, startForm, visibleFields, currentField } = actions

  const settings = schema.settings ?? {}
  const isLastField = currentIndex === visibleFields.length - 1
  const isStatement = currentField?.type === 'statement'

  // ── Keyboard navigation ───────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isComplete || showWelcome) return
      if (e.key === 'Enter' && !['textarea'].includes(currentField?.type ?? '')) {
        e.preventDefault()
        if (isLastField) submit()
        else advance()
      }
      if (e.key === 'Backspace' && !currentField) back()
    },
    [isComplete, showWelcome, currentField, isLastField, advance, back, submit]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // ── Container styles ──────────────────────────────────────────────────────
  const containerStyle: React.CSSProperties = {
    background: theme.colors.background,
    fontFamily: theme.fontFamily,
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.borderRadius,
  }

  // ── Welcome screen ────────────────────────────────────────────────────────
  if (showWelcome && schema.welcomeScreen?.enabled) {
    return (
      <div style={containerStyle}>
        <WelcomeScreen
          config={schema.welcomeScreen}
          onStart={startForm}
          theme={theme}
        />
      </div>
    )
  }

  // ── Thank you screen ──────────────────────────────────────────────────────
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
          <div style={{ padding: '48px 40px', color: theme.colors.text, fontFamily: theme.fontFamily }}>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Thanks for your response!</p>
          </div>
        )}
      </div>
    )
  }

  if (!currentField) return null

  const currentValue = state.answers[currentField.id]
  const currentError = errors[currentField.id] ?? errors['_form']

  return (
    <div style={containerStyle}>
      {/* Progress bar */}
      {(settings.showProgressBar ?? true) && visibleFields.length > 1 && (
        <div style={{ padding: '16px 40px 0' }}>
          <ProgressBar
            current={currentIndex}
            total={visibleFields.length}
            style={settings.progressBarStyle ?? 'bar'}
            theme={theme}
          />
        </div>
      )}

      {/* Question area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px',
        minHeight: '320px',
        position: 'relative',
      }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentField.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            style={{ width: '100%' }}
          >
            {/* Question label */}
            {currentField.type !== 'statement' && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 600,
                  color: theme.colors.text,
                  lineHeight: 1.4,
                }}>
                  {currentField.required && (
                    <span style={{ color: theme.colors.error, marginRight: '4px' }}>*</span>
                  )}
                  {currentField.label}
                </p>
                {currentField.description && (
                  <p style={{
                    margin: '6px 0 0',
                    fontSize: '14px',
                    color: theme.colors.textSecondary,
                    lineHeight: 1.6,
                  }}>
                    {currentField.description}
                  </p>
                )}
              </div>
            )}

            {/* Field input */}
            <div style={{ maxWidth: '520px' }}>
              <FieldRenderer
                field={currentField}
                value={currentValue}
                onChange={(val) => setAnswer(currentField.id, val)}
                onSubmit={(val) => isLastField ? submit() : advance(val)}
                error={currentError}
                theme={theme}
                autoFocus
              />
            </div>

            {/* Error */}
            {currentError && (
              <p style={{
                margin: '8px 0 0',
                fontSize: '13px',
                color: theme.colors.error,
                fontFamily: theme.fontFamily,
              }}>
                {currentError}
              </p>
            )}

            {/* Keyboard hint */}
            {(settings.showKeyboardHints ?? true) && !isStatement &&
              !['radio', 'checkbox', 'rating', 'scale', 'select'].includes(currentField.type) && (
              <p style={{
                margin: '12px 0 0',
                fontSize: '12px',
                color: theme.colors.textSecondary,
              }}>
                {currentField.type === 'textarea'
                  ? 'Press Cmd+Enter ↵ to continue'
                  : 'Press Enter ↵ to continue'}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 40px 24px',
        gap: '12px',
      }}>
        {/* Back button */}
        <button
          type="button"
          onClick={back}
          disabled={currentIndex === 0}
          style={{
            background: 'none',
            border: 'none',
            color: currentIndex === 0 ? theme.colors.border : theme.colors.textSecondary,
            fontSize: '13px',
            fontFamily: theme.fontFamily,
            cursor: currentIndex === 0 ? 'default' : 'pointer',
            padding: '8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          ← Back
        </button>

        {/* Next / Submit */}
        <button
          type="button"
          onClick={() => isLastField ? submit() : advance()}
          disabled={isSubmitting}
          style={{
            padding: '10px 24px',
            background: isSubmitting ? theme.colors.border : theme.colors.primary,
            color: theme.colors.background,
            border: 'none',
            borderRadius: theme.borderRadius,
            fontSize: '14px',
            fontFamily: theme.fontFamily,
            fontWeight: 600,
            cursor: isSubmitting ? 'wait' : 'pointer',
            transition: 'background 150ms ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isSubmitting
            ? 'Submitting...'
            : isLastField
              ? (settings.submitLabel ?? 'Submit')
              : 'OK →'}
        </button>
      </div>
    </div>
  )
}

import type { FormSchema } from '@osforms/types';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect } from 'react';
import { ThankYouScreen } from '../components/ThankYouScreen';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { FieldRenderer } from '../fields';
import { useFormState } from '../hooks/useFormState';
import type { ResolvedTheme } from '../utils/theme';

const variants = {
  enter: (direction: 'forward' | 'backward') => ({
    y: direction === 'forward' ? 40 : -40,
    opacity: 0,
  }),
  center: { y: 0, opacity: 1 },
  exit: (direction: 'forward' | 'backward') => ({
    y: direction === 'forward' ? -40 : 40,
    opacity: 0,
  }),
};

const transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

// Field types that auto-advance — skip showing the OK button
const AUTO_ADVANCE_TYPES = new Set(['radio', 'rating', 'scale', 'select']);

interface ConversationalRendererProps {
  schema: FormSchema;
  endpoint: string;
  redirectUrl?: string | null;
  theme: ResolvedTheme;
  onComplete?: (submissionId?: string) => void;
  fullScreen?: boolean;
}

export function ConversationalRenderer({
  schema,
  endpoint,
  redirectUrl,
  theme,
  onComplete,
  fullScreen,
}: ConversationalRendererProps) {
  const [state, actions] = useFormState(schema, endpoint, onComplete);
  const {
    currentIndex,
    direction,
    errors,
    isSubmitting,
    isComplete,
    submissionId,
    showWelcome,
  } = state;
  const {
    setAnswer,
    advance,
    back,
    submit,
    startForm,
    visibleFields,
    currentField,
  } = actions;

  const settings = schema.settings ?? {};
  const isLastField = currentIndex === visibleFields.length - 1;
  const isStatement = currentField?.type === 'statement';
  // Respect field-level config.autoAdvance — only fall back to type-based default if not set
  const isAutoAdvance = currentField
    ? (currentField.config?.autoAdvance ??
      AUTO_ADVANCE_TYPES.has(currentField.type))
    : false;
  const showOkButton = !isAutoAdvance || isStatement;

  // ── Keyboard navigation ───────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isComplete || showWelcome) return;
      if (
        e.key === 'Enter' &&
        !['textarea'].includes(currentField?.type ?? '')
      ) {
        e.preventDefault();
        if (isLastField) submit();
        else advance();
      }
    },
    [isComplete, showWelcome, currentField, isLastField, advance, submit]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Container ────────────────────────────────────────────────────────────
  const containerStyle: React.CSSProperties = fullScreen
    ? {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: theme.colors.background,
        fontFamily: theme.fontFamily,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }
    : {
        background: theme.colors.background,
        fontFamily: theme.fontFamily,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '540px',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      };

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
    );
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
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
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

  if (!currentField) return null;

  const currentValue = state.answers[currentField.id];
  const currentError = errors[currentField.id] ?? errors['_form'];

  const questionNumber = String(currentIndex + 1).padStart(2, '0');
  const showProgressBar = settings.showProgressBar ?? true;
  const totalFields = visibleFields.length;
  const progressPercent =
    totalFields === 0 ? 0 : Math.round((currentIndex / totalFields) * 100);

  return (
    <div style={containerStyle}>
      {/* ── Progress bar — thin strip at very top ──────────────────────── */}
      {showProgressBar && totalFields > 1 && (
        <div
          style={{
            height: '3px',
            background: theme.colors.border,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: theme.colors.primary,
              transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
      )}

      {/* ── Centered content area ─────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 40px',
          overflow: 'hidden',
        }}
      >
        <div style={{ width: '100%', maxWidth: '560px' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentField.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              {/* Question number */}
              {currentField.type !== 'statement' && totalFields > 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: theme.colors.textSecondary,
                  }}
                >
                  <span>{questionNumber}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 4.5L6 8.5L10 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}

              {/* Question label */}
              {currentField.type !== 'statement' && (
                <p
                  style={{
                    margin: '0 0 28px',
                    fontSize: '22px',
                    fontWeight: 700,
                    color: theme.colors.text,
                    lineHeight: 1.35,
                  }}
                >
                  {currentField.required && (
                    <span
                      style={{ color: theme.colors.error, marginRight: '6px' }}
                    >
                      *
                    </span>
                  )}
                  {currentField.label}
                </p>
              )}

              {currentField.description &&
                currentField.type !== 'statement' && (
                  <p
                    style={{
                      margin: '-16px 0 20px',
                      fontSize: '14px',
                      color: theme.colors.textSecondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {currentField.description}
                  </p>
                )}

              {/* Field input — text-like fields capped at 480px, wide fields (scale, radio, etc.) get full 560px */}
              <div
                style={{
                  maxWidth: [
                    'text',
                    'email',
                    'tel',
                    'url',
                    'number',
                    'textarea',
                    'select',
                  ].includes(currentField.type)
                    ? '480px'
                    : undefined,
                }}
              >
                <FieldRenderer
                  field={currentField}
                  value={currentValue}
                  onChange={(val) => setAnswer(currentField.id, val)}
                  onSubmit={(val) => (isLastField ? submit() : advance(val))}
                  error={currentError}
                  theme={theme}
                  autoFocus
                  variant="conversational"
                />
              </div>

              {/* Error */}
              {currentError && (
                <p
                  style={{
                    margin: '10px 0 0',
                    fontSize: '13px',
                    color: theme.colors.error,
                    fontFamily: theme.fontFamily,
                  }}
                >
                  {currentError}
                </p>
              )}

              {/* OK button + keyboard hint */}
              {showOkButton && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    marginTop: '24px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => (isLastField ? submit() : advance())}
                    disabled={isSubmitting}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '11px 22px',
                      background: isSubmitting
                        ? theme.colors.border
                        : theme.colors.primary,
                      color: theme.colors.background,
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '15px',
                      fontFamily: theme.fontFamily,
                      fontWeight: 700,
                      cursor: isSubmitting ? 'wait' : 'pointer',
                      letterSpacing: '0.01em',
                      transition: 'opacity 150ms ease',
                    }}
                  >
                    {isSubmitting
                      ? 'Submitting...'
                      : isLastField
                        ? (settings.submitLabel ?? 'Submit')
                        : 'OK'}
                    {!isSubmitting && !isLastField && (
                      <svg
                        width="14"
                        height="11"
                        viewBox="0 0 14 11"
                        fill="none"
                      >
                        <path
                          d="M1 5.5L5.5 10L13 1"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>

                  {(settings.showKeyboardHints ?? true) &&
                    !isStatement &&
                    !isLastField && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {currentField.type === 'textarea'
                          ? 'Cmd+Enter ↵'
                          : 'Press Enter ↵'}
                      </span>
                    )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Navigation arrows — absolute bottom-right ─────────────────── */}
      {(settings.allowBack ?? true) && totalFields > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '24px',
            display: 'flex',
            gap: '4px',
          }}
        >
          {[
            { label: '↑', action: back, disabled: currentIndex === 0 },
            {
              label: '↓',
              action: () => (isLastField ? submit() : advance()),
              disabled: isSubmitting,
            },
          ].map(({ label, action, disabled }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              disabled={disabled}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: `1px solid ${disabled ? theme.colors.border : theme.colors.border}`,
                borderRadius: '4px',
                color: disabled
                  ? theme.colors.border
                  : theme.colors.textSecondary,
                fontSize: '16px',
                cursor: disabled ? 'default' : 'pointer',
                transition: 'all 150ms ease',
                fontFamily: 'system-ui',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

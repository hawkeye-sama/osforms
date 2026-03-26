import React, { useEffect } from 'react'
import type { ThankYouScreen as ThankYouScreenConfig } from '@osforms/types'
import type { ResolvedTheme } from '../utils/theme'

interface ThankYouScreenProps {
  config: ThankYouScreenConfig
  submissionId?: string
  redirectUrl?: string | null
  theme: ResolvedTheme
}

export function ThankYouScreen({ config, submissionId, redirectUrl, theme }: ThankYouScreenProps) {
  const finalRedirect = config.redirectUrl ?? redirectUrl

  useEffect(() => {
    if (!finalRedirect) return
    const delay = (config.redirectDelay ?? 3) * 1000
    const timer = setTimeout(() => {
      window.location.href = finalRedirect
    }, delay)
    return () => clearTimeout(timer)
  }, [finalRedirect, config.redirectDelay])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '48px 40px',
      minHeight: '300px',
      gap: '16px',
    }}>
      {/* Checkmark */}
      <div style={{
        width: '56px', height: '56px', borderRadius: '50%',
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
          <path d="M2 10L9 17L22 2" stroke={theme.colors.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div>
        <h2 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: 700,
          color: theme.colors.text,
          fontFamily: theme.fontFamily,
          lineHeight: 1.2,
        }}>
          {config.title ?? "Thanks for your response!"}
        </h2>
        {config.description && (
          <p style={{
            margin: '10px 0 0',
            fontSize: theme.fontSize,
            color: theme.colors.textSecondary,
            fontFamily: theme.fontFamily,
            lineHeight: 1.6,
          }}>
            {config.description}
          </p>
        )}
      </div>

      {config.showSubmissionId && submissionId && (
        <p style={{
          margin: 0,
          fontSize: '12px',
          color: theme.colors.textSecondary,
          fontFamily: 'monospace',
        }}>
          Reference: {submissionId}
        </p>
      )}
    </div>
  )
}

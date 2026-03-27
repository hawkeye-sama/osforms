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
    const timer = setTimeout(() => { window.location.href = finalRedirect }, delay)
    return () => clearTimeout(timer)
  }, [finalRedirect, config.redirectDelay])

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 40px',
    }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>

        {/* Checkmark */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: theme.colors.surface,
          border: `2px solid ${theme.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '28px',
        }}>
          <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
            <path
              d="M2 9L8.5 15.5L20 2"
              stroke={theme.colors.primary}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 style={{
          margin: 0,
          fontSize: '28px',
          fontWeight: 700,
          color: theme.colors.text,
          fontFamily: theme.fontFamily,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        }}>
          {config.title ?? 'Thanks for your response!'}
        </h2>

        {config.description && (
          <p style={{
            margin: '12px 0 0',
            fontSize: '16px',
            color: theme.colors.textSecondary,
            fontFamily: theme.fontFamily,
            lineHeight: 1.65,
            maxWidth: '440px',
          }}>
            {config.description}
          </p>
        )}

        {config.showSubmissionId && submissionId && (
          <p style={{
            marginTop: '24px',
            padding: '10px 14px',
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '6px',
            fontSize: '12px',
            color: theme.colors.textSecondary,
            fontFamily: 'monospace',
            display: 'inline-block',
          }}>
            ID: {submissionId}
          </p>
        )}

        {finalRedirect && (
          <p style={{
            marginTop: '20px',
            fontSize: '13px',
            color: theme.colors.textSecondary,
            fontFamily: theme.fontFamily,
          }}>
            Redirecting in {config.redirectDelay ?? 3}s...
          </p>
        )}
      </div>
    </div>
  )
}

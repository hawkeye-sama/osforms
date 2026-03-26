import React from 'react'
import type { WelcomeScreen as WelcomeScreenConfig } from '@osforms/types'
import type { ResolvedTheme } from '../utils/theme'

interface WelcomeScreenProps {
  config: WelcomeScreenConfig
  onStart: () => void
  theme: ResolvedTheme
}

export function WelcomeScreen({ config, onStart, theme }: WelcomeScreenProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '48px 40px',
      minHeight: '300px',
      gap: '24px',
    }}>
      {config.imageUrl && (
        <img
          src={config.imageUrl}
          alt=""
          style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: theme.borderRadius }}
        />
      )}
      <div>
        <h2 style={{
          margin: 0,
          fontSize: '28px',
          fontWeight: 700,
          color: theme.colors.text,
          fontFamily: theme.fontFamily,
          lineHeight: 1.2,
        }}>
          {config.title}
        </h2>
        {config.description && (
          <p style={{
            margin: '12px 0 0',
            fontSize: theme.fontSize,
            color: theme.colors.textSecondary,
            fontFamily: theme.fontFamily,
            lineHeight: 1.6,
          }}>
            {config.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onStart}
        style={{
          padding: '12px 28px',
          background: theme.colors.primary,
          color: theme.colors.background,
          border: 'none',
          borderRadius: theme.borderRadius,
          fontSize: theme.fontSize,
          fontFamily: theme.fontFamily,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'opacity 150ms ease',
        }}
      >
        {config.buttonLabel ?? 'Start'}
      </button>
    </div>
  )
}

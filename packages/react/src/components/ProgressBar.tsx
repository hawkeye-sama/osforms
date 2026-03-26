import React from 'react'
import type { ResolvedTheme } from '../utils/theme'

interface ProgressBarProps {
  current: number   // 0-based index
  total: number
  style?: 'bar' | 'steps' | 'percentage'
  theme: ResolvedTheme
}

export function ProgressBar({ current, total, style = 'bar', theme }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round(((current) / total) * 100)

  if (style === 'percentage') {
    return (
      <div style={{
        fontSize: '13px',
        color: theme.colors.textSecondary,
        fontFamily: theme.fontFamily,
      }}>
        {percent}% completed
      </div>
    )
  }

  if (style === 'steps') {
    return (
      <div style={{
        fontSize: '13px',
        color: theme.colors.textSecondary,
        fontFamily: theme.fontFamily,
      }}>
        {current} / {total}
      </div>
    )
  }

  // Default: bar
  return (
    <div style={{
      width: '100%',
      height: '3px',
      background: theme.colors.border,
      borderRadius: '9999px',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: `${percent}%`,
        background: theme.colors.primary,
        borderRadius: '9999px',
        transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }} />
    </div>
  )
}

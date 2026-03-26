import type { FormTheme } from '@osforms/types'

// osforms dark theme defaults (matches the dashboard design system)
const defaultTheme: Required<FormTheme> = {
  colors: {
    background: '#0a0a0a',
    surface: '#212121',
    primary: '#fafafa',
    text: '#fafafa',
    textSecondary: '#a8a8a8',
    border: '#333333',
    error: '#ef4444',
  },
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  fontSize: 'md',
  borderRadius: 'md',
  buttonVariant: 'solid',
}

const fontSizeMap = { sm: '14px', md: '16px', lg: '18px' }
const borderRadiusMap = { none: '0px', sm: '4px', md: '8px', lg: '12px', full: '9999px' }

export interface ResolvedTheme {
  colors: Required<NonNullable<FormTheme['colors']>>
  fontFamily: string
  fontSize: string
  borderRadius: string
  buttonVariant: 'solid' | 'outline' | 'ghost'
}

export function resolveTheme(override?: FormTheme): ResolvedTheme {
  const colors = {
    ...defaultTheme.colors,
    ...override?.colors,
  } as Required<NonNullable<FormTheme['colors']>>

  const fontSize = fontSizeMap[override?.fontSize ?? defaultTheme.fontSize]
  const borderRadius =
    borderRadiusMap[override?.borderRadius ?? defaultTheme.borderRadius]

  return {
    colors,
    fontFamily: override?.fontFamily ?? defaultTheme.fontFamily,
    fontSize,
    borderRadius,
    buttonVariant: override?.buttonVariant ?? defaultTheme.buttonVariant,
  }
}

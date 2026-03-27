import type { WelcomeScreen as WelcomeScreenConfig } from '@osforms/types';
import type { ResolvedTheme } from '../utils/theme';

interface WelcomeScreenProps {
  config: WelcomeScreenConfig;
  onStart: () => void;
  theme: ResolvedTheme;
}

export function WelcomeScreen({ config, onStart, theme }: WelcomeScreenProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '560px' }}>
        {config.imageUrl && (
          <img
            src={config.imageUrl}
            alt=""
            style={{
              maxWidth: '100%',
              maxHeight: '140px',
              objectFit: 'contain',
              borderRadius: theme.borderRadius,
              marginBottom: '32px',
              display: 'block',
            }}
          />
        )}

        <h2
          style={{
            margin: 0,
            fontSize: '32px',
            fontWeight: 700,
            color: theme.colors.text,
            fontFamily: theme.fontFamily,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {config.title}
        </h2>

        {config.description && (
          <p
            style={{
              margin: '14px 0 0',
              fontSize: '17px',
              color: theme.colors.textSecondary,
              fontFamily: theme.fontFamily,
              lineHeight: 1.65,
              maxWidth: '480px',
            }}
          >
            {config.description}
          </p>
        )}

        <button
          type="button"
          onClick={onStart}
          style={{
            marginTop: '36px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '13px 28px',
            background: theme.colors.primary,
            color: theme.colors.background,
            border: 'none',
            borderRadius: '4px',
            fontSize: '15px',
            fontFamily: theme.fontFamily,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.01em',
            transition: 'opacity 150ms ease',
          }}
        >
          {config.buttonLabel ?? 'Start'}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 7h10M8 3l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

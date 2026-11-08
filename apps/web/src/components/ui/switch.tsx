'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        ref={ref}
        className={cn(
          'peer focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          checked
            ? 'bg-primary border-primary'
            : 'bg-secondary border-border hover:border-muted-foreground/60',
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none block h-4 w-4 rounded-full shadow-sm ring-0 transition-transform duration-150',
            checked
              ? 'bg-background translate-x-[22px]'
              : 'bg-muted-foreground translate-x-[3px]'
          )}
        />
      </button>
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };

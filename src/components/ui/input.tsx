import { Check, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: 'default' | 'success' | 'error';
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state = 'default', errorMessage, ...props }, ref) => {
    const [shouldShake, setShouldShake] = React.useState(false);

    React.useEffect(() => {
      if (state === 'error') {
        setShouldShake(true);
        const timer = setTimeout(() => setShouldShake(false), 400);
        return () => clearTimeout(timer);
      }
    }, [state]);

    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            'bg-card text-foreground ring-offset-background file:text-foreground placeholder:text-muted-foreground flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-all duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            state === 'default' &&
              'border-border focus-visible:ring-ring/20 focus-visible:border-border focus-visible:ring-2',
            state === 'success' &&
              'border-green-500 pr-10 focus-visible:ring-2 focus-visible:ring-green-500/20',
            state === 'error' &&
              'border-red-500 pr-10 focus-visible:ring-2 focus-visible:ring-red-500/20',
            shouldShake && 'animate-shake',
            className
          )}
          ref={ref}
          {...props}
        />
        {state === 'success' && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <Check className="animate-scale-in h-4 w-4 text-green-500" />
          </div>
        )}
        {state === 'error' && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <X className="animate-scale-in h-4 w-4 text-red-500" />
          </div>
        )}
        {state === 'error' && errorMessage && (
          <p className="animate-fade-in mt-1.5 text-xs text-red-500">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };

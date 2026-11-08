'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  value: string;
  /** Accessible name, e.g. "Copy signature". */
  label: string;
  className?: string;
  disabled?: boolean;
}

export function WebhookSignatureCopyButton({
  value,
  label,
  className,
  disabled,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard can be blocked (permissions, insecure context). The value
      // stays selectable on the page, so there's nothing else to do.
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onCopy}
      disabled={disabled || !value}
      aria-label={label}
      className={cn(
        'text-muted-foreground hover:text-foreground focus-visible:ring-offset-background shrink-0 gap-1.5',
        className
      )}
    >
      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </Button>
  );
}

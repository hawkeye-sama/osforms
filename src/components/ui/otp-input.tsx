'use client';

import { useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  length?: number;
}

export function OTPInput({
  value,
  onChange,
  disabled = false,
  error = false,
  length = 6,
}: OTPInputProps) {
  const getInitialOtp = () => {
    if (value.length === 0) {
      return Array(length).fill('');
    } else if (value.length <= length) {
      const newOtp = value.split('');
      while (newOtp.length < length) {
        newOtp.push('');
      }
      return newOtp;
    }
    return Array(length).fill('');
  };

  const [otp, setOtp] = useState<string[]>(getInitialOtp());
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    // Only allow single digits
    if (digit.length > 1) {
      digit = digit[digit.length - 1];
    }

    // Only allow numbers
    if (digit && !/^\d$/.test(digit)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Auto-focus next field
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Backspace: clear current field and move to previous
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Arrow left
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Arrow right
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();

    // Only process if it's exactly 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      onChange(pastedData);

      // Focus last field
      inputRefs.current[length - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    // Select the content when focused
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex justify-center gap-2">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            'h-14 w-12 rounded-lg border-2 text-center font-mono text-2xl font-semibold transition-all duration-150',
            'focus:ring-2 focus:ring-offset-0 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-red-500 text-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-border bg-card text-foreground focus:border-border focus:ring-ring/20',
            digit && !error && 'border-border bg-bg-element'
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}

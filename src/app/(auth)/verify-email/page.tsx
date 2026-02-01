'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AuthCard } from '@/components/auth/auth-card';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { OTPInput } from '@/components/ui/otp-input';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [success, setSuccess] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam, code: otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(true);
        toast.error(data.error || 'Verification failed');
        return;
      }

      setSuccess(true);
      toast.success('Email verified successfully!');

      // Redirect to onboarding after short delay
      setTimeout(() => {
        router.push('/onboarding');
      }, 1500);
    } catch {
      setError(true);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResendLoading(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.retryAfter) {
          setCountdown(data.retryAfter);
        }
        toast.error(data.error || 'Failed to resend code');
        return;
      }

      toast.success('Verification code sent!');
      setCountdown(60);
      setOtp('');
      setError(false);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Verify your email"
        description={`We sent a verification code to ${emailParam}`}
      >
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <OTPInput
              value={otp}
              onChange={(value) => {
                setOtp(value);
                setError(false);
              }}
              disabled={loading || success}
              error={error}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Button
              onClick={handleVerify}
              className="w-full"
              loading={loading}
              loadingText="Verifying..."
              disabled={otp.length !== 6 || success}
            >
              {success ? 'Verified ✓' : 'Verify Email'}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="text-center"
          >
            <p className="text-muted-foreground text-sm">
              Didn&apos;t receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={countdown > 0 || resendLoading || success}
                className="text-foreground font-medium transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {countdown > 0
                  ? `Resend in ${countdown}s`
                  : resendLoading
                    ? 'Sending...'
                    : 'Resend code'}
              </button>
            </p>
          </motion.div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

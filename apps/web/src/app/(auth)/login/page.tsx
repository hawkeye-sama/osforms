'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { AuthCard } from '@/components/auth/auth-card';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailState, setEmailState] = useState<'default' | 'success' | 'error'>(
    'default'
  );
  const [emailError, setEmailError] = useState('');

  // Real-time email validation
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailState('default');
      setEmailError('');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailState('error');
      setEmailError('Please enter a valid email address');
    } else {
      setEmailState('success');
      setEmailError('');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Final validation before submit
    if (emailState === 'error' || !email || !password) {
      toast.error('Please fill in all fields correctly');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }

      // Check if verification is required
      if (data.requiresVerification) {
        toast.error('Please verify your email first');
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }

      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        description="Sign in to your account"
        footer={
          <p className="text-muted-foreground w-full text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-foreground font-medium transition-colors hover:underline"
            >
              Sign up
            </Link>
          </p>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
              state={emailState}
              errorMessage={emailError}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <FormField
              label="Password"
              name="password"
              type="password"
              placeholder="Your password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              loadingText="Signing in..."
            >
              Sign In
            </Button>
          </motion.div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

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

type FieldState = 'default' | 'success' | 'error';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Field states
  const [nameState, setNameState] = useState<FieldState>('default');
  const [emailState, setEmailState] = useState<FieldState>('default');
  const [passwordState, setPasswordState] = useState<FieldState>('default');
  const [confirmPasswordState, setConfirmPasswordState] =
    useState<FieldState>('default');

  // Error messages
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Validation functions
  const validateName = (value: string) => {
    if (!value) {
      setNameState('default');
      setNameError('');
      return;
    }

    if (value.length < 2) {
      setNameState('error');
      setNameError('Name must be at least 2 characters');
    } else {
      setNameState('success');
      setNameError('');
    }
  };

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

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordState('default');
      setPasswordError('');
      return;
    }

    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    if (!hasMinLength) {
      setPasswordState('error');
      setPasswordError('Password must be at least 8 characters');
    } else if (!hasUpperCase) {
      setPasswordState('error');
      setPasswordError('Password must contain at least 1 uppercase letter');
    } else if (!hasNumber) {
      setPasswordState('error');
      setPasswordError('Password must contain at least 1 number');
    } else {
      setPasswordState('success');
      setPasswordError('');
    }

    // Also re-validate confirm password if it has a value
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword, value);
    }
  };

  const validateConfirmPassword = (value: string, passwordValue?: string) => {
    const currentPassword =
      passwordValue !== undefined ? passwordValue : password;

    if (!value) {
      setConfirmPasswordState('default');
      setConfirmPasswordError('');
      return;
    }

    if (value !== currentPassword) {
      setConfirmPasswordState('error');
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordState('success');
      setConfirmPasswordError('');
    }
  };

  // Change handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    validateName(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validateConfirmPassword(value);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Final validation before submit
    if (
      nameState === 'error' ||
      emailState === 'error' ||
      passwordState === 'error' ||
      confirmPasswordState === 'error' ||
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      toast.error('Please fill in all fields correctly');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Signup failed');
        return;
      }

      toast.success('Account created!');

      // Check if verification is required
      if (data.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        router.push('/onboarding');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Create your account"
        description="Start collecting form submissions for free"
        footer={
          <p className="text-muted-foreground w-full text-center text-sm">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-foreground font-medium transition-colors hover:underline"
            >
              Sign in
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
              label="Name"
              name="name"
              type="text"
              placeholder="Your name"
              required
              autoComplete="name"
              value={name}
              onChange={handleNameChange}
              state={nameState}
              errorMessage={nameError}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
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
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <FormField
              label="Password"
              name="password"
              type="password"
              placeholder="Min 8 characters, 1 uppercase, 1 number"
              required
              autoComplete="new-password"
              value={password}
              onChange={handlePasswordChange}
              state={passwordState}
              errorMessage={passwordError}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              state={confirmPasswordState}
              errorMessage={confirmPasswordError}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              loadingText="Creating account..."
            >
              Create Account
            </Button>
          </motion.div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

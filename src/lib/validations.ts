import { z } from 'zod';

// ── Auth ────────────────────────────────────────────────────

export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Valid email required'),
  code: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only digits'),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Valid email required'),
});

// ── Onboarding ──────────────────────────────────────────────

export const onboardingSchema = z.object({
  fullName: z.string().min(1).max(100),
  website: z.string().max(200).optional().default(''),
  company: z.string().max(100).optional().default(''),
  role: z.enum(['developer', 'agency', 'startup', 'other']),
});

// ── Forms ───────────────────────────────────────────────────

export const createFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export const updateFormSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  allowedOrigins: z.array(z.string()).optional(),
  redirectUrl: z.string().optional(),
  honeypotField: z.string().max(50).optional(),
  recaptchaSecret: z.string().optional(),
  rateLimit: z.number().int().min(1).max(1000).optional(),
  active: z.boolean().optional(),
});

// ── Integrations ────────────────────────────────────────────

export const emailConfigSchema = z.object({
  provider: z.enum(['resend', 'sendgrid', 'smtp']),
  apiKey: z.string().optional(),
  // Common
  from: z.string().email('Valid from email required'),
  to: z.array(z.string().email()).min(1, 'At least one recipient required'),
  subject: z.string().default('New Form Submission'),
});

export const webhookConfigSchema = z.object({
  url: z.string().url('Valid webhook URL required'),
  method: z.enum(['POST', 'PUT', 'PATCH']).default('POST'),
  headers: z.record(z.string(), z.string()).default({}),
  secret: z.string().optional(),
});

export const googleSheetsConfigSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
  email: z.string().email('Valid email required'),
  spreadsheetId: z.string().min(1, 'Spreadsheet ID required'),
  sheetName: z.string().default('Sheet1'),
});

export const createIntegrationSchema = z.object({
  formId: z.string().min(1),
  type: z.enum(['EMAIL', 'WEBHOOK', 'GOOGLE_SHEETS']),
  name: z.string().min(1).max(100),
  config: z.record(z.string(), z.unknown()),
  enabled: z.boolean().default(true),
});

export const updateIntegrationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  enabled: z.boolean().optional(),
});

// ── Types ───────────────────────────────────────────────────

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
export type EmailConfig = z.infer<typeof emailConfigSchema>;
export type WebhookConfig = z.infer<typeof webhookConfigSchema>;
export type GoogleSheetsConfig = z.infer<typeof googleSheetsConfigSchema>;
export type CreateIntegrationInput = z.infer<typeof createIntegrationSchema>;

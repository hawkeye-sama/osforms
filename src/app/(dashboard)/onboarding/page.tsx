'use client';

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { CodeSnippets } from '@/components/forms/code-snippets';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const STEPS = [
  'About You',
  'Create Form',
  'Connect Resend',
  'Google Sheets',
  'Implementation',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1: Profile
  const [fullName, setFullName] = useState('');
  const [website, setWebsite] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [usecase, setUsecase] = useState('');
  const [source, setSource] = useState('');

  // Step 2: Resend integration
  const [resendKey, setResendKey] = useState('');
  const [resendFrom, setResendFrom] = useState('');
  const [resendTo, setResendTo] = useState('');
  const [resendConnected, setResendConnected] = useState(false);

  // Step 3: Create form
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formId, setFormId] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [creating, setCreating] = useState(false);

  // Step 4: Google Sheets integration
  const [sheetsConnected, setSheetsConnected] = useState(false);

  // Step 5: Implementation guide + test
  const [testEmail, setTestEmail] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testingForm, setTestingForm] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  // Fetch user email for Resend recipient pre-fill
  useEffect(() => {
    async function fetchUserEmail() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user?.email && !resendTo) {
            setResendTo(data.user.email);
          }
        }
      } catch {
        // ignore
      }
    }
    fetchUserEmail();
  }, [resendTo]);

  // Check for Google Sheets OAuth return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlStep = params.get('step');
    const oauthFormId = params.get('formId');

    // If returning to step 3 (Google Sheets) after OAuth
    if (urlStep === '3' && oauthFormId) {
      setFormId(oauthFormId);
      // Check if Google Sheets integration was created
      async function checkSheetsConnection() {
        try {
          const res = await fetch(`/api/v1/integrations?formId=${oauthFormId}`);
          if (res.ok) {
            const data = await res.json();
            const sheetsIntegration = data.integrations?.find(
              (int: { type: string }) => int.type === 'GOOGLE_SHEETS'
            );

            if (sheetsIntegration) {
              setSheetsConnected(true);
              toast.success('Google Sheets connected successfully!');
            }
          }
        } catch {
          // ignore
        }
      }

      checkSheetsConnection();
      setStep(3); // Set to Google Sheets step
    }
  }, []);

  // Fetch user email for test form pre-fill
  useEffect(() => {
    if (step === 4) {
      async function fetchUserEmail() {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            if (data.user?.email && !testEmail) {
              setTestEmail(data.user.email);
            }
          }
        } catch {
          // ignore
        }
      }

      async function fetchFormSlug() {
        try {
          const res = await fetch(`/api/v1/forms/${formId}`);
          if (res.ok) {
            const data = await res.json();
            setFormSlug(data.form.slug);
          }
        } catch {
          // ignore
        }
      }

      fetchUserEmail();
      fetchFormSlug();
    }
  }, [formId, step, testEmail]);

  async function handleTestForm() {
    if (!testEmail.trim()) {
      toast.error('Please enter an email');
      return;
    }

    setTestingForm(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const endpointUrl = `${baseUrl}/api/v1/f/${formSlug}`;

      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail.trim(),
          message: testMessage.trim() || 'Test submission from onboarding',
        }),
      });

      if (res.ok) {
        setTestSuccess(true);
        toast.success('Test submission successful!');
      } else {
        toast.error('Test submission failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setTestingForm(false);
    }
  }

  async function handleSaveProfile() {
    if (
      !fullName.trim() ||
      !company.trim() ||
      !role ||
      !usecase.trim() ||
      !source
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          website: website.trim(),
          company: company.trim(),
          role,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to save profile');
        return;
      }
      setStep(1);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectResend() {
    if (!resendKey.trim()) {
      toast.error('Please enter your Resend API key');
      return;
    }

    if (!resendFrom.trim()) {
      toast.error('Please enter your verified sending email');
      return;
    }

    if (!resendTo.trim()) {
      toast.error('Please enter recipient email');
      return;
    }

    setLoading(true);
    try {
      // Create EMAIL integration for the form
      const res = await fetch('/api/v1/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: formId,
          type: 'EMAIL',
          name: 'Email Notifications',
          config: {
            provider: 'resend',
            apiKey: resendKey.trim(),
            from: resendFrom.trim(),
            to: [resendTo.trim()],
            subject: 'New Form Submission',
          },
          enabled: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to connect Resend');
        return;
      }

      setResendConnected(true);
      toast.success('Resend connected!');
      setStep(3); // Move to Google Sheets step
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateForm() {
    if (!formName.trim()) {
      toast.error('Please enter a form name');
      return;
    }

    setCreating(true);
    try {
      const body: { name: string; description?: string } = {
        name: formName.trim(),
      };
      if (formDescription.trim()) {
        body.description = formDescription.trim();
      }

      const res = await fetch('/api/v1/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to create form');
        return;
      }

      const data = await res.json();
      setFormId(data.form._id);
      setFormSlug(data.form.slug);
      toast.success('Form created successfully!');
      setStep(2); // Move to Resend step
    } catch {
      toast.error('Something went wrong');
    } finally {
      setCreating(false);
    }
  }

  async function handleFinish() {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingComplete: true }),
      });
      if (!res.ok) {
        toast.error('Failed to complete onboarding');
        return;
      }
      router.push('/dashboard');
      router.refresh(); // Force refresh to update auth state
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <h1 className="text-foreground mb-2 text-center text-3xl font-bold tracking-tight">
          OSForms
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Let's get you onboarded with OSForms
        </p>
        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${(() => {
                  if (i < step) {
                    return 'bg-primary text-primary-foreground';
                  }
                  if (i === step) {
                    return 'bg-primary text-primary-foreground';
                  }
                  return 'bg-muted text-muted-foreground';
                })()}`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 ${
                    i < step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: About You */}
        {step === 0 && (
          <Card variant="elevated" className="card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground text-xl font-semibold">
                Tell us about yourself
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Help us understand how you&apos;ll use osforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Project / Company *</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Inc or My Side Project"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="usecase">
                  What will you use OSForms for? *
                </Label>
                <Textarea
                  id="usecase"
                  value={usecase}
                  onChange={(e) => setUsecase(e.target.value)}
                  placeholder="Contact forms, newsletter signups, feedback collection..."
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Where did you hear about us? *</Label>
                <Select value={source} onValueChange={setSource} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="twitter">Twitter / X</SelectItem>
                    <SelectItem value="producthunt">Product Hunt</SelectItem>
                    <SelectItem value="search">Search Engine</SelectItem>
                    <SelectItem value="friend">Friend / Colleague</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="mt-2 w-full"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Saving...' : 'Continue'}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Create Form */}
        {step === 1 && (
          <Card variant="elevated" className="card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground text-xl font-semibold">
                Create your first form
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Give your form a name and we&apos;ll generate an endpoint for
                you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="formName" className="text-sm font-medium">
                    Form Name *
                  </Label>
                  <Input
                    id="formName"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                    }}
                    placeholder="Contact Form"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="formDescription"
                    className="text-sm font-medium"
                  >
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="formDescription"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Form for collecting contact inquiries"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateForm}
                  disabled={creating || !formName.trim()}
                >
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {creating ? 'Creating...' : 'Create Form'}
                  {!creating && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Connect Resend */}
        {step === 2 && (
          <Card variant="elevated" className="card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground text-xl font-semibold">
                Connect Resend
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Add your Resend API key to send form submissions via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {resendConnected ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Resend Connected
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Your API key is securely saved and encrypted
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Resend API Key *
                        </Label>
                        <Link
                          href="https://resend.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
                        >
                          Get API Key <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                      <Input
                        value={resendKey}
                        onChange={(e) => setResendKey(e.target.value)}
                        placeholder="re_xxxxxxxxxxxxx"
                        type="password"
                      />
                      <p className="text-muted-foreground text-xs">
                        Your key will be encrypted and stored securely.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        From Email (Verified in Resend) *
                      </Label>
                      <Input
                        type="email"
                        value={resendFrom}
                        onChange={(e) => setResendFrom(e.target.value)}
                        placeholder="noreply@yourdomain.com"
                      />
                      <p className="text-muted-foreground text-xs">
                        Must be a verified domain in your Resend account.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Send To (Your Email) *
                      </Label>
                      <Input
                        type="email"
                        value={resendTo}
                        onChange={(e) => setResendTo(e.target.value)}
                        placeholder="your@email.com"
                      />
                      <p className="text-muted-foreground text-xs">
                        Where you want to receive form submissions.
                      </p>
                    </div>

                    <Button
                      onClick={handleConnectResend}
                      disabled={
                        loading ||
                        !resendKey.trim() ||
                        !resendFrom.trim() ||
                        !resendTo.trim()
                      }
                      className="w-full"
                    >
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {loading ? 'Connecting...' : 'Connect Resend'}
                    </Button>
                  </div>
                </>
              )}

              <div className="bg-muted/50 rounded-lg border p-4">
                <p className="text-muted-foreground text-xs">
                  You can also configure integrations per form from your
                  dashboard later. Resend is optional but recommended.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  {resendConnected ? 'Continue' : 'Skip for now'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Google Sheets */}
        {step === 3 && (
          <Card variant="elevated" className="card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground text-xl font-semibold">
                Connect Google Sheets
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Automatically save submissions to a Google Spreadsheet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sheetsConnected ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Google Sheets Connected
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Form submissions will be saved to your spreadsheet
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4 text-center">
                    <p className="text-muted-foreground text-sm">
                      Connect your Google account to automatically save form
                      submissions to a spreadsheet.
                    </p>
                    <Button
                      onClick={() => {
                        const returnTo = encodeURIComponent(
                          `/onboarding?step=3&formId=${formId}`
                        );
                        window.location.href = `/api/auth/google/login?formId=${formId}&returnTo=${returnTo}`;
                      }}
                      className="gap-2"
                      disabled={!formId}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Connect with Google
                    </Button>
                  </div>

                  <p className="text-muted-foreground text-center text-xs">
                    A new spreadsheet will be created automatically when you
                    connect.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(4)}>
                  {sheetsConnected ? 'Continue' : 'Skip for now'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Implementation Guide */}
        {step === 4 && (
          <Card variant="elevated" className="card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground text-xl font-semibold">
                Implementation Guide
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Use these code examples to integrate your form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Code Examples */}
              <div className="space-y-3">
                <h3 className="text-foreground text-sm font-medium">
                  Integration Code
                </h3>
                <CodeSnippets
                  endpointUrl={`${
                    process.env.NEXT_PUBLIC_APP_URL ||
                    (typeof window !== 'undefined'
                      ? window.location.origin
                      : '')
                  }/api/v1/f/${formSlug}`}
                />
              </div>

              {/* Test Form Section */}
              <Card variant="elevated" className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Test Your Form
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Send a test submission to verify everything works
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="testEmail" className="text-sm">
                      Email
                    </Label>
                    <Input
                      id="testEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testMessage" className="text-sm">
                      Message (Optional)
                    </Label>
                    <Textarea
                      id="testMessage"
                      placeholder="Test submission from onboarding"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <Button
                    onClick={handleTestForm}
                    disabled={!testEmail.trim() || testingForm}
                    className="w-full"
                    variant={testSuccess ? 'default' : 'outline'}
                  >
                    {(() => {
                      if (testingForm) {
                        return (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        );
                      }
                      if (testSuccess) {
                        return (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Test Successful!
                          </>
                        );
                      }
                      return 'Send Test Submission';
                    })()}
                  </Button>

                  {testSuccess && (
                    <p className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
                      <CheckCircle2 className="h-4 w-4" />
                      Your form is working perfectly!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Finish Button */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Finishing...' : 'Go to Dashboard'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

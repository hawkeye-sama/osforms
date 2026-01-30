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
import { encrypt } from '@/lib/encryption';

const STEPS = ['About You', 'Connect Resend', 'Create & Test'];

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
  const [resendConnected, setResendConnected] = useState(false);

  // Step 3: Create form + validate
  const [formName, setFormName] = useState('');
  const [formId, setFormId] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);

  // Test form submission (controlled, no page reload)
  const [testName, setTestName] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if user already has Resend key
    async function checkResendStatus() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user.hasResendKey) {
            setResendConnected(true);
          }
        }
      } catch {
        // ignore
      }
    }
    checkResendStatus();
  }, []);

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

    setLoading(true);
    try {
      // Encrypt the key before storing
      const encrypted = encrypt(resendKey.trim());

      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resendApiKey: encrypted }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to save Resend key');
        return;
      }

      setResendConnected(true);
      toast.success('Resend connected!');
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

    setLoading(true);
    try {
      const res = await fetch('/api/v1/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to create form');
        return;
      }

      const data = await res.json();
      setFormId(data.form._id);
      setFormSlug(data.form.slug);
      toast.success('Form created!');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitTestForm(e: React.FormEvent) {
    e.preventDefault();

    if (!testName.trim() || !testEmail.trim()) {
      toast.error('Please fill in name and email');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', testName.trim());
      formData.append('email', testEmail.trim());
      if (testMessage.trim()) {
        formData.append('message', testMessage.trim());
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const endpointUrl = `${baseUrl}/api/v1/f/${formSlug}`;

      const res = await fetch(endpointUrl, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast.success('Test form submitted! Now click Validate.');
        setTestName('');
        setTestEmail('');
        setTestMessage('');
      } else {
        toast.error('Form submission failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleValidate() {
    if (!formId) {
      return;
    }

    setValidating(true);
    try {
      const res = await fetch(`/api/v1/forms/${formId}/submissions?limit=1`);
      if (!res.ok) {
        toast.error('Failed to check submissions');
        return;
      }

      const data = await res.json();
      if (data.submissions && data.submissions.length > 0) {
        setValidated(true);
        toast.success("Integration validated! You're all set.");
      } else {
        toast.error(
          'No submissions found yet. Submit your test form and try again.'
        );
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setValidating(false);
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
      toast.success('Welcome to OSForms!');
      router.push('/dashboard');
      router.refresh(); // Force refresh to update auth state
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  const endpointUrl = formSlug ? `${baseUrl}/api/v1/f/${formSlug}` : '';

  return (
    <div className="dark gradient-radial-dark flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <h1 className="text-foreground mb-8 text-center text-2xl font-bold tracking-tight">
          OSForms
        </h1>

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
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Tell us about yourself</CardTitle>
              <CardDescription>
                Help us understand how you&apos;ll use OSForms
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

        {/* Step 2: Connect Resend */}
        {step === 1 && (
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Connect Resend</CardTitle>
              <CardDescription>
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Resend API Key
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
                    <p className="text-muted-foreground text-xs">
                      Enter your Resend API key to enable email notifications.
                      Your key will be encrypted and stored securely.
                    </p>
                    <Input
                      value={resendKey}
                      onChange={(e) => setResendKey(e.target.value)}
                      placeholder="re_xxxxxxxxxxxxx"
                      type="password"
                    />
                    <Button
                      onClick={handleConnectResend}
                      disabled={loading || !resendKey.trim()}
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
                <Button variant="outline" onClick={() => setStep(0)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(2)}>
                  {resendConnected ? 'Continue' : 'Skip for now'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Create Form + Validate */}
        {step === 2 && (
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Create your first form</CardTitle>
              <CardDescription>
                Create a form, submit a test, and validate everything works
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!formId ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="formName">Form Name</Label>
                    <Input
                      id="formName"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Contact Form, Newsletter Signup"
                      required
                    />
                  </div>
                  {resendConnected && (
                    <div className="bg-muted/50 flex items-center gap-2 rounded-lg border p-3">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-muted-foreground text-sm">
                        Resend connected — submissions will be sent to your
                        email
                      </span>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleCreateForm}
                      disabled={loading || !formName.trim()}
                    >
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {loading ? 'Creating...' : 'Create Form'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Form created!</span>
                    </div>
                    <div className="bg-muted/50 rounded-lg border p-4">
                      <Label className="text-muted-foreground text-xs">
                        Your endpoint URL:
                      </Label>
                      <p className="mt-1 font-mono text-sm break-all">
                        {endpointUrl}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Test your form
                    </Label>
                    <div className="bg-card rounded-lg border p-4">
                      <p className="text-muted-foreground mb-3 text-sm">
                        Submit a test to validate everything works:
                      </p>
                      <form
                        onSubmit={handleSubmitTestForm}
                        className="space-y-3"
                      >
                        <Input
                          type="text"
                          value={testName}
                          onChange={(e) => setTestName(e.target.value)}
                          placeholder="Your name"
                          required
                        />
                        <Input
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                        />
                        <Textarea
                          value={testMessage}
                          onChange={(e) => setTestMessage(e.target.value)}
                          placeholder="Test message (optional)"
                          rows={2}
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="w-full"
                          size="sm"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Test Form'
                          )}
                        </Button>
                      </form>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Validate integration
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      After submitting the test above, click the button below to
                      verify we received your submission.
                    </p>
                    <Button
                      onClick={handleValidate}
                      disabled={validating || validated}
                      variant={validated ? 'default' : 'outline'}
                      className="w-full"
                    >
                      {(() => {
                        if (validating) {
                          return (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Checking...
                            </>
                          );
                        }
                        if (validated) {
                          return (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Validated!
                            </>
                          );
                        }
                        return 'Validate Integration';
                      })()}
                    </Button>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleFinish}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {(() => {
                        if (loading) {
                          return 'Finishing...';
                        }
                        if (validated) {
                          return 'Go to Dashboard';
                        }
                        return 'Skip & Go to Dashboard';
                      })()}
                      {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

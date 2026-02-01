'use client';

import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  FileText,
  Loader2,
  Puzzle,
  Settings,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { use, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { IntegrationsSection } from '@/components/dashboard/integrations-section';
import { SubmissionsSection } from '@/components/dashboard/submissions-section';
import { CodeSnippets } from '@/components/forms/code-snippets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Form {
  _id: string;
  name: string;
  slug: string;
  active: boolean;
  submissionCount: number; // Actual count from submissions collection
  allowedOrigins: string[];
  redirectUrl: string;
  honeypotField: string;
  integrationCount: number;
}

export default function FormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') || 'submissions'
  );

  // Settings dialog
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formRedirect, setFormRedirect] = useState('');
  const [formHoneypot, setFormHoneypot] = useState('');
  const [formOrigins, setFormOrigins] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchForm = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/forms/${id}`);
      if (!res.ok) {
        router.push('/dashboard');
        return;
      }
      const data = await res.json();
      setForm(data.form);
      setFormName(data.form.name);
      setFormActive(data.form.active);
      setFormRedirect(data.form.redirectUrl || '');
      setFormHoneypot(data.form.honeypotField || '');
      setFormOrigins((data.form.allowedOrigins || []).join(', '));
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  async function handleDeleteForm() {
    if (
      !confirm(
        'Delete this form? This will also delete all submissions and integrations.'
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/forms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Form deleted');
        router.push('/dashboard');
      } else {
        toast.error('Failed to delete form');
      }
    } catch {
      toast.error('Something went wrong');
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/forms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          active: formActive,
          redirectUrl: formRedirect || undefined,
          honeypotField: formHoneypot || undefined,
          allowedOrigins: formOrigins
            ? formOrigins
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        }),
      });
      if (res.ok) {
        toast.success('Settings saved');
        setSettingsOpen(false);
        fetchForm();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>

        {/* Tabs skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-100 w-full" />
        </div>
      </div>
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  const endpointUrl = `${baseUrl}/api/v1/f/${form.slug}`;

  return (
    <div>
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        {/* Breadcrumb */}
        <div className="text-muted-foreground mb-4 flex items-center gap-2 text-sm">
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors"
          >
            Forms
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{form.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="h-9 w-9">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-foreground text-2xl font-bold tracking-tight">
                  {form.name}
                </h1>
                <Badge variant={form.active ? 'default' : 'secondary'}>
                  {form.active ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {form.submissionCount} submissions
              </p>
            </div>
          </div>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <DialogContent>
              <form onSubmit={handleSaveSettings}>
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    Form Settings
                  </DialogTitle>
                  <DialogDescription>
                    Configure your form endpoint
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Name</Label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="bg-card"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground">Active</Label>
                    <Switch
                      checked={formActive}
                      onCheckedChange={setFormActive}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Redirect URL (after submission)
                    </Label>
                    <Input
                      value={formRedirect}
                      onChange={(e) => setFormRedirect(e.target.value)}
                      placeholder="https://yoursite.com/thank-you"
                      className="bg-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Honeypot Field Name
                    </Label>
                    <Input
                      value={formHoneypot}
                      onChange={(e) => setFormHoneypot(e.target.value)}
                      placeholder="_gotcha"
                      className="bg-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Allowed Origins (comma-separated)
                    </Label>
                    <Input
                      value={formOrigins}
                      onChange={(e) => setFormOrigins(e.target.value)}
                      placeholder="https://yoursite.com, https://app.yoursite.com"
                      className="bg-card"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteForm}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Form
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-card border-border border">
          <TabsTrigger value="submissions" className="gap-2">
            <FileText className="h-4 w-4" />
            Submissions
          </TabsTrigger>
          <TabsTrigger value="setup" className="gap-2">
            <Settings className="h-4 w-4" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Puzzle className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Submissions Tab - isolated component with its own data fetching */}
        <TabsContent value="submissions">
          <SubmissionsSection formId={id} />
        </TabsContent>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          {/* Endpoint URL */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground text-base">
                Form Endpoint
              </CardTitle>
              <CardDescription>
                Place this URL in the action attribute of your form. Make sure
                your form uses method=&quot;POST&quot;.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={endpointUrl}
                  readOnly
                  className="bg-card font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => copyText(endpointUrl, 'url')}
                  className="shrink-0"
                >
                  {copied === 'url' ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Code Snippets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground text-base">
                Integrate with your usecase
              </CardTitle>
              <CardDescription>
                Check out the code snippets below for more examples:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeSnippets endpointUrl={endpointUrl} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab - isolated component with its own data fetching */}
        <TabsContent value="integrations">
          <IntegrationsSection formId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

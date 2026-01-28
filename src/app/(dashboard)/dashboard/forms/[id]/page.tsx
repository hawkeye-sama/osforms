"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  Settings,
  Inbox,
  Mail,
  Webhook,
  FileSpreadsheet,
  MessageSquare,
  Send,
  Bell,
  Database,
  Zap,
  Share2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

interface Form {
  _id: string;
  name: string;
  slug: string;
  active: boolean;
  submissionCount: number;
  submissionLimit: number;
  allowedOrigins: string[];
  redirectUrl: string;
  honeypotField: string;
  integrationCount: number;
}

interface Submission {
  _id: string;
  data: Record<string, unknown>;
  metadata: { ip: string; userAgent: string; origin: string };
  createdAt: string;
}

interface Integration {
  _id: string;
  type: string;
  name: string;
  enabled: boolean;
  createdAt: string;
}

export default function FormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  // Integration dialog
  const [intDialogOpen, setIntDialogOpen] = useState(false);
  const [intType, setIntType] = useState("WEBHOOK");
  const [intName, setIntName] = useState("");
  const [intConfig, setIntConfig] = useState("");
  const [intCreating, setIntCreating] = useState(false);

  // Resend Email form fields
  const [emailFrom, setEmailFrom] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("New Form Submission");

  // Settings dialog
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formRedirect, setFormRedirect] = useState("");
  const [formHoneypot, setFormHoneypot] = useState("");
  const [formOrigins, setFormOrigins] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchForm = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/forms/${id}`);
      if (!res.ok) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      setForm(data.form);
      setFormName(data.form.name);
      setFormActive(data.form.active);
      setFormRedirect(data.form.redirectUrl || "");
      setFormHoneypot(data.form.honeypotField || "");
      setFormOrigins((data.form.allowedOrigins || []).join(", "));
    } catch {
      router.push("/dashboard");
    }
  }, [id, router]);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/forms/${id}/submissions?limit=20`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions);
      }
    } catch {
      // non-critical
    }
  }, [id]);

  const fetchIntegrations = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/integrations?formId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data.integrations);
      }
    } catch {
      // non-critical
    }
  }, [id]);

  useEffect(() => {
    Promise.all([fetchForm(), fetchSubmissions(), fetchIntegrations()]).finally(
      () => setLoading(false)
    );
  }, [fetchForm, fetchSubmissions, fetchIntegrations]);

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  }

  async function handleDeleteForm() {
    if (!confirm("Delete this form? This will also delete all submissions and integrations.")) return;
    try {
      const res = await fetch(`/api/v1/forms/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Form deleted");
        router.push("/dashboard");
      } else {
        toast.error("Failed to delete form");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          active: formActive,
          redirectUrl: formRedirect || undefined,
          honeypotField: formHoneypot || undefined,
          allowedOrigins: formOrigins
            ? formOrigins.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        }),
      });
      if (res.ok) {
        toast.success("Settings saved");
        setSettingsOpen(false);
        fetchForm();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateIntegration(e: React.FormEvent) {
    e.preventDefault();
    setIntCreating(true);
    try {
      let config: Record<string, unknown>;

      // For EMAIL type, build config from form fields
      if (intType === "EMAIL") {
        if (!emailFrom.trim() || !emailTo.trim()) {
          toast.error("From and To email addresses are required");
          setIntCreating(false);
          return;
        }

        // Parse comma-separated emails for "to" field
        const toEmails = emailTo.split(",").map((e) => e.trim()).filter(Boolean);
        if (toEmails.length === 0) {
          toast.error("At least one recipient email is required");
          setIntCreating(false);
          return;
        }

        config = {
          provider: "resend",
          apiKey: "auto", // Will be replaced by user's saved key on backend
          from: emailFrom.trim(),
          to: toEmails,
          subject: emailSubject.trim() || "New Form Submission",
        };
      } else {
        // For other types (WEBHOOK, etc.), parse JSON config
        try {
          config = JSON.parse(intConfig);
        } catch {
          toast.error("Config must be valid JSON");
          setIntCreating(false);
          return;
        }
      }

      const res = await fetch("/api/v1/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: id,
          type: intType,
          name: intName,
          config,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create integration");
        return;
      }

      toast.success("Integration added!");
      setIntDialogOpen(false);
      setIntName("");
      setIntConfig("");
      setEmailFrom("");
      setEmailTo("");
      setEmailSubject("New Form Submission");
      fetchIntegrations();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIntCreating(false);
    }
  }

  async function handleDeleteIntegration(integrationId: string) {
    if (!confirm("Remove this integration?")) return;
    try {
      const res = await fetch(`/api/v1/integrations/${integrationId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Integration removed");
        fetchIntegrations();
      } else {
        toast.error("Failed to remove");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleToggleIntegration(
    integrationId: string,
    enabled: boolean
  ) {
    try {
      await fetch(`/api/v1/integrations/${integrationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      fetchIntegrations();
    } catch {
      toast.error("Failed to update");
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

        {/* Endpoint card skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>

        {/* Tabs skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const endpointUrl = `${baseUrl}/api/v1/f/${form.slug}`;

  const htmlSnippet = `<form action="${endpointUrl}" method="POST">
  <input type="text" name="name" placeholder="Name" required />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message"></textarea>
  <button type="submit">Send</button>
</form>`;

  const configTemplates: Record<string, string> = {
    WEBHOOK: JSON.stringify(
      { url: "https://your-app.com/webhook", method: "POST", secret: "optional-secret" },
      null,
      2
    ),
    EMAIL: JSON.stringify(
      {
        provider: "resend",
        apiKey: "Your saved Resend key will be used automatically",
        from: "noreply@yourdomain.com",
        to: ["you@email.com"],
        subject: "New Form Submission",
      },
      null,
      2
    ),
    GOOGLE_SHEETS: JSON.stringify(
      {
        credentials: '{"type":"service_account",...}',
        spreadsheetId: "your-spreadsheet-id",
        sheetName: "Sheet1",
      },
      null,
      2
    ),
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{form.name}</h1>
            <Badge variant={form.active ? "default" : "secondary"}>
              {form.active ? "Active" : "Paused"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {form.submissionCount} / {form.submissionLimit} submissions
          </p>
        </div>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSaveSettings}>
              <DialogHeader>
                <DialogTitle>Form Settings</DialogTitle>
                <DialogDescription>
                  Configure your form endpoint
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={formActive}
                    onCheckedChange={setFormActive}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Redirect URL (after submission)</Label>
                  <Input
                    value={formRedirect}
                    onChange={(e) => setFormRedirect(e.target.value)}
                    placeholder="https://yoursite.com/thank-you"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Honeypot Field Name</Label>
                  <Input
                    value={formHoneypot}
                    onChange={(e) => setFormHoneypot(e.target.value)}
                    placeholder="_gotcha"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Allowed Origins (comma-separated)</Label>
                  <Input
                    value={formOrigins}
                    onChange={(e) => setFormOrigins(e.target.value)}
                    placeholder="https://yoursite.com, https://app.yoursite.com"
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
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Endpoint & Snippet */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Endpoint URL</CardTitle>
          <CardDescription>
            Point your HTML form&apos;s action attribute to this URL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={endpointUrl} readOnly className="font-mono text-sm" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyText(endpointUrl, "url")}
            >
              {copied === "url" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-muted-foreground">
                HTML Snippet
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyText(htmlSnippet, "html")}
                className="h-7 text-xs"
              >
                {copied === "html" ? (
                  <>
                    <Check className="mr-1 h-3 w-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3 w-3" /> Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="rounded-md border bg-muted/50 p-4 text-xs font-mono overflow-x-auto leading-relaxed">
              {htmlSnippet}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Submissions + Integrations */}
      <Tabs defaultValue="submissions">
        <TabsList>
          <TabsTrigger value="submissions">
            Submissions ({form.submissionCount})
          </TabsTrigger>
          <TabsTrigger value="integrations">
            Integrations ({integrations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="mt-4">
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Inbox className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No submissions yet. Submit your first form to see data here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <Card key={sub._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        {Object.entries(sub.data).map(([key, value]) => (
                          <div key={key} className="flex gap-2 text-sm">
                            <span className="font-medium text-muted-foreground shrink-0 w-28 truncate">
                              {key}:
                            </span>
                            <span className="truncate">
                              {String(value ?? "")}
                            </span>
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {new Date(sub.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-1">Available Apps</h3>
            <p className="text-sm text-muted-foreground">
              Connect apps to automatically process form submissions
            </p>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Webhooks */}
            <Card className="group card-hover cursor-pointer" onClick={() => {
              setIntType("WEBHOOK");
              setIntConfig(configTemplates["WEBHOOK"]);
              setIntDialogOpen(true);
            }}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Webhook className="h-5 w-5 text-blue-500" />
                  </div>
                  <Badge variant="outline" className="text-xs">Popular</Badge>
                </div>
                <h4 className="font-semibold text-sm mb-1">Webhooks</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Send form data to any URL via HTTP POST request
                </p>
              </CardContent>
            </Card>

            {/* Resend Email */}
            <Card className="group card-hover cursor-pointer" onClick={() => {
              setIntType("EMAIL");
              setIntName("Email Notifications");
              setEmailFrom("");
              setEmailTo("");
              setEmailSubject("New Form Submission");
              setIntDialogOpen(true);
            }}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-green-500" />
                  </div>
                  {integrations.some(i => i.type === "EMAIL") && (
                    <Badge className="text-xs bg-green-500/10 text-green-700 hover:bg-green-500/20">Connected</Badge>
                  )}
                </div>
                <h4 className="font-semibold text-sm mb-1">Email (Resend)</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Get email notifications for every submission
                </p>
              </CardContent>
            </Card>

            {/* Google Sheets */}
            <Card className="group transition-colors cursor-not-allowed opacity-60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Soon</Badge>
                </div>
                <h4 className="font-semibold text-sm mb-1">Google Sheets</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Append submissions to a spreadsheet automatically
                </p>
              </CardContent>
            </Card>

            {/* Slack */}
            <Card className="group transition-colors cursor-not-allowed opacity-60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Soon</Badge>
                </div>
                <h4 className="font-semibold text-sm mb-1">Slack</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Post submission alerts to Slack channels
                </p>
              </CardContent>
            </Card>

            {/* Telegram */}
            <Card className="group transition-colors cursor-not-allowed opacity-60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                    <Send className="h-5 w-5 text-sky-500" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Soon</Badge>
                </div>
                <h4 className="font-semibold text-sm mb-1">Telegram</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Receive submission notifications via Telegram bot
                </p>
              </CardContent>
            </Card>

            {/* Discord */}
            <Card className="group transition-colors cursor-not-allowed opacity-60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-indigo-500" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Soon</Badge>
                </div>
                <h4 className="font-semibold text-sm mb-1">Discord</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Send form submissions to Discord webhooks
                </p>
              </CardContent>
            </Card>

            {/* Notion */}
            <Card className="group transition-colors cursor-not-allowed opacity-60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                    <Database className="h-5 w-5 text-gray-500" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Soon</Badge>
                </div>
                <h4 className="font-semibold text-sm mb-1">Notion</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Add submissions as pages to your Notion database
                </p>
              </CardContent>
            </Card>

            {/* Zapier */}
            <Card className="group transition-colors cursor-not-allowed opacity-60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-orange-500" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Soon</Badge>
                </div>
                <h4 className="font-semibold text-sm mb-1">Zapier</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Connect to 5000+ apps via Zapier workflows
                </p>
              </CardContent>
            </Card>

            {/* Make */}
            <Card className="group transition-colors cursor-not-allowed opacity-60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Share2 className="h-5 w-5 text-violet-500" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Soon</Badge>
                </div>
                <h4 className="font-semibold text-sm mb-1">Make</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Automate workflows with Make (Integromat)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Active Integrations List */}
          {integrations.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Active Integrations</h3>
              <div className="space-y-3">
                {integrations.map((int) => (
                  <Card key={int._id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {int.type}
                        </Badge>
                        <span className="font-medium text-sm">{int.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={int.enabled}
                          onCheckedChange={(val) =>
                            handleToggleIntegration(int._id, val)
                          }
                        />
                        <Separator orientation="vertical" className="h-6" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteIntegration(int._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Integration Dialog */}
          <Dialog open={intDialogOpen} onOpenChange={setIntDialogOpen}>
            <DialogContent className="max-w-lg">
              <form onSubmit={handleCreateIntegration}>
                <DialogHeader>
                  <DialogTitle>
                    {intType === "EMAIL" && "Configure Email Notifications"}
                    {intType === "WEBHOOK" && "Configure Webhook"}
                    {intType === "GOOGLE_SHEETS" && "Configure Google Sheets"}
                  </DialogTitle>
                  <DialogDescription>
                    {intType === "WEBHOOK" && "Send form data to any URL via HTTP POST"}
                    {intType === "EMAIL" && "Get email notifications for each submission. Your saved Resend key will be used automatically."}
                    {intType === "GOOGLE_SHEETS" && "Append submissions to a spreadsheet"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {intType === "EMAIL" ? (
                    <>
                      <div className="space-y-2">
                        <Label>Integration Name</Label>
                        <Input
                          value={intName}
                          onChange={(e) => setIntName(e.target.value)}
                          placeholder="Email Notifications"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>From Email</Label>
                        <Input
                          type="email"
                          value={emailFrom}
                          onChange={(e) => setEmailFrom(e.target.value)}
                          placeholder="noreply@yourdomain.com"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Must be a verified domain in your Resend account
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>To Email(s)</Label>
                        <Input
                          type="text"
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                          placeholder="you@email.com, team@email.com"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Comma-separated list of recipient emails
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                          type="text"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="New Form Submission"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Integration Name</Label>
                        <Input
                          value={intName}
                          onChange={(e) => setIntName(e.target.value)}
                          placeholder="e.g. Team Notifications, Sales Alert"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Configuration (JSON)</Label>
                        <Textarea
                          value={intConfig}
                          onChange={(e) => setIntConfig(e.target.value)}
                          rows={10}
                          className="font-mono text-xs"
                          placeholder="Paste your config JSON here"
                        />
                        <p className="text-xs text-muted-foreground">
                          {intType === "WEBHOOK" && "Include: url, method (POST/GET), optional secret for HMAC signing"}
                          {intType === "GOOGLE_SHEETS" && "Include: credentials (service account JSON), spreadsheetId, sheetName"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIntDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={intCreating || !intName.trim()}
                  >
                    {intCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {intCreating ? "Adding..." : "Add Integration"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}

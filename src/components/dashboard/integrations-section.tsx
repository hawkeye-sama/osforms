"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Trash2,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

interface Integration {
  _id: string;
  type: string;
  name: string;
  enabled: boolean;
  createdAt: string;
}

interface IntegrationsSectionProps {
  formId: string;
}

const configTemplates: Record<string, string> = {
  WEBHOOK: JSON.stringify(
    { url: "https://your-app.com/webhook", method: "POST", secret: "optional-secret" },
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

export function IntegrationsSection({ formId }: IntegrationsSectionProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [useAccountKey, setUseAccountKey] = useState(true);
  const [customApiKey, setCustomApiKey] = useState("");

  const fetchIntegrations = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/integrations?formId=${formId}`);
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data.integrations);
      }
    } catch {
      // non-critical
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  function resetIntegrationForm() {
    setIntName("");
    setIntConfig("");
    setEmailFrom("");
    setEmailTo("");
    setEmailSubject("New Form Submission");
    setUseAccountKey(true);
    setCustomApiKey("");
  }

  async function handleCreateIntegration(e: React.FormEvent) {
    e.preventDefault();
    setIntCreating(true);
    try {
      let config: Record<string, unknown>;

      if (intType === "EMAIL") {
        if (!emailFrom.trim() || !emailTo.trim()) {
          toast.error("From and To email addresses are required");
          setIntCreating(false);
          return;
        }

        if (!useAccountKey && !customApiKey.trim()) {
          toast.error("Please enter a custom API key or use your account key");
          setIntCreating(false);
          return;
        }

        const toEmails = emailTo.split(",").map((e) => e.trim()).filter(Boolean);
        if (toEmails.length === 0) {
          toast.error("At least one recipient email is required");
          setIntCreating(false);
          return;
        }

        config = {
          provider: "resend",
          apiKey: useAccountKey ? "auto" : customApiKey.trim(),
          from: emailFrom.trim(),
          to: toEmails,
          subject: emailSubject.trim() || "New Form Submission",
        };
      } else {
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
          formId,
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

      toast.success(`${intName} integration added successfully!`);
      setIntDialogOpen(false);
      resetIntegrationForm();
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

  async function handleToggleIntegration(integrationId: string, enabled: boolean) {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Available Apps</h3>
          <p className="text-sm text-muted-foreground">
            Connect apps to automatically process form submissions
          </p>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Webhooks */}
          <Card
            className="group cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => {
              setIntType("WEBHOOK");
              setIntName("Webhook");
              setIntConfig(configTemplates["WEBHOOK"]);
              setIntDialogOpen(true);
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Webhook className="h-5 w-5 text-blue-500" />
                </div>
                <Badge variant="outline" className="text-xs">Popular</Badge>
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">Webhooks</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Send form data to any URL via HTTP POST request
              </p>
            </CardContent>
          </Card>

          {/* Resend Email */}
          <Card
            className="group cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => {
              setIntType("EMAIL");
              setIntName("Email Notifications");
              resetIntegrationForm();
              setIntName("Email Notifications");
              setIntDialogOpen(true);
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-green-500" />
                </div>
                {integrations.some((i) => i.type === "EMAIL") && (
                  <Badge className="text-xs bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    Connected
                  </Badge>
                )}
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">Email (Resend)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Get email notifications for every submission
              </p>
            </CardContent>
          </Card>

          {/* Google Sheets - Coming Soon */}
          <Card className="opacity-60 cursor-not-allowed">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                </div>
                <Badge variant="secondary" className="text-xs">Soon</Badge>
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">Google Sheets</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Append submissions to a spreadsheet automatically
              </p>
            </CardContent>
          </Card>

          {/* Slack */}
          <Card className="opacity-60 cursor-not-allowed">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                </div>
                <Badge variant="secondary" className="text-xs">Soon</Badge>
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">Slack</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Post submission alerts to Slack channels
              </p>
            </CardContent>
          </Card>

          {/* Telegram */}
          <Card className="opacity-60 cursor-not-allowed">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                  <Send className="h-5 w-5 text-sky-500" />
                </div>
                <Badge variant="secondary" className="text-xs">Soon</Badge>
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">Telegram</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive submission notifications via Telegram bot
              </p>
            </CardContent>
          </Card>

          {/* Discord */}
          <Card className="opacity-60 cursor-not-allowed">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-indigo-500" />
                </div>
                <Badge variant="secondary" className="text-xs">Soon</Badge>
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">Discord</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Send form submissions to Discord webhooks
              </p>
            </CardContent>
          </Card>

          {/* Notion */}
          <Card className="opacity-60 cursor-not-allowed">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-gray-500" />
                </div>
                <Badge variant="secondary" className="text-xs">Soon</Badge>
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">Notion</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add submissions as pages to your Notion database
              </p>
            </CardContent>
          </Card>

          {/* Zapier */}
          <Card className="opacity-60 cursor-not-allowed">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-orange-500" />
                </div>
                <Badge variant="secondary" className="text-xs">Soon</Badge>
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">Zapier</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect to 5000+ apps via Zapier workflows
              </p>
            </CardContent>
          </Card>

          {/* Make */}
          <Card className="opacity-60 cursor-not-allowed">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Share2 className="h-5 w-5 text-violet-500" />
                </div>
                <Badge variant="secondary" className="text-xs">Soon</Badge>
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">Make</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automate workflows with Make (Integromat)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Integrations List */}
        {integrations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Active Integrations</h3>
            <div className="space-y-2">
              {integrations.map((int) => (
                <Card key={int._id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {int.type}
                      </Badge>
                      <span className="font-medium text-sm text-foreground">{int.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={int.enabled}
                        onCheckedChange={(val) => handleToggleIntegration(int._id, val)}
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
      </div>

      {/* Integration Dialog */}
      <Dialog open={intDialogOpen} onOpenChange={setIntDialogOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleCreateIntegration}>
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {intType === "EMAIL" && "Configure Email Notifications"}
                {intType === "WEBHOOK" && "Configure Webhook"}
                {intType === "GOOGLE_SHEETS" && "Configure Google Sheets"}
              </DialogTitle>
              <DialogDescription>
                {intType === "WEBHOOK" && "Send form data to any URL via HTTP POST"}
                {intType === "EMAIL" && "Get email notifications for each submission"}
                {intType === "GOOGLE_SHEETS" && "Append submissions to a spreadsheet"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {intType === "EMAIL" ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-foreground">Integration Name</Label>
                    <Input
                      value={intName}
                      onChange={(e) => setIntName(e.target.value)}
                      placeholder="Email Notifications"
                      className="bg-card"
                      required
                    />
                  </div>

                  {/* API Key Selection */}
                  <div className="space-y-3">
                    <Label className="text-foreground">Resend API Key</Label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 cursor-pointer hover:bg-card transition-colors">
                        <input
                          type="radio"
                          name="apiKeySource"
                          checked={useAccountKey}
                          onChange={() => setUseAccountKey(true)}
                          className="h-4 w-4 accent-primary"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Use account Resend key</p>
                          <p className="text-xs text-muted-foreground">From your onboarding setup</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 cursor-pointer hover:bg-card transition-colors">
                        <input
                          type="radio"
                          name="apiKeySource"
                          checked={!useAccountKey}
                          onChange={() => setUseAccountKey(false)}
                          className="h-4 w-4 accent-primary"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Use custom API key</p>
                          <p className="text-xs text-muted-foreground">Enter a different Resend key</p>
                        </div>
                      </label>
                    </div>

                    {!useAccountKey && (
                      <Input
                        type="password"
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        placeholder="re_xxxx..."
                        className="bg-card mt-2"
                      />
                    )}

                    <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
                      API keys are encrypted at rest and never exposed in the UI.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">From Email</Label>
                    <Input
                      type="email"
                      value={emailFrom}
                      onChange={(e) => setEmailFrom(e.target.value)}
                      placeholder="noreply@yourdomain.com"
                      className="bg-card"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be a verified domain in your Resend account
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">To Email(s)</Label>
                    <Input
                      type="text"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="you@email.com, team@email.com"
                      className="bg-card"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated list of recipient emails
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Subject</Label>
                    <Input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="New Form Submission"
                      className="bg-card"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-foreground">Integration Name</Label>
                    <Input
                      value={intName}
                      onChange={(e) => setIntName(e.target.value)}
                      placeholder="e.g. Team Notifications, Sales Alert"
                      className="bg-card"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Configuration (JSON)</Label>
                    <Textarea
                      value={intConfig}
                      onChange={(e) => setIntConfig(e.target.value)}
                      rows={10}
                      className="font-mono text-xs bg-card"
                      placeholder="Paste your config JSON here"
                    />
                    <p className="text-xs text-muted-foreground">
                      {intType === "WEBHOOK" &&
                        "Include: url, method (POST/GET), optional secret for HMAC signing"}
                      {intType === "GOOGLE_SHEETS" &&
                        "Include: credentials (service account JSON), spreadsheetId, sheetName"}
                    </p>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIntDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={intCreating || !intName.trim()}>
                {intCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {intCreating ? "Adding..." : "Add Integration"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  Database,
  FileSpreadsheet,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  Share2,
  Trash2,
  Webhook,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [intSaving, setIntSaving] = useState(false);

  // Edit mode - tracks the integration being edited (null = create mode)
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [intEnabled, setIntEnabled] = useState(true);

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
    setEditingIntegration(null);
    setIntEnabled(true);
  }

  // Helper to find existing integration by type
  function getExistingIntegration(type: string): Integration | undefined {
    return integrations.find((i) => i.type === type);
  }

  // Open dialog for a specific integration type (create or edit)
  function openIntegrationDialog(type: string) {
    const existing = getExistingIntegration(type);
    setIntType(type);

    if (existing) {
      // Edit mode - populate with existing data
      setEditingIntegration(existing);
      setIntName(existing.name);
      setIntEnabled(existing.enabled);
      // Note: We can't populate config fields since they're encrypted on the server
      // User will need to re-enter if they want to change
      if (type === "EMAIL") {
        setEmailFrom("");
        setEmailTo("");
        setEmailSubject("New Form Submission");
        setUseAccountKey(true);
        setCustomApiKey("");
      } else {
        setIntConfig(configTemplates[type] || "{}");
      }
    } else {
      // Create mode
      resetIntegrationForm();
      setIntType(type);
      if (type === "EMAIL") {
        setIntName("Email Notifications");
      } else if (type === "WEBHOOK") {
        setIntName("Webhook");
        setIntConfig(configTemplates["WEBHOOK"]);
      } else {
        setIntName("");
        setIntConfig(configTemplates[type] || "{}");
      }
    }

    setIntDialogOpen(true);
  }

  async function handleSaveIntegration(e: React.FormEvent) {
    e.preventDefault();
    setIntSaving(true);
    try {
      let config: Record<string, unknown>;

      if (intType === "EMAIL") {
        // For edit mode, fields might be empty if user doesn't want to change config
        // Only validate if this is a new integration or user has entered values
        const hasEmailConfig = emailFrom.trim() || emailTo.trim();

        if (!editingIntegration && (!emailFrom.trim() || !emailTo.trim())) {
          toast.error("From and To email addresses are required");
          setIntSaving(false);
          return;
        }

        if (hasEmailConfig) {
          if (!emailFrom.trim() || !emailTo.trim()) {
            toast.error("Both From and To email addresses are required");
            setIntSaving(false);
            return;
          }

          if (!useAccountKey && !customApiKey.trim()) {
            toast.error("Please enter a custom API key or use your account key");
            setIntSaving(false);
            return;
          }

          const toEmails = emailTo.split(",").map((e) => e.trim()).filter(Boolean);
          if (toEmails.length === 0) {
            toast.error("At least one recipient email is required");
            setIntSaving(false);
            return;
          }

          config = {
            provider: "resend",
            apiKey: useAccountKey ? "auto" : customApiKey.trim(),
            from: emailFrom.trim(),
            to: toEmails,
            subject: emailSubject.trim() || "New Form Submission",
          };
        } else if (editingIntegration) {
          // Edit mode with no config changes - just update name/enabled
          const res = await fetch(`/api/v1/integrations/${editingIntegration._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: intName,
              enabled: intEnabled,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            toast.error(data.error || "Failed to update integration");
            return;
          }

          toast.success(`${intName} updated successfully!`);
          setIntDialogOpen(false);
          resetIntegrationForm();
          fetchIntegrations();
          return;
        } else {
          // Shouldn't reach here
          toast.error("From and To email addresses are required");
          setIntSaving(false);
          return;
        }
      } else {
        try {
          config = JSON.parse(intConfig);
        } catch {
          toast.error("Config must be valid JSON");
          setIntSaving(false);
          return;
        }
      }

      if (editingIntegration) {
        // Update existing integration
        const res = await fetch(`/api/v1/integrations/${editingIntegration._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: intName,
            config,
            enabled: intEnabled,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Failed to update integration");
          return;
        }

        toast.success(`${intName} updated successfully!`);
      } else {
        // Create new integration
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
      }

      setIntDialogOpen(false);
      resetIntegrationForm();
      fetchIntegrations();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIntSaving(false);
    }
  }

  async function handleDeleteFromDialog() {
    if (!editingIntegration) return;
    if (!confirm("Are you sure you want to remove this integration?")) return;

    try {
      const res = await fetch(`/api/v1/integrations/${editingIntegration._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Integration removed");
        setIntDialogOpen(false);
        resetIntegrationForm();
        fetchIntegrations();
      } else {
        toast.error("Failed to remove integration");
      }
    } catch {
      toast.error("Something went wrong");
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


          {/* Resend Email */}
          <Card
            className="group cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => openIntegrationDialog("EMAIL")}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-white/90 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-black" />
                </div>
                {getExistingIntegration("EMAIL") ? (
                  <Badge className="text-xs bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Popular</Badge>
                )}
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">Email (Resend)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Get email notifications for every submission
              </p>
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => openIntegrationDialog("GOOGLE_SHEETS")}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                </div>
                {getExistingIntegration("GOOGLE_SHEETS") ? (
                  <Badge className="text-xs bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Popular</Badge>
                )}
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">Google Sheets</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Append submissions to a spreadsheet automatically
              </p>
            </CardContent>
          </Card>

          {/* Webhooks */}
          <Card className="opacity-60 cursor-not-allowed">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Webhook className="h-5 w-5 text-gray-500" />
                </div>
                <Badge variant="secondary" className="text-xs">Soon</Badge>
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">Webhook</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Send form data to any URL via HTTP POST request
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

      </div>

      {/* Integration Dialog */}
      <Dialog open={intDialogOpen} onOpenChange={(open) => {
        setIntDialogOpen(open);
        if (!open) resetIntegrationForm();
      }}>
        <DialogContent className="max-w-lg bg-background border-border">
          <form onSubmit={handleSaveIntegration}>
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl font-semibold text-foreground">
                {editingIntegration ? "Edit" : "Configure"}{" "}
                {intType === "EMAIL" && "Email Notifications"}
                {intType === "WEBHOOK" && "Webhook"}
                {intType === "GOOGLE_SHEETS" && "Google Sheets"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {intType === "WEBHOOK" && "Send form data to any URL via HTTP POST"}
                {intType === "EMAIL" && "Get email notifications for each submission"}
                {intType === "GOOGLE_SHEETS" && "Append submissions to a spreadsheet"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-6">
              {/* Edit mode: Show enabled toggle */}
              {editingIntegration && (
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-foreground">Status</Label>
                    <p className="text-xs text-muted-foreground">
                      {intEnabled ? "Integration is active" : "Integration is paused"}
                    </p>
                  </div>
                  <Switch
                    checked={intEnabled}
                    onCheckedChange={setIntEnabled}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Integration Name</Label>
                <Input
                  value={intName}
                  onChange={(e) => setIntName(e.target.value)}
                  placeholder={intType === "EMAIL" ? "Email Notifications" : "e.g. Team Notifications"}
                  className="bg-card border-border"
                  required
                />
              </div>

              {intType === "EMAIL" ? (
                <>
                  {/* Edit mode notice */}
                  {editingIntegration && (
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-xs text-muted-foreground">
                        Leave email fields empty to keep existing configuration, or fill them all to update.
                      </p>
                    </div>
                  )}

                  {/* API Key Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">Resend API Key</Label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card cursor-pointer hover:bg-card/80 transition-colors">
                        <input
                          type="radio"
                          name="apiKeySource"
                          checked={useAccountKey}
                          onChange={() => setUseAccountKey(true)}
                          className="h-4 w-4 accent-primary"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Use account Resend key</p>
                          <p className="text-xs text-muted-foreground">Exising API Key</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card cursor-pointer hover:bg-card/80 transition-colors">
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
                        className="bg-card border-border"
                      />
                    )}
                  </div>

                  <Separator className="bg-border" />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">From Email</Label>
                    <Input
                      type="email"
                      value={emailFrom}
                      onChange={(e) => setEmailFrom(e.target.value)}
                      placeholder="noreply@yourdomain.com"
                      className="bg-card border-border"
                      required={!editingIntegration}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be a verified domain in your Resend account
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">To Email(s)</Label>
                    <Input
                      type="text"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="you@email.com, team@email.com"
                      className="bg-card border-border"
                      required={!editingIntegration}
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated list of recipient emails
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Subject</Label>
                    <Input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="New Form Submission"
                      className="bg-card border-border"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Configuration (JSON)</Label>
                  <Textarea
                    value={intConfig}
                    onChange={(e) => setIntConfig(e.target.value)}
                    rows={8}
                    className="font-mono text-xs bg-card border-border"
                    placeholder="Paste your config JSON here"
                  />
                  <p className="text-xs text-muted-foreground">
                    {intType === "WEBHOOK" &&
                      "Include: url, method (POST/GET), optional secret for HMAC signing"}
                    {intType === "GOOGLE_SHEETS" &&
                      "Include: credentials (service account JSON), spreadsheetId, sheetName"}
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/30 border border-border">
                API keys and credentials are encrypted at rest and never exposed in the UI.
              </p>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {editingIntegration && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteFromDialog}
                  className="sm:mr-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIntDialogOpen(false)}
                className="border-border"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={intSaving || !intName.trim()}>
                {intSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {intSaving
                  ? editingIntegration ? "Saving..." : "Adding..."
                  : editingIntegration ? "Save Changes" : "Add Integration"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

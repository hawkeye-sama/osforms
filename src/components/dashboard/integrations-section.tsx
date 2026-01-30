"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  Database,
  FileSpreadsheet,
  Mail,
  MessageSquare,
  Send,
  Share2,
  Webhook,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EmailConfig } from "@/components/integrations/email-config";
import { GoogleSheetsConfig } from "@/components/integrations/google-sheets-config";

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

export function IntegrationsSection({ formId }: IntegrationsSectionProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"EMAIL" | "GOOGLE_SHEETS" | null>(null);

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

  function getExistingIntegration(type: string): Integration | undefined {
    return integrations.find((i) => i.type === type);
  }

  function openDialog(type: "EMAIL" | "GOOGLE_SHEETS") {
    setDialogType(type);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setDialogType(null);
  }

  function handleSaveOrDelete() {
    closeDialog();
    fetchIntegrations();
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

  const existingEmail = getExistingIntegration("EMAIL");
  const existingSheets = getExistingIntegration("GOOGLE_SHEETS");

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
            onClick={() => openDialog("EMAIL")}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-white/90 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-black" />
                </div>
                {existingEmail ? (
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

          {/* Google Sheets */}
          <Card
            className="group cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => openDialog("GOOGLE_SHEETS")}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                </div>
                {existingSheets ? (
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

          {/* Webhooks - Coming Soon */}
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
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) closeDialog();
      }}>
        <DialogContent className="max-w-lg bg-background border-border">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-foreground">
              {dialogType === "EMAIL" && (existingEmail ? "Edit Email Notifications" : "Configure Email Notifications")}
              {dialogType === "GOOGLE_SHEETS" && (existingSheets ? "Edit Google Sheets" : "Configure Google Sheets")}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {dialogType === "EMAIL" && "Get email notifications for each submission"}
              {dialogType === "GOOGLE_SHEETS" && "Append submissions to a spreadsheet"}
            </DialogDescription>
          </DialogHeader>

          {dialogType === "EMAIL" && (
            <EmailConfig
              formId={formId}
              existingIntegration={existingEmail || null}
              onSave={handleSaveOrDelete}
              onDelete={handleSaveOrDelete}
              onClose={closeDialog}
            />
          )}

          {dialogType === "GOOGLE_SHEETS" && (
            <GoogleSheetsConfig
              formId={formId}
              existingIntegration={existingSheets || null}
              onSave={handleSaveOrDelete}
              onDelete={handleSaveOrDelete}
              onClose={closeDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

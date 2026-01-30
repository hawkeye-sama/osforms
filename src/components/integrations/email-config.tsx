"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Integration {
  _id: string;
  type: string;
  name: string;
  enabled: boolean;
  createdAt: string;
}

interface EmailConfigProps {
  formId: string;
  existingIntegration: Integration | null;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function EmailConfig({
  formId,
  existingIntegration,
  onSave,
  onDelete,
  onClose,
}: EmailConfigProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(existingIntegration?.name || "Email Notifications");
  const [enabled, setEnabled] = useState(existingIntegration?.enabled ?? true);

  // Email form fields
  const [emailFrom, setEmailFrom] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("New Form Submission");
  const [useAccountKey, setUseAccountKey] = useState(true);
  const [customApiKey, setCustomApiKey] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      // For edit mode, fields might be empty if user doesn't want to change config
      const hasEmailConfig = emailFrom.trim() || emailTo.trim();

      if (!existingIntegration && (!emailFrom.trim() || !emailTo.trim())) {
        toast.error("From and To email addresses are required");
        setSaving(false);
        return;
      }

      if (hasEmailConfig) {
        if (!emailFrom.trim() || !emailTo.trim()) {
          toast.error("Both From and To email addresses are required");
          setSaving(false);
          return;
        }

        if (!useAccountKey && !customApiKey.trim()) {
          toast.error("Please enter a custom API key or use your account key");
          setSaving(false);
          return;
        }

        const toEmails = emailTo.split(",").map((e) => e.trim()).filter(Boolean);
        if (toEmails.length === 0) {
          toast.error("At least one recipient email is required");
          setSaving(false);
          return;
        }

        const config = {
          provider: "resend",
          apiKey: useAccountKey ? "auto" : customApiKey.trim(),
          from: emailFrom.trim(),
          to: toEmails,
          subject: emailSubject.trim() || "New Form Submission",
        };

        if (existingIntegration) {
          // Update existing
          const res = await fetch(`/api/v1/integrations/${existingIntegration._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, config, enabled }),
          });

          const data = await res.json();
          if (!res.ok) {
            toast.error(data.error || "Failed to update integration");
            return;
          }
          toast.success(`${name} updated successfully!`);
        } else {
          // Create new
          const res = await fetch("/api/v1/integrations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ formId, type: "EMAIL", name, config }),
          });

          const data = await res.json();
          if (!res.ok) {
            toast.error(data.error || "Failed to create integration");
            return;
          }
          toast.success(`${name} integration added successfully!`);
        }

        onSave();
      } else if (existingIntegration) {
        // Edit mode with no config changes - just update name/enabled
        const res = await fetch(`/api/v1/integrations/${existingIntegration._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, enabled }),
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Failed to update integration");
          return;
        }

        toast.success(`${name} updated successfully!`);
        onSave();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existingIntegration) return;
    if (!confirm("Are you sure you want to remove this integration?")) return;

    try {
      const res = await fetch(`/api/v1/integrations/${existingIntegration._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Integration removed");
        onDelete();
      } else {
        toast.error("Failed to remove integration");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 py-4">
      {/* Edit mode: Show enabled toggle */}
      {existingIntegration && (
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium text-foreground">Status</Label>
            <p className="text-xs text-muted-foreground">
              {enabled ? "Integration is active" : "Integration is paused"}
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Integration Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Email Notifications"
          className="bg-card border-border"
          required
        />
      </div>

      {/* Edit mode notice */}
      {existingIntegration && (
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
              <p className="text-xs text-muted-foreground">Existing API Key</p>
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
          required={!existingIntegration}
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
          required={!existingIntegration}
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

      <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/30 border border-border">
        API keys and credentials are encrypted at rest and never exposed in the UI.
      </p>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {existingIntegration && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            className="mr-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || !name.trim()}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving
            ? existingIntegration ? "Saving..." : "Adding..."
            : existingIntegration ? "Save Changes" : "Add Integration"}
        </Button>
      </div>
    </form>
  );
}

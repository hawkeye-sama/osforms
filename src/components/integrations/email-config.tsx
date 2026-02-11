'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { TemplateEditor } from '@/components/integrations/template-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { DEFAULT_AUTO_REPLY_TEMPLATE } from '@/lib/validations';

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
  onAutoReplyChange?: (enabled: boolean) => void;
}

export function EmailConfig({
  formId,
  existingIntegration,
  onSave,
  onDelete,
  onClose,
  onAutoReplyChange,
}: EmailConfigProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(
    existingIntegration?.name || 'Email Notifications'
  );
  const [enabled, setEnabled] = useState(existingIntegration?.enabled ?? true);

  // Email form fields
  const [emailFrom, setEmailFrom] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('New Form Submission');
  const [useAccountKey, setUseAccountKey] = useState(!!existingIntegration);
  const [customApiKey, setCustomApiKey] = useState('');

  // Auto-reply state
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyEmailField, setAutoReplyEmailField] = useState('');
  const [autoReplySubject, setAutoReplySubject] = useState(
    'Thank you for your submission'
  );
  const [autoReplyTemplate, setAutoReplyTemplate] = useState(
    DEFAULT_AUTO_REPLY_TEMPLATE
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      // For edit mode, fields might be empty if user doesn't want to change config
      const hasEmailConfig = emailFrom.trim() || emailTo.trim();

      if (!existingIntegration && (!emailFrom.trim() || !emailTo.trim())) {
        toast.error('From and To email addresses are required');
        setSaving(false);
        return;
      }

      if (hasEmailConfig) {
        if (!emailFrom.trim() || !emailTo.trim()) {
          toast.error('Both From and To email addresses are required');
          setSaving(false);
          return;
        }

        if (!useAccountKey && !customApiKey.trim()) {
          toast.error('Please enter a custom API key or use your account key');
          setSaving(false);
          return;
        }

        const toEmails = emailTo
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean);
        if (toEmails.length === 0) {
          toast.error('At least one recipient email is required');
          setSaving(false);
          return;
        }

        const config = {
          provider: 'resend',
          apiKey: useAccountKey ? 'auto' : customApiKey.trim(),
          from: emailFrom.trim(),
          to: toEmails,
          subject: emailSubject.trim() || 'New Form Submission',
          autoReply: autoReplyEnabled
            ? {
                enabled: true,
                emailField: autoReplyEmailField.trim() || undefined,
                subject:
                  autoReplySubject.trim() || 'Thank you for your submission',
                htmlTemplate: autoReplyTemplate,
              }
            : undefined,
        };

        if (existingIntegration) {
          // Update existing
          const res = await fetch(
            `/api/v1/integrations/${existingIntegration._id}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, config, enabled }),
            }
          );

          const data = await res.json();
          if (!res.ok) {
            toast.error(data.error || 'Failed to update integration');
            return;
          }
          toast.success(`${name} updated successfully!`);
        } else {
          // Create new
          const res = await fetch('/api/v1/integrations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ formId, type: 'EMAIL', name, config }),
          });

          const data = await res.json();
          if (!res.ok) {
            toast.error(data.error || 'Failed to create integration');
            return;
          }
          toast.success(`${name} integration added successfully!`);
        }

        onSave();
      } else if (existingIntegration) {
        // Edit mode with no config changes - just update name/enabled
        const res = await fetch(
          `/api/v1/integrations/${existingIntegration._id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, enabled }),
          }
        );

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || 'Failed to update integration');
          return;
        }

        toast.success(`${name} updated successfully!`);
        onSave();
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existingIntegration) {
      return;
    }
    if (!confirm('Are you sure you want to remove this integration?')) {
      return;
    }

    try {
      const res = await fetch(
        `/api/v1/integrations/${existingIntegration._id}`,
        {
          method: 'DELETE',
        }
      );

      if (res.ok) {
        toast.success('Integration removed');
        onDelete();
      } else {
        toast.error('Failed to remove integration');
      }
    } catch {
      toast.error('Something went wrong');
    }
  }

  let buttonText = 'Add Integration';

  if (saving) {
    buttonText = existingIntegration ? 'Saving...' : 'Adding...';
  } else if (existingIntegration) {
    buttonText = 'Save Changes';
  }

  return (
    <form onSubmit={handleSave} className="py-4">
      <div
        className={cn(
          'grid gap-6',
          autoReplyEnabled ? 'grid-cols-[1fr_1fr_1.5fr]' : 'grid-cols-1'
        )}
      >
        {/* Left Column: Notification Config */}
        <div className="space-y-5">
          {/* Edit mode: Show enabled toggle */}
          {existingIntegration && (
            <div className="border-border bg-card/50 flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-foreground text-sm font-medium">
                  Status
                </Label>
                <p className="text-muted-foreground text-xs">
                  {enabled ? 'Integration is active' : 'Integration is paused'}
                </p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">
              Integration Name
            </Label>
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
            <div className="bg-muted/50 border-border rounded-lg border p-3">
              <p className="text-muted-foreground text-xs">
                Leave email fields empty to keep existing configuration, or fill
                them all to update.
              </p>
            </div>
          )}

          {/* API Key Selection */}
          <div className="space-y-3">
            <Label className="text-foreground text-sm font-medium">
              Resend API Key
            </Label>
            <div className="space-y-2">
              {existingIntegration && (
                <label className="border-border bg-card hover:bg-card/80 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors">
                  <input
                    type="radio"
                    name="apiKeySource"
                    checked={useAccountKey}
                    onChange={() => setUseAccountKey(true)}
                    className="accent-primary h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="text-foreground text-sm font-medium">
                      Use existing Resend key
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Existing API Key
                    </p>
                  </div>
                </label>
              )}
              <label className="border-border bg-card hover:bg-card/80 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors">
                <input
                  type="radio"
                  name="apiKeySource"
                  checked={!useAccountKey}
                  onChange={() => setUseAccountKey(false)}
                  className="accent-primary h-4 w-4"
                />
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">
                    Use custom API key
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Enter a different Resend key
                  </p>
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
            <Label className="text-foreground text-sm font-medium">
              From Email
            </Label>
            <Input
              type="email"
              value={emailFrom}
              onChange={(e) => setEmailFrom(e.target.value)}
              placeholder="noreply@yourdomain.com"
              className="bg-card border-border"
              required={!existingIntegration}
            />
            <p className="text-muted-foreground text-xs">
              Must be a verified domain in your Resend account
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">
              To Email(s)
            </Label>
            <Input
              type="text"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="you@email.com, team@email.com"
              className="bg-card border-border"
              required={!existingIntegration}
            />
            <p className="text-muted-foreground text-xs">
              Comma-separated list of recipient emails
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">
              Subject
            </Label>
            <Input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="New Form Submission"
              className="bg-card border-border"
            />
          </div>

          <Separator className="bg-border" />

          {/* Auto-Reply Toggle */}
          <div className="border-border bg-card/50 flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-foreground text-sm font-medium">
                Auto-Reply
              </Label>
              <p className="text-muted-foreground text-xs">
                Send confirmation email to form submitters
              </p>
            </div>
            <Switch
              checked={autoReplyEnabled}
              onCheckedChange={(checked) => {
                setAutoReplyEnabled(checked);
                onAutoReplyChange?.(checked);
              }}
            />
          </div>

          <p className="text-muted-foreground bg-muted/30 border-border rounded-lg border p-3 text-xs">
            API keys and credentials are encrypted at rest and never exposed in
            the UI.
          </p>
        </div>

        {/* Middle Column: Auto-Reply Settings (only when enabled) */}
        {autoReplyEnabled && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-foreground text-sm font-semibold">
                Auto-Reply Settings
              </h3>
              <p className="text-muted-foreground text-xs">
                Configure the confirmation email
              </p>
            </div>

            {/* Email Field Name */}
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">
                Email Field{' '}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                value={autoReplyEmailField}
                onChange={(e) => setAutoReplyEmailField(e.target.value)}
                placeholder="Auto-detect"
                className="bg-card border-border"
              />
              <p className="text-muted-foreground text-xs">
                Detects: email, Email, user_email, etc.
              </p>
            </div>

            {/* Reply Subject */}
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">
                Reply Subject
              </Label>
              <Input
                value={autoReplySubject}
                onChange={(e) => setAutoReplySubject(e.target.value)}
                placeholder="Thank you for your submission"
                className="bg-card border-border"
              />
            </div>

            {/* Variable Reference */}
            <div className="bg-muted/30 border-border space-y-2 rounded-lg border p-3">
              <p className="text-muted-foreground text-xs font-medium">
                Available Variables:
              </p>
              <div className="text-muted-foreground grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-xs">
                <span>{'{{name}}'}</span>
                <span>{'{{email}}'}</span>
                <span>{'{{formName}}'}</span>
                <span>{'{{submittedAt}}'}</span>
              </div>
              <p className="text-muted-foreground mt-1 font-mono text-xs">
                {'{{#if field}}...{{/if}}'}
              </p>
            </div>
          </div>
        )}

        {/* Right Column: Template Editor (only when enabled) */}
        {autoReplyEnabled && (
          <div className="flex flex-col">
            <Label className="text-foreground mb-2 text-sm font-medium">
              Email Template
            </Label>
            <TemplateEditor
              template={autoReplyTemplate}
              subject={autoReplySubject}
              onTemplateChange={setAutoReplyTemplate}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-border mt-6 flex gap-2 border-t pt-4">
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
          {buttonText}
        </Button>
      </div>
    </form>
  );
}

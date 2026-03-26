'use client';

import { Eye, EyeOff, Loader2, Send, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface Integration {
  _id: string;
  type: string;
  name: string;
  enabled: boolean;
  createdAt: string;
}

interface WebhookConfigProps {
  formId: string;
  existingIntegration: Integration | null;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function WebhookConfig({
  formId,
  existingIntegration,
  onSave,
  onDelete,
  onClose,
}: WebhookConfigProps) {
  const [loading, setLoading] = useState(!!existingIntegration);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [name, setName] = useState(existingIntegration?.name || 'Webhook');
  const [enabled, setEnabled] = useState(existingIntegration?.enabled ?? true);

  // Webhook form fields
  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [hasExistingSecret, setHasExistingSecret] = useState(false);

  // Fetch existing config when editing
  useEffect(() => {
    if (!existingIntegration) {
      return;
    }

    const integrationId = existingIntegration._id;

    async function fetchConfig() {
      try {
        const res = await fetch(`/api/v1/integrations/${integrationId}`);
        if (res.ok) {
          const data = await res.json();
          const config = data.integration?.config;
          if (config) {
            setUrl(config.url || '');
            // Secret is masked, just track if it exists
            if (config.secret && config.secret !== '') {
              setHasExistingSecret(true);
            }
          }
        }
      } catch {
        // Non-critical, fields will just be empty
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, [existingIntegration]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const hasConfig = url.trim();

      if (!existingIntegration && !url.trim()) {
        toast.error('Webhook URL is required');
        setSaving(false);
        return;
      }

      if (hasConfig) {
        // Validate URL format
        try {
          new URL(url.trim());
        } catch {
          toast.error(
            'Please enter a valid URL (e.g., https://example.com/webhook)'
          );
          setSaving(false);
          return;
        }

        const config: Record<string, unknown> = {
          url: url.trim(),
          method: 'POST',
          headers: {},
        };

        // Only include secret if user entered a new one
        // If editing and secret is empty but one exists, we'll preserve it server-side
        if (secret.trim()) {
          config.secret = secret.trim();
        } else if (existingIntegration && hasExistingSecret) {
          // Signal to keep existing secret
          config.secret = '__KEEP_EXISTING__';
        }

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
            body: JSON.stringify({ formId, type: 'WEBHOOK', name, config }),
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

  async function handleTest() {
    if (!existingIntegration) {
      toast.error('Save the integration first before testing');
      return;
    }

    setTesting(true);
    try {
      const res = await fetch(
        `/api/v1/integrations/${existingIntegration._id}/test`,
        {
          method: 'POST',
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || data.error || 'Test failed');
        return;
      }
      toast.success('Test webhook sent successfully!');
    } catch {
      toast.error('Failed to send test webhook');
    } finally {
      setTesting(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 py-4">
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
          placeholder="Webhook"
          className="bg-card border-border"
          required
        />
      </div>

      <Separator className="bg-border" />

      <div className="space-y-2">
        <Label className="text-foreground text-sm font-medium">
          Webhook URL
        </Label>
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/webhook"
          className="bg-card border-border"
          required={!existingIntegration}
        />
        <p className="text-muted-foreground text-xs">
          Form submissions will be sent to this URL via HTTP POST
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground text-sm font-medium">
          Signing Secret{' '}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <div className="relative">
          <Input
            type={showSecret ? 'text' : 'password'}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder={
              hasExistingSecret
                ? '••••••••  (leave empty to keep existing)'
                : 'your-secret-key'
            }
            className="bg-card border-border pr-10"
          />
          <button
            type="button"
            onClick={() => setShowSecret(!showSecret)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors"
          >
            {showSecret ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-muted-foreground text-xs">
          Used to sign requests with HMAC SHA-256. Verify using the{' '}
          <code className="bg-muted rounded px-1 py-0.5 text-xs">
            X-osforms-Signature
          </code>{' '}
          header.
          {hasExistingSecret && (
            <span className="text-muted-foreground ml-1">
              A secret is currently configured.
            </span>
          )}
        </p>
      </div>

      {/* Payload info */}
      <div className="bg-muted/30 border-border space-y-2 rounded-lg border p-3">
        <p className="text-muted-foreground text-xs font-medium">
          Webhook Payload Format:
        </p>
        <pre className="bg-background text-muted-foreground overflow-x-auto rounded p-2 text-xs">
          {`{
            "event": "form.submission",
            "formId": "...",
            "formName": "...",
            "submissionId": "...",
            "submittedAt": "...",
            "data": { /* form fields */ }
          }`}
        </pre>
      </div>

      {/* Test button for existing integrations */}
      {existingIntegration && (
        <>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-foreground text-sm font-medium">
                Test Webhook
              </p>
              <p className="text-muted-foreground text-xs">
                Send a test payload to verify your endpoint
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={testing}
            >
              {testing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {testing ? 'Sending...' : 'Send Test'}
            </Button>
          </div>
        </>
      )}

      <p className="text-muted-foreground bg-muted/30 border-border rounded-lg border p-3 text-xs">
        Signing secrets are encrypted at rest and never exposed in the UI.
        Webhooks timeout after 30 seconds.
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
          {buttonText}
        </Button>
      </div>
    </form>
  );
}

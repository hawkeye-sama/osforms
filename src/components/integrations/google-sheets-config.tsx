'use client';

import { ExternalLink, Loader2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

interface Integration {
  _id: string;
  type: string;
  name: string;
  enabled: boolean;
  createdAt: string;
}

interface GoogleSheetsConfigProps {
  formId: string;
  existingIntegration: Integration | null;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

interface IntegrationStatus {
  connectedEmail: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetName: string;
}

export function GoogleSheetsConfig({
  formId,
  existingIntegration,
  onSave,
  onDelete,
  onClose,
}: GoogleSheetsConfigProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [name, setName] = useState(
    existingIntegration?.name || 'Google Sheets'
  );
  const [enabled, setEnabled] = useState(existingIntegration?.enabled ?? true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/v1/integrations/${existingIntegration?._id}/status`
      );
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        setName(existingIntegration?.name || data.name || 'Google Sheets');
        setEnabled(existingIntegration?.enabled ?? true);
      }
    } catch {
      toast.error('Failed to load integration status');
    } finally {
      setLoading(false);
    }
  }, [
    existingIntegration?._id,
    existingIntegration?.enabled,
    existingIntegration?.name,
  ]);

  useEffect(() => {
    if (existingIntegration) {
      fetchStatus();
    } else {
      setLoading(false);
    }
  }, [existingIntegration, fetchStatus]);

  function handleConnect() {
    // Redirect to Google OAuth
    window.location.href = `/api/auth/google/login?formId=${formId}`;
  }

  async function handleSave() {
    if (!existingIntegration) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `/api/v1/integrations/${existingIntegration._id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, enabled }),
        }
      );

      if (res.ok) {
        toast.success('Integration updated');
        onSave();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update integration');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect() {
    if (!existingIntegration) {
      return;
    }
    if (
      !confirm(
        'Are you sure you want to disconnect Google Sheets? This will remove the integration.'
      )
    ) {
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
        toast.success('Google Sheets disconnected');
        onDelete();
      } else {
        toast.error('Failed to disconnect');
      }
    } catch {
      toast.error('Something went wrong');
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-10 w-full" variant="light" />
        <Skeleton className="h-10 w-full" variant="light" />
        <Skeleton className="h-10 w-full" variant="light" />
      </div>
    );
  }

  // Not connected state
  if (!existingIntegration) {
    return (
      <div className="space-y-6 py-4">
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-medium">
            Integration Name
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Google Sheets"
            className="bg-card border-border"
          />
        </div>

        <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4 text-center">
          <p className="text-muted-foreground text-sm">
            Connect your Google account to automatically save form submissions
            to a spreadsheet.
          </p>
          <Button onClick={handleConnect} className="gap-2">
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

        <p className="text-muted-foreground text-xs">
          A new spreadsheet will be created automatically when you connect.
        </p>
      </div>
    );
  }

  // Connected state
  return (
    <div className="space-y-5 py-4">
      {/* Status toggle */}
      <div className="border-border bg-card/50 flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-foreground text-sm font-medium">Status</Label>
          <p className="text-muted-foreground text-xs">
            {enabled ? 'Integration is active' : 'Integration is paused'}
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {/* Integration name */}
      <div className="space-y-2">
        <Label className="text-foreground text-sm font-medium">
          Integration Name
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Google Sheets"
          className="bg-card border-border"
        />
      </div>

      {/* Connected account info */}
      {status && (
        <>
          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">
              Connected Account
            </Label>
            <div className="border-border bg-card/50 rounded-lg border p-3">
              <p className="text-foreground text-sm">{status.connectedEmail}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground text-sm font-medium">
              Spreadsheet
            </Label>
            <div className="flex gap-2">
              <Input
                value={status.spreadsheetUrl}
                readOnly
                className="bg-card border-border flex-1 font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                asChild
                className="shrink-0"
              >
                <a
                  href={status.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                </a>
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Sheet: {status.sheetName}
            </p>
          </div>
        </>
      )}

      <p className="text-muted-foreground bg-muted/30 border-border rounded-lg border p-3 text-xs">
        Form submissions will be automatically added as rows to this
        spreadsheet.
      </p>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDisconnect}
          className="mr-auto"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
        <Button
          type="button"
          className="text-black"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving || !name.trim()}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

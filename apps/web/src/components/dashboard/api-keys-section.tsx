'use client';

import { Check, Copy, KeyRound, Loader2, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

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

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  forms: { id: string; name: string; slug: string }[];
  lastUsedAt: string | null;
  createdAt: string;
}

interface FormOption {
  _id: string;
  name: string;
  slug: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ApiKeysSection() {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [forms, setForms] = useState<FormOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedFormIds, setSelectedFormIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [keysRes, formsRes] = await Promise.all([
        fetch('/api/v1/api-keys'),
        fetch('/api/v1/forms'),
      ]);
      const [keysData, formsData] = await Promise.all([
        keysRes.json(),
        formsRes.json(),
      ]);
      if (keysRes.ok) {
        setApiKeys(keysData.apiKeys);
      }
      if (formsRes.ok) {
        setForms(formsData.forms);
      }
    } catch {
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openDialog() {
    setName('');
    setSelectedFormIds([]);
    setCreatedKey('');
    setCopied(false);
    setDialogOpen(true);
  }

  function toggleForm(formId: string) {
    setSelectedFormIds((prev) =>
      prev.includes(formId)
        ? prev.filter((id) => id !== formId)
        : [...prev, formId]
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || selectedFormIds.length === 0) {
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), formIds: selectedFormIds }),
      });
      const data = await res.json();

      if (res.ok) {
        setCreatedKey(data.apiKey.key);
        fetchData();
      } else {
        toast.error(data.error || 'Failed to create API key');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(apiKey: ApiKeyItem) {
    if (
      !confirm(
        `Revoke "${apiKey.name}"? Anything using this key will stop working immediately.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/api-keys/${apiKey.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('API key revoked');
        setApiKeys((prev) => prev.filter((k) => k.id !== apiKey.id));
      } else {
        toast.error('Failed to revoke API key');
      }
    } catch {
      toast.error('Something went wrong');
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="text-foreground h-5 w-5" />
              <CardTitle className="text-foreground text-lg">
                API Keys
              </CardTitle>
            </div>
            <CardDescription className="mt-1.5">
              Read submissions from your own server. Keys are read-only and
              limited to the forms you pick.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={openDialog}
            disabled={loading || forms.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Key
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}
        {!loading && apiKeys.length === 0 && (
          <p className="text-muted-foreground text-sm">
            {forms.length === 0
              ? 'Create a form first, then come back to create an API key for it.'
              : 'No API keys yet. Create one to pull submissions into your own platform.'}
          </p>
        )}
        {!loading && apiKeys.length > 0 && (
          <div className="divide-border divide-y">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-foreground font-medium">{apiKey.name}</p>
                    <code className="text-muted-foreground font-mono text-xs">
                      {apiKey.prefix}…
                    </code>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {apiKey.forms.length > 0 ? (
                      apiKey.forms.map((form) => (
                        <Badge
                          key={form.id}
                          variant="secondary"
                          title={`Slug: ${form.slug}`}
                        >
                          {form.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        No forms (all scoped forms were deleted)
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Created {formatDate(apiKey.createdAt)} ·{' '}
                    {apiKey.lastUsedAt
                      ? `Last used ${formatDate(apiKey.lastUsedAt)}`
                      : 'Never used'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevoke(apiKey)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          {createdKey ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Copy your API key
                </DialogTitle>
                <DialogDescription>
                  This is the only time the full key is shown. Store it in your
                  server&apos;s environment variables, never in browser code.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={createdKey}
                  className="text-foreground font-mono text-xs"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <Button type="button" variant="outline" onClick={copyKey}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Forms</Label>
                <p className="text-muted-foreground text-xs">
                  Pass the form&apos;s endpoint slug as{' '}
                  <code className="font-mono">formId</code> when calling{' '}
                  <code className="font-mono">GET /api/v1/submissions</code>.
                </p>
                <div className="border-border space-y-1 rounded-md border p-3">
                  {forms
                    .filter((form) => selectedFormIds.includes(form._id))
                    .map((form) => (
                      <div
                        key={form._id}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <span className="text-foreground truncate">
                          {form.name}
                        </span>
                        <code className="text-muted-foreground font-mono text-xs">
                          {form.slug}
                        </code>
                      </div>
                    ))}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)}>Done</Button>
              </DialogFooter>
            </>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Create API key
                </DialogTitle>
                <DialogDescription>
                  The key can read submissions from the selected forms only.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="api-key-name" className="text-foreground">
                  Name
                </Label>
                <Input
                  id="api-key-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Client admin panel"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Forms</Label>
                <div className="border-border max-h-56 space-y-1 overflow-y-auto rounded-md border p-2">
                  {forms.map((form) => (
                    <label
                      key={form._id}
                      className="hover:bg-secondary flex cursor-pointer items-center gap-3 rounded px-2 py-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFormIds.includes(form._id)}
                        onChange={() => toggleForm(form._id)}
                        className="h-4 w-4 cursor-pointer accent-white"
                      />
                      <span className="text-foreground text-sm">
                        {form.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    creating || !name.trim() || selectedFormIds.length === 0
                  }
                >
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {creating ? 'Creating...' : 'Create Key'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

'use client';

import { ArrowRight, Inbox, Loader2, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface Form {
  _id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchForms = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/forms');
      const data = await res.json();
      if (res.ok) {
        setForms(data.forms);
      }
    } catch {
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  async function handleCreateForm(e: React.FormEvent) {
    e.preventDefault();
    if (!newFormName.trim()) {
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/v1/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFormName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to create form');
        return;
      }

      toast.success('Form created!');
      setNewFormName('');
      setDialogOpen(false);
      fetchForms();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setCreating(false);
    }
  }

  // Filter forms by search query
  const filteredForms = forms.filter((form) =>
    form.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Forms
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your form endpoints and view submissions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Form
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateForm}>
              <DialogHeader>
                <DialogTitle>Create a new form</DialogTitle>
                <DialogDescription>
                  Give your form a name. You&apos;ll get a unique endpoint URL
                  to receive submissions.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="formName">Form Name</Label>
                <Input
                  id="formName"
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  placeholder="e.g. Contact Form, Newsletter Signup"
                  className="mt-2"
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={creating || !newFormName.trim()}
                >
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {creating ? 'Creating...' : 'Create Form'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      {forms.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Forms list */}
      {(() => {
        let content = null;
        if (loading) {
          content = (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="mb-2 h-4 w-full" />
                    <Skeleton className="mb-3 h-1.5 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        } else if (forms.length === 0) {
          content = (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Inbox className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="text-foreground text-lg font-semibold">
                  No forms yet
                </h3>
                <p className="text-muted-foreground mt-1 mb-6 text-sm">
                  Create your first form to start collecting submissions
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Form
                </Button>
              </CardContent>
            </Card>
          );
        } else if (filteredForms.length === 0) {
          content = (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Search className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="text-foreground text-lg font-semibold">
                  No forms found
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Try adjusting your search query
                </p>
              </CardContent>
            </Card>
          );
        } else {
          content = (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredForms.map((form) => (
                <Link key={form._id} href={`/dashboard/forms/${form._id}`}>
                  <Card className="card-hover h-full cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="truncate text-base font-semibold">
                          {form.name}
                        </CardTitle>
                        <Badge variant={form.active ? 'default' : 'secondary'}>
                          {form.active ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-muted-foreground truncate font-mono text-xs">
                          /api/v1/f/{form.slug}
                        </p>
                        <ArrowRight className="text-muted-foreground h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          );
        }
        return content;
      })()}
    </div>
  );
}

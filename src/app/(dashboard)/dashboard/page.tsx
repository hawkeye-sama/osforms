"use client";

import { PlanInfoCard } from "@/components/dashboard/plan-info-card";
import { SubmissionsChart } from "@/components/dashboard/submissions-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Inbox, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Form {
  _id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
}

interface Usage {
  submissionsUsed: number;
  submissionsLimit: number;
  currentMonth: string;
}

interface ChartDataPoint {
  date: string;
  submissions: number;
}

export default function DashboardPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [usage, setUsage] = useState<Usage>({ submissionsUsed: 0, submissionsLimit: 100, currentMonth: "" });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFormName, setNewFormName] = useState("");

  const fetchForms = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/forms");
      const data = await res.json();
      if (res.ok) {
        setForms(data.forms);
        if (data.usage) setUsage(data.usage);
      }
    } catch {
      toast.error("Failed to load forms");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChartData = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/stats/submissions?period=30d");
      const data = await res.json();
      if (res.ok) setChartData(data.chartData);
    } catch {
      // Silently fail for chart - not critical
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
    fetchChartData();
  }, [fetchForms, fetchChartData]);

  async function handleCreateForm(e: React.FormEvent) {
    e.preventDefault();
    if (!newFormName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/v1/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFormName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create form");
        return;
      }

      toast.success("Form created!");
      setNewFormName("");
      setDialogOpen(false);
      fetchForms();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  // Calculate plan info from usage
  const planInfo = {
    name: "Free",
    submissionsUsed: usage.submissionsUsed,
    submissionsLimit: usage.submissionsLimit,
    formsUsed: forms.length,
    formsLimit: 10,
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your form submissions and usage
        </p>
      </div>

      {/* Submissions Chart - Full Width */}
      {chartLoading ? (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <div className="text-right">
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ) : (
        <SubmissionsChart data={chartData} title="Form Submissions (Last 30 Days)" />
      )}

      {/* Forms + Plan Info - Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_500px]">
        {/* Forms Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Your Forms</h2>
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
                      Give your form a name. You&apos;ll get a unique endpoint URL to
                      receive submissions.
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
                    <Button type="submit" disabled={creating || !newFormName.trim()}>
                      {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {creating ? "Creating..." : "Create Form"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Forms list */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-1.5 w-full mb-3" />
                    <Skeleton className="h-3 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : forms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No forms yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6">
                  Create your first form to start collecting submissions
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Form
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {forms.map((form) => (
                <Link key={form._id} href={`/dashboard/forms/${form._id}`}>
                  <Card className="card-hover cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold truncate">
                          {form.name}
                        </CardTitle>
                        <Badge variant={form.active ? "default" : "secondary"}>
                          {form.active ? "Active" : "Paused"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          /api/v1/f/{form.slug}
                        </p>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* View all forms link */}
          {forms.length > 0 && (
            <div className="mt-4 text-center">
              <Link
                href="/dashboard/forms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View all forms
              </Link>
            </div>
          )}
        </div>

        {/* Plan Info Sidebar */}
        <div className="space-y-4">
          <PlanInfoCard plan={planInfo} />
        </div>
      </div>
    </div>
  );
}

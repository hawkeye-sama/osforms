'use client';

import { Inbox, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { SubmissionsChart } from '@/components/dashboard/submissions-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Submission {
  _id: string;
  data: Record<string, unknown>;
  metadata: { ip: string; userAgent: string; origin: string };
  createdAt: string;
}

interface ChartDataPoint {
  date: string;
  submissions: number;
}

interface SubmissionsSectionProps {
  formId: string;
}

export function SubmissionsSection({ formId }: SubmissionsSectionProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [hasMoreSubmissions, setHasMoreSubmissions] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Chart state
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartPeriod, setChartPeriod] = useState('30d');
  const [chartLoading, setChartLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/v1/forms/${formId}/submissions?limit=20&page=1`
      );
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions);
        setSubmissionsPage(1);
        setHasMoreSubmissions(
          data.pagination?.hasMore ?? data.submissions.length === 20
        );
      }
    } catch {
      // non-critical
    }
  }, [formId]);

  const loadMoreSubmissions = useCallback(async () => {
    if (loadingMore || !hasMoreSubmissions) {
      return;
    }
    setLoadingMore(true);
    try {
      const nextPage = submissionsPage + 1;
      const res = await fetch(
        `/api/v1/forms/${formId}/submissions?limit=20&page=${nextPage}`
      );
      if (res.ok) {
        const data = await res.json();
        setSubmissions((prev) => [...prev, ...data.submissions]);
        setSubmissionsPage(nextPage);
        setHasMoreSubmissions(
          data.pagination?.hasMore ?? data.submissions.length === 20
        );
      }
    } catch {
      // non-critical
    } finally {
      setLoadingMore(false);
    }
  }, [formId, submissionsPage, loadingMore, hasMoreSubmissions]);

  const fetchChartData = useCallback(async () => {
    setChartLoading(true);
    try {
      const res = await fetch(
        `/api/v1/forms/${formId}/stats/submissions?period=${chartPeriod}`
      );
      if (res.ok) {
        const data = await res.json();
        setChartData(data.chartData || []);
      }
    } catch {
      // non-critical
    } finally {
      setChartLoading(false);
    }
  }, [formId, chartPeriod]);

  // Initial fetch
  useEffect(() => {
    Promise.all([fetchSubmissions(), fetchChartData()]).finally(() =>
      setLoading(false)
    );
  }, [fetchSubmissions, fetchChartData]);

  // Refetch chart when period changes
  useEffect(() => {
    if (!loading) {
      fetchChartData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartPeriod]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-75 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground text-lg font-semibold">
            Your form submissions
          </h2>
          <div className="bg-card border-border flex gap-1 rounded-lg border p-1">
            {['7d', '30d', '90d'].map((period) => {
              const periodLabels: Record<string, string> = {
                '7d': '7 Days',
                '30d': '30 Days',
                '90d': '90 Days',
              };
              return (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    chartPeriod === period
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {periodLabels[period] || period}
                </button>
              );
            })}
          </div>
        </div>

        {chartLoading ? (
          <Card>
            <CardContent className="py-8">
              <Skeleton className="h-75 w-full" />
            </CardContent>
          </Card>
        ) : (
          (() => {
            let daysLabel = '';
            if (chartPeriod === '7d') {
              daysLabel = '7';
            } else if (chartPeriod === '30d') {
              daysLabel = '30';
            } else {
              daysLabel = '90';
            }
            return (
              <SubmissionsChart
                data={chartData}
                title={`Submissions (Last ${daysLabel} Days)`}
              />
            );
          })()
        )}
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button className="text-foreground border-primary flex items-center gap-2 border-b-2 px-3 py-1.5 text-sm font-medium">
            <Inbox className="h-4 w-4" />
            Inbox ({submissions.length})
          </button>
        </div>

        {submissions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Inbox className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="text-foreground text-lg font-semibold">
                No submissions yet
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Submit your first form to see data here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {submissions.map((sub) => {
              const entries = Object.entries(sub.data);
              const emailField = entries.find(([key]) =>
                key.toLowerCase().includes('email')
              );
              const primaryField = emailField || entries[0];

              return (
                <Card
                  key={sub._id}
                  className="hover:border-border/80 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="min-w-0 flex-1">
                          {primaryField && (
                            <p className="text-foreground truncate text-sm font-medium">
                              {primaryField[0]}: {String(primaryField[1] ?? '')}
                            </p>
                          )}
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {new Date(sub.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Load More Button */}
            {hasMoreSubmissions && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMoreSubmissions}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

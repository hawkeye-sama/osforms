'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PlanInfoCardProps {
  plan: {
    name: string;
    submissionsUsed: number;
    submissionsLimit: number;
    formsUsed: number;
    formsLimit: number;
  };
}

const SUBMISSION_LIMIT = 100;

export function PlanInfoCard({ plan }: PlanInfoCardProps) {
  const submissionPercentage = Math.min(
    (plan.submissionsUsed / SUBMISSION_LIMIT) * 100,
    100
  );
  const formsPercentage = Math.min(
    (plan.formsUsed / plan.formsLimit) * 100,
    100
  );

  const isNearLimit = submissionPercentage >= 80;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-base font-semibold">
            Your Plan
          </CardTitle>
          <Badge variant="outline" className="font-medium">
            {plan.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Submissions usage */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Submissions</span>
            <span className="text-foreground font-medium">
              {plan.submissionsUsed?.toLocaleString()} /{' '}
              {SUBMISSION_LIMIT.toLocaleString()}
            </span>
          </div>
          <div className="bg-secondary h-2 overflow-hidden rounded-full">
            <div
              className={`h-full transition-all ${
                isNearLimit ? 'bg-destructive' : 'bg-primary'
              }`}
              style={{ width: `${submissionPercentage}%` }}
            />
          </div>
          {isNearLimit && (
            <p className="text-destructive mt-1 text-xs">
              Approaching monthly limit
            </p>
          )}
        </div>

        {/* Forms usage */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Forms</span>
            <span className="text-foreground font-medium">
              {plan.formsUsed} / {plan.formsLimit}
            </span>
          </div>
          <div className="bg-secondary h-2 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${formsPercentage}%` }}
            />
          </div>
        </div>

        {/* Free plan info */}
        <p className="text-muted-foreground pt-2 text-center text-xs">
          FreeForms is free with 100 submissions/month
        </p>
      </CardContent>
    </Card>
  );
}

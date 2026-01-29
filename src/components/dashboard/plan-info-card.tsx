"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlanInfoCardProps {
  plan: {
    name: string;
    submissionsUsed: number;
    submissionsLimit: number;
    formsUsed: number;
    formsLimit: number;
  };
}

export function PlanInfoCard({ plan }: PlanInfoCardProps) {
  const submissionPercentage = Math.min(
    (plan.submissionsUsed / plan.submissionsLimit) * 100,
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
          <CardTitle className="text-base font-semibold text-foreground">Your Plan</CardTitle>
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
            <span className="font-medium text-foreground">
              {plan.submissionsUsed.toLocaleString()} /{" "}
              {plan.submissionsLimit.toLocaleString()}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full transition-all ${
                isNearLimit ? "bg-destructive" : "bg-primary"
              }`}
              style={{ width: `${submissionPercentage}%` }}
            />
          </div>
          {isNearLimit && (
            <p className="mt-1 text-xs text-destructive">
              Approaching monthly limit
            </p>
          )}
        </div>

        {/* Forms usage */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Forms</span>
            <span className="font-medium text-foreground">
              {plan.formsUsed} / {plan.formsLimit}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${formsPercentage}%` }}
            />
          </div>
        </div>

        {/* Free plan info */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          FreeForms is free with 200 submissions/month
        </p>
      </CardContent>
    </Card>
  );
}

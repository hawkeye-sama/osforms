"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
          <CardTitle className="text-base font-semibold">Your Plan</CardTitle>
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
            <span className="font-medium">
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
            <span className="font-medium">
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

        {/* Upgrade CTA */}
        {plan.name === "Free" && (
          <Button className="w-full" asChild>
            <Link href="/dashboard/billing">
              <Zap className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

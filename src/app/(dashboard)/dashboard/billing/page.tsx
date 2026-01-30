"use client";

import { Clock, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Coming Soon</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              FreeForms is currently free to use with 100 submissions per month.
              Billing features and paid plans will be available in the future.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Plan Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-foreground">Current Plan</CardTitle>
            <Badge variant="secondary">Free</Badge>
          </div>
          <CardDescription>Your current plan details</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-foreground">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              100 submissions per month
            </li>
            <li className="flex items-center gap-2 text-sm text-foreground">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              Up to 10 forms
            </li>
            <li className="flex items-center gap-2 text-sm text-foreground">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              All integrations included (BYOK)
            </li>
            <li className="flex items-center gap-2 text-sm text-foreground">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              Email notifications via Resend
            </li>
            <li className="flex items-center gap-2 text-sm text-foreground">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              Webhook support
            </li>
            <li className="flex items-center gap-2 text-sm text-foreground">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              Community support
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { Check, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          Billing
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-secondary mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Clock className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-foreground text-xl font-semibold">
              Coming Soon
            </h3>
            <p className="text-muted-foreground mt-2 max-w-md text-sm">
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
            <CardTitle className="text-foreground text-lg">
              Current Plan
            </CardTitle>
            <Badge variant="secondary">Free</Badge>
          </div>
          <CardDescription>Your current plan details</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="text-foreground flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 shrink-0 text-green-500" />
              100 submissions per month
            </li>
            <li className="text-foreground flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 shrink-0 text-green-500" />
              Up to 10 forms
            </li>
            <li className="text-foreground flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 shrink-0 text-green-500" />
              All integrations included (BYOK)
            </li>
            <li className="text-foreground flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 shrink-0 text-green-500" />
              Email notifications via Resend
            </li>
            <li className="text-foreground flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 shrink-0 text-green-500" />
              Webhook support
            </li>
            <li className="text-foreground flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 shrink-0 text-green-500" />
              Community support
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for side projects and testing",
    features: [
      "200 submissions/month",
      "10 forms",
      "All integrations included",
      "BYOK (Bring Your Own Keys)",
      "Community support",
    ],
    current: true,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For professionals and growing teams",
    features: [
      "10,000 submissions/month",
      "Unlimited forms",
      "All integrations included",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
    ],
    current: false,
    popular: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/month",
    description: "For teams that need more power",
    features: [
      "50,000 submissions/month",
      "Unlimited forms",
      "All integrations included",
      "Dedicated support",
      "Team collaboration",
      "API access",
      "Custom webhooks",
    ],
    current: false,
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Plan</CardTitle>
          <CardDescription>You are currently on the Free plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">Free</span>
                <Badge variant="secondary">Current</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                200 submissions/month, 10 forms
              </p>
            </div>
            <Button variant="outline">
              <Zap className="mr-2 h-4 w-4" />
              Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative",
                plan.popular && "border-primary"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {plan.current && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                </CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6"
                  variant={plan.current ? "outline" : "default"}
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing History</CardTitle>
          <CardDescription>View your past invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No billing history yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your invoices will appear here when you upgrade to a paid plan
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

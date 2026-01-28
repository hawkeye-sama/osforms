"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/nav";

interface User {
  _id: string;
  name: string;
  email: string;
  onboardingComplete: boolean;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);

        // Redirect to onboarding if not complete (unless already there)
        if (!data.user.onboardingComplete && pathname !== "/onboarding") {
          router.push("/onboarding");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="dark flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  // Onboarding page gets a clean layout (no nav)
  if (pathname === "/onboarding") {
    return <div className="dark">{children}</div>;
  }

  return (
    <div className="dark min-h-screen bg-background">
      <DashboardNav user={user} />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

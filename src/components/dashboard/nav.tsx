"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavProps {
  user: { name: string; email: string };
}

export function DashboardNav({ user }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">
            FreeForms
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/dashboard"
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-muted-foreground">
            {user.email}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

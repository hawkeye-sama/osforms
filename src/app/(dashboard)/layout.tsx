'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { MobileNav } from '@/components/dashboard/mobile-nav';
import { Navbar } from '@/components/dashboard/navbar';
import { Sidebar } from '@/components/dashboard/sidebar';

interface User {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setUser(data.user);

        // Check if email is verified (unless on verify-email page)
        if (
          !data.user.isVerified &&
          pathname !== '/verify-email' &&
          !pathname.startsWith('/verify-email')
        ) {
          router.push(
            `/verify-email?email=${encodeURIComponent(data.user.email)}`
          );
          return;
        }

        // Redirect to onboarding if not complete (unless already there)
        if (!data.user.onboardingComplete && pathname !== '/onboarding') {
          router.push('/onboarding');
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router, pathname]);

  const handleMobileMenuToggle = useCallback(() => {
    setMobileNavOpen((prev) => !prev);
  }, []);

  if (loading) {
    return (
      <div className="dark bg-background flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Onboarding page gets a clean layout (no nav)
  if (pathname === '/onboarding') {
    return <div className="dark">{children}</div>;
  }

  return (
    <div className="dark bg-background min-h-screen">
      {/* Sidebar - hidden on mobile */}
      <Sidebar className="hidden lg:flex" />

      {/* Main content area - offset for sidebar on desktop */}
      <div className="lg:ml-60">
        {/* Top navbar */}
        <Navbar user={user} onMobileMenuToggle={handleMobileMenuToggle} />

        {/* Page content */}
        <main className="px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>

      {/* Mobile nav drawer */}
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </div>
  );
}

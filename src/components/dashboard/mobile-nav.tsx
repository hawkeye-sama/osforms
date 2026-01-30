'use client';

import { FileText, LayoutDashboard, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    href: '/dashboard/forms',
    icon: FileText,
    label: 'Forms',
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Account Settings',
  },
];

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="bg-background/80 fixed inset-0 z-50 backdrop-blur-sm lg:hidden"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          'bg-card fixed top-0 left-0 z-50 h-full w-70 border-r shadow-lg lg:hidden',
          'animate-in slide-in-from-left duration-300'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link
            href="/dashboard"
            className="text-foreground text-xl font-bold tracking-tight"
            onClick={() => onOpenChange(false)}
          >
            OSForms
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <p className="text-muted-foreground text-xs">OSForms v1.0</p>
        </div>
      </div>
    </>
  );
}

'use client';

import { FileText, LayoutDashboard, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
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

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'bg-card fixed top-0 left-0 z-40 flex h-screen w-60 flex-col border-r',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-fit w-full items-center border-b bg-black">
        <Link href="/dashboard">
          <Image
            src="/logo-full.svg"
            alt="OSForms"
            width={200}
            height={200}
            className="h-20 w-auto"
          />
        </Link>
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
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
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
    </aside>
  );
}

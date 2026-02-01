'use client';

import { ChevronDown, LogOut, Menu, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  user: { name: string; email: string };
  onMobileMenuToggle: () => void;
}

export function Navbar({ user, onMobileMenuToggle }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Logged out');
    router.push('/login');
  }

  return (
    <header className="bg-card/95 supports-backdrop-filter:bg-card/60 sticky top-0 z-30 w-full border-b backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left side - Mobile menu + Logo (mobile only) */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground lg:hidden"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link
            href="/dashboard"
            className="text-foreground text-xl font-bold tracking-tight lg:hidden"
          >
            OSForms
          </Link>
        </div>

        {/* Center - Empty for clean look */}
        <div className="flex-1" />

        {/* Right side - GitHub + Account dropdown */}
        <div className="flex items-center gap-2">
          {/* GitHub Link */}
          {/* <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:text-foreground"
            asChild
          >
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button> */}

          {/* Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hover:bg-secondary flex items-center gap-2 px-2"
              >
                <div className="bg-primary text-primary-foreground border-border flex h-8 w-8 items-center justify-center rounded-full border">
                  <User className="h-4 w-4" />
                </div>
                <ChevronDown className="text-foreground h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-foreground text-sm leading-none font-medium">
                    {user.name || 'User'}
                  </p>
                  <p className="text-muted-foreground text-xs leading-none">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

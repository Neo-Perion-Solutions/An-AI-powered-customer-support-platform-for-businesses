'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, Building2, Users, Shield, Bell, CreditCard } from 'lucide-react';

const ITEMS = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/organization', label: 'Organization', icon: Building2 },
  { href: '/settings/team', label: 'Team', icon: Users },
  { href: '/settings/security', label: 'Security', icon: Shield },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/billing', label: 'Payment methods', icon: CreditCard },
];

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex gap-6 p-6">
      <aside className="hidden w-56 shrink-0 md:block">
        <nav className="space-y-1">
          {ITEMS.map((i) => {
            const active = pathname.startsWith(i.href);
            return (
              <Link
                key={i.href}
                href={i.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <i.icon className="h-4 w-4" />
                {i.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
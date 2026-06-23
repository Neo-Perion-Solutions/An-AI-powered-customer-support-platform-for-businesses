'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Bot,
  BookOpen,
  Ticket,
  Users,
  MessageCircle,
  BarChart3,
  CreditCard,
  Settings,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inbox', label: 'Inbox', icon: Inbox, badge: 3 },
  { href: '/chatbot', label: 'AI Chatbot', icon: Bot },
  { href: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
  { href: '/tickets', label: 'Tickets', icon: Ticket },
  { href: '/agents', label: 'Agents', icon: Users },
  { href: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/settings/profile', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2 border-b px-5 font-bold">
        <Sparkles className="h-5 w-5 text-primary" />
        <span>Neo Support AI</span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {item.badge ? (
                <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="rounded-md border bg-gradient-to-br from-primary/10 to-purple-600/10 p-3 text-sm">
          <p className="font-semibold">Upgrade to Pro</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Unlock unlimited AI replies, advanced analytics and more.
          </p>
          <Link
            href="/billing/subscription"
            className="mt-2 inline-block rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Upgrade
          </Link>
        </div>
      </div>
    </aside>
  );
}
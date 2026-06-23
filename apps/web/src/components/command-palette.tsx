'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';

const ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, group: 'Navigation' },
  { label: 'Inbox', href: '/inbox', icon: Inbox, group: 'Navigation' },
  { label: 'AI Chatbot', href: '/chatbot', icon: Bot, group: 'Navigation' },
  { label: 'Knowledge Base', href: '/knowledge', icon: BookOpen, group: 'Navigation' },
  { label: 'Tickets', href: '/tickets', icon: Ticket, group: 'Navigation' },
  { label: 'Agents', href: '/agents', icon: Users, group: 'Navigation' },
  { label: 'WhatsApp', href: '/whatsapp', icon: MessageCircle, group: 'Navigation' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, group: 'Navigation' },
  { label: 'Billing', href: '/billing', icon: CreditCard, group: 'Navigation' },
  { label: 'Settings', href: '/settings/profile', icon: Settings, group: 'Navigation' },
];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  if (!mounted) return null;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => {
                router.push(item.href);
                onOpenChange(false);
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
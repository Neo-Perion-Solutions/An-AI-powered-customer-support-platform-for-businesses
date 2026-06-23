'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Search, Filter, Inbox as InboxIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { ErrorState } from '@/components/error-state';
import { useConversations } from '@/hooks/use-conversations';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { Conversation } from '@/types/api';

const STATUS_OPTIONS = ['all', 'open', 'pending', 'resolved', 'closed'] as const;
const CHANNEL_OPTIONS = ['all', 'web', 'email', 'whatsapp', 'sms'] as const;

export default function InboxPage() {
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('all');
  const [channel, setChannel] = useState<(typeof CHANNEL_OPTIONS)[number]>('all');
  const [q, setQ] = useState('');
  const { data, isLoading, isError, refetch } = useConversations({
    status: status === 'all' ? undefined : status,
    channel: channel === 'all' ? undefined : channel,
  });

  const items = useMemo(() => {
    const list = data?.items ?? [];
    if (!q) return list;
    const lower = q.toLowerCase();
    return list.filter(
      (c) => c.customerName.toLowerCase().includes(lower) || c.subject.toLowerCase().includes(lower)
    );
  }, [data, q]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex w-full max-w-md flex-col border-r">
        <div className="space-y-3 border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Inbox</h1>
            <Button size="sm">New</Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s === 'all' ? 'All statuses' : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={channel} onValueChange={(v) => setChannel(v as typeof channel)}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Channel" /></SelectTrigger>
              <SelectContent>
                {CHANNEL_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c === 'all' ? 'All channels' : c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : items.length === 0 ? (
            <EmptyState title="No conversations" description="When customers reach out, they'll show up here." />
          ) : (
            <div className="divide-y">
              {items.map((c) => (
                <ConversationRow key={c.id} conversation={c} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center md:flex">
        <EmptyState
          icon={<InboxIcon className="h-6 w-6" />}
          title="Select a conversation"
          description="Pick a conversation from the list to view its details and reply."
        />
      </div>
    </div>
  );
}

function ConversationRow({ conversation: c }: { conversation: Conversation }) {
  return (
    <Link
      href={`/inbox/${c.id}`}
      className={cn('flex items-start gap-3 p-4 hover:bg-accent transition-colors', c.unread > 0 && 'bg-primary/5')}
    >
      <Avatar name={c.customerName} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn('truncate text-sm', c.unread > 0 ? 'font-semibold' : 'font-medium')}>{c.customerName}</p>
          <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(c.lastMessageAt)}</span>
        </div>
        <p className="truncate text-sm text-muted-foreground">{c.subject}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{c.preview}</p>
        <div className="mt-2 flex items-center gap-1">
          <Badge variant="outline" className="text-xs capitalize">{c.channel}</Badge>
          <Badge variant={c.status === 'open' ? 'info' : 'secondary'} className="text-xs capitalize">{c.status}</Badge>
          {c.unread > 0 && <Badge variant="default" className="text-xs">{c.unread} new</Badge>}
        </div>
      </div>
    </Link>
  );
}
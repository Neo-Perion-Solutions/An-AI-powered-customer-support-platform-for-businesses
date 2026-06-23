'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MoreVertical, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ChatWindow } from '@/components/chat-window';
import { LoadingState } from '@/components/loading-state';
import { ErrorState } from '@/components/error-state';
import { useConversation } from '@/hooks/use-conversations';

export default function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: conversation, isLoading, isError, refetch } = useConversation(id);

  if (isLoading) return <LoadingState />;
  if (isError || !conversation) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b bg-card px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="md:hidden">
              <Link href="/inbox"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <Avatar name={conversation.customerName} size="md" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{conversation.customerName}</p>
              <p className="truncate text-xs text-muted-foreground">{conversation.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">{conversation.channel}</Badge>
            <Badge variant="info" className="capitalize">{conversation.status}</Badge>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </div>
        </header>
        <ChatWindow conversationId={conversation.id} customerName={conversation.customerName} />
      </div>

      <aside className="hidden w-80 shrink-0 border-l lg:block">
        <div className="space-y-4 p-4">
          <div className="text-center">
            <Avatar name={conversation.customerName} size="xl" className="mx-auto" />
            <h3 className="mt-3 font-semibold">{conversation.customerName}</h3>
            <p className="text-xs text-muted-foreground">Customer</p>
          </div>
          <Separator />
          <div className="space-y-2 text-sm">
            <Row icon={<Mail className="h-4 w-4" />} label="Email" value={conversation.customerEmail ?? '—'} />
            <Row icon={<Phone className="h-4 w-4" />} label="Phone" value="—" />
            <Row icon={<UserIcon className="h-4 w-4" />} label="Channel" value={conversation.channel} />
          </div>
          <Separator />
          <div>
            <h4 className="mb-2 text-sm font-semibold">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {(conversation.tags ?? ['vip', 'billing']).map((t) => (
                <Badge key={t} variant="secondary">{t}</Badge>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Button className="w-full" variant="outline">Add note</Button>
            <Button className="w-full" variant="outline">Resolve</Button>
            <Button className="w-full" variant="destructive">Escalate</Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate">{value}</p>
      </div>
    </div>
  );
}
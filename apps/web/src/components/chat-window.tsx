'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useMessages, useSendMessage } from '@/hooks/use-conversations';
import type { Message } from '@/types/api';

interface ChatWindowProps {
  conversationId: string;
  customerName?: string;
}

export function ChatWindow({ conversationId, customerName }: ChatWindowProps) {
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const send = useSendMessage(conversationId);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const onSend = () => {
    const content = draft.trim();
    if (!content) return;
    send.mutate(content, {
      onSuccess: () => setDraft(''),
    });
  };

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-12">
              No messages yet — say hello!
            </div>
          ) : (
            messages.map((m: Message) => <MessageBubble key={m.id} message={m} />)
          )}
        </div>
      </ScrollArea>
      <div className="border-t bg-background p-3">
        <div className="flex items-end gap-2 rounded-md border bg-card p-2">
          <Button size="icon" variant="ghost" aria-label="Attach">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={`Reply to ${customerName ?? 'customer'}...`}
            className="min-h-[36px] flex-1 resize-none border-0 shadow-none focus-visible:ring-0"
            rows={1}
          />
          <Button size="icon" variant="ghost" aria-label="Emoji">
            <Smile className="h-4 w-4" />
          </Button>
          <Button onClick={onSend} disabled={!draft.trim() || send.isPending} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isAgent = message.senderType !== 'customer';
  return (
    <div className={cn('flex gap-2', isAgent && 'flex-row-reverse')}>
      <Avatar name={message.senderName} size="sm" />
      <div className={cn('max-w-[70%] space-y-1', isAgent && 'items-end flex flex-col')}>
        <div
          className={cn(
            'rounded-lg px-3 py-2 text-sm',
            isAgent
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          {message.senderType === 'bot' && (
            <span className="mr-1 text-xs font-semibold opacity-80">AI</span>
          )}
          {message.content}
        </div>
        <span className="text-xs text-muted-foreground">{formatRelativeTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
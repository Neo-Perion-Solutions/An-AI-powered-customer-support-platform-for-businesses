'use client';

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  text: string;
  from: 'bot' | 'user';
}

const INITIAL: ChatMessage[] = [
  { id: '1', text: "Hi! I'm your AI assistant. How can I help today?", from: 'bot' },
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL);
  const [draft, setDraft] = useState('');

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { id: String(Date.now()), text, from: 'user' }]);
    setDraft('');
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: String(Date.now() + 1), text: "Thanks — an agent will follow up shortly.", from: 'bot' },
      ]);
    }, 700);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="flex h-[480px] w-[360px] flex-col overflow-hidden rounded-xl border bg-card shadow-2xl">
          <div className="flex items-center justify-between bg-primary p-3 text-primary-foreground">
            <div>
              <p className="font-semibold text-sm">Chat with us</p>
              <p className="text-xs opacity-80">We typically reply in a few minutes</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-primary-foreground hover:bg-primary/80"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                  m.from === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t p-3">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type a message..."
            />
            <Button size="icon" onClick={send} disabled={!draft.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="xl"
          className="rounded-full shadow-2xl h-14 w-14"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
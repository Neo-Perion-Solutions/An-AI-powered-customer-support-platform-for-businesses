'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Ticket } from '@/types/api';

const COLUMNS: { id: Ticket['status']; title: string; color: string }[] = [
  { id: 'open', title: 'Open', color: 'bg-blue-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-amber-500' },
  { id: 'waiting', title: 'Waiting', color: 'bg-purple-500' },
  { id: 'resolved', title: 'Resolved', color: 'bg-green-500' },
];

interface KanbanBoardProps {
  tickets: Ticket[];
  onMove?: (ticketId: string, status: Ticket['status']) => void;
  onSelect?: (ticketId: string) => void;
}

export function KanbanBoard({ tickets, onMove, onSelect }: KanbanBoardProps) {
  const [dragId, setDragId] = useState<string | null>(null);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {COLUMNS.map((col) => {
        const items = tickets.filter((t) => t.status === col.id);
        return (
          <div
            key={col.id}
            className="flex flex-col rounded-lg bg-muted/40 p-3 min-h-[400px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) onMove?.(dragId, col.id);
              setDragId(null);
            }}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', col.color)} />
                <h3 className="text-sm font-semibold">{col.title}</h3>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              {items.map((t) => (
                <Card
                  key={t.id}
                  draggable
                  onDragStart={() => setDragId(t.id)}
                  onClick={() => onSelect?.(t.id)}
                  className="cursor-pointer p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-muted-foreground">#{t.number}</span>
                    <Badge variant={t.priority === 'urgent' ? 'destructive' : 'outline'} className="text-xs">
                      {t.priority}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{t.subject}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Avatar name={t.assigneeName ?? 'Unassigned'} size="sm" />
                      <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                        {t.assigneeName ?? 'Unassigned'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(t.updatedAt)}
                    </span>
                  </div>
                </Card>
              ))}
              {items.length === 0 && (
                <div className="rounded border-2 border-dashed py-8 text-center text-xs text-muted-foreground">
                  Drop tickets here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
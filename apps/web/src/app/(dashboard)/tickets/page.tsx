'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from '@/components/kanban-board';
import { LoadingState } from '@/components/loading-state';
import { useTickets, useUpdateTicket } from '@/hooks/use-tickets';
import type { Ticket } from '@/types/api';

const MOCK_TICKETS: Ticket[] = [
  { id: 't1', number: 1001, subject: 'Cannot login to dashboard', description: '', status: 'open', priority: 'high', assigneeName: 'Alice', customerId: 'c1', customerName: 'Acme Co', tags: ['login'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 't2', number: 1002, subject: 'Billing question about invoice', description: '', status: 'in_progress', priority: 'medium', assigneeName: 'Bob', customerId: 'c2', customerName: 'Globex', tags: ['billing'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 't3', number: 1003, subject: 'Feature request: dark mode', description: '', status: 'waiting', priority: 'low', customerId: 'c3', customerName: 'Initech', tags: ['feature'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 't4', number: 1004, subject: 'Integration with Slack', description: '', status: 'resolved', priority: 'medium', assigneeName: 'Carol', customerId: 'c4', customerName: 'Hooli', tags: ['integration'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 't5', number: 1005, subject: 'Payment failed error', description: '', status: 'open', priority: 'urgent', customerId: 'c5', customerName: 'Pied Piper', tags: ['billing', 'urgent'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export default function TicketsPage() {
  const router = useRouter();
  const update = useUpdateTicket('');

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">Drag tickets across columns to update status.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> New ticket</Button>
      </div>

      <KanbanBoard
        tickets={MOCK_TICKETS}
        onMove={(id, status) => update.mutate({ status } as Partial<Ticket>)}
        onSelect={(id) => router.push(`/tickets/${id}`)}
      />
    </div>
  );
}
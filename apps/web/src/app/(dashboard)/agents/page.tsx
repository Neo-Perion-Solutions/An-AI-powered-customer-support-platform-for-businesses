'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useAgents, useUpdateAgentStatus } from '@/hooks/use-agents';
import { useToast } from '@/hooks/use-toast';
import type { Agent } from '@/types/api';

const STATUS_COLOR: Record<Agent['status'], string> = {
  online: 'bg-green-500',
  away: 'bg-amber-500',
  offline: 'bg-gray-400',
};

export default function AgentsPage() {
  const { data: agents = [] } = useAgents();
  const update = useUpdateAgentStatus();
  const toast = useToast();
  const [filter, setFilter] = useState<'all' | Agent['status']>('all');

  const filtered = filter === 'all' ? agents : agents.filter((a) => a.status === filter);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">Team performance and availability.</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All agents</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="away">Away</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
          <Button>Invite agent</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <Card key={a.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar name={a.name} size="lg" />
                  <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${STATUS_COLOR[a.status]}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{a.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.email}</p>
                  <Badge variant="outline" className="mt-1 capitalize">{a.status}</Badge>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Stat label="Active" value={a.activeConversations} />
                <Stat label="Resolved" value={a.resolvedToday} />
                <Stat label="CSAT" value={a.csat.toFixed(1)} />
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={async () => {
                  const next: Agent['status'] = a.status === 'online' ? 'away' : 'online';
                  await update.mutateAsync(next);
                  toast.success(`Status set to ${next}`);
                }}
              >
                Set {a.status === 'online' ? 'away' : 'online'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md bg-muted/40 p-2">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
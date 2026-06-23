'use client';

import { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ChartWrapper } from '@/components/chart-wrapper';
import { KpiCard } from '@/components/kpi-card';
import { useAnalyticsOverview, useConversationsByChannel, useConversationsOverTime, useResponseTimeTrend, useTicketsByStatus } from '@/hooks/use-analytics';

export default function AnalyticsPage() {
  const [range, setRange] = useState('7d');
  const overview = useAnalyticsOverview(range);
  const overTime = useConversationsOverTime(range);
  const byStatus = useTicketsByStatus();
  const byChannel = useConversationsByChannel();
  const resp = useResponseTimeTrend(range);

  const exportCsv = () => {
    const rows = [['Date', 'Conversations']];
    (overTime.data ?? []).forEach((p) => rows.push([p.date, String(p.value)]));
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${range}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Performance insights across all channels.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Conversations" value={overview.data?.conversations ?? 0} delta={12.4} />
        <KpiCard label="AI Resolution" value={`${(overview.data?.aiResolutionRate ?? 64).toFixed(0)}%`} delta={3.1} />
        <KpiCard label="CSAT" value={`${(overview.data?.csat ?? 4.6).toFixed(1)}/5`} delta={1.8} />
        <KpiCard label="ROI" value={`$${(overview.data?.roi ?? 24500).toLocaleString()}`} delta={22.6} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversations over time</CardTitle>
            <CardDescription>Daily volume trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartWrapper type="line" data={overTime.data ?? []} dataKey="value" xKey="date" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets by status</CardTitle>
            <CardDescription>Current open workload</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartWrapper
              type="bar"
              data={(byStatus.data ?? []).map((d) => ({ date: d.status, value: d.count }))}
              dataKey="value"
              xKey="date"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversations by channel</CardTitle>
            <CardDescription>Distribution of inbound traffic</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartWrapper
              type="pie"
              data={(byChannel.data ?? []).map((d) => ({ name: d.channel, value: d.count }))}
              dataKey="value"
              xKey="name"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response time trend</CardTitle>
            <CardDescription>Average time to first reply</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartWrapper type="area" data={resp.data ?? []} dataKey="value" xKey="date" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
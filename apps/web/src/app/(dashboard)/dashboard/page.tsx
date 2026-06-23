'use client';

import Link from 'next/link';
import { MessageCircle, Sparkles, Smile, TrendingUp, ArrowRight, Plus, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/kpi-card';
import { ChartWrapper } from '@/components/chart-wrapper';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import { useAnalyticsOverview } from '@/hooks/use-analytics';
import { useConversations } from '@/hooks/use-conversations';

const QUICK_ACTIONS = [
  { label: 'New conversation', href: '/inbox', icon: MessageCircle },
  { label: 'Train chatbot', href: '/chatbot', icon: Sparkles },
  { label: 'Upload knowledge', href: '/knowledge/upload', icon: Plus },
  { label: 'View analytics', href: '/analytics', icon: TrendingUp },
];

export default function DashboardPage() {
  const { data: analytics } = useAnalyticsOverview('7d');
  const { data: conv = [] } = useConversations({ status: 'open' });

  const chartData = Array.from({ length: 7 }).map((_, i) => ({
    date: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 100) + 50,
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back — here&apos;s what&apos;s happening today.</p>
        </div>
        <Button asChild>
          <Link href="/inbox">Open inbox <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Conversations" value={formatNumber(analytics?.conversations ?? 1284)} delta={12.4} icon={<MessageCircle className="h-4 w-4" />} sparkline={[10, 20, 15, 30, 25, 40, 35]} />
        <KpiCard label="AI Resolution Rate" value={`${(analytics?.aiResolutionRate ?? 64).toFixed(0)}%`} delta={3.1} icon={<Sparkles className="h-4 w-4" />} sparkline={[40, 45, 50, 55, 60, 62, 64]} />
        <KpiCard label="CSAT" value={`${(analytics?.csat ?? 4.6).toFixed(1)}/5`} delta={1.8} icon={<Smile className="h-4 w-4" />} sparkline={[4.2, 4.3, 4.4, 4.5, 4.5, 4.6, 4.6]} />
        <KpiCard label="ROI" value={`$${formatNumber(analytics?.roi ?? 24500)}`} delta={22.6} icon={<TrendingUp className="h-4 w-4" />} sparkline={[10, 15, 14, 20, 22, 24, 25]} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Conversations this week</CardTitle>
            <CardDescription>Daily volume across all channels</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartWrapper type="area" data={chartData} dataKey="value" xKey="date" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center justify-between rounded-md border bg-card p-3 text-sm hover:bg-accent transition-colors"
              >
                <span className="flex items-center gap-3">
                  <a.icon className="h-4 w-4 text-primary" />
                  {a.label}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest conversations needing attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conv.slice(0, 5).length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No active conversations</p>
              ) : (
                conv.slice(0, 5).map((c) => (
                  <Link
                    key={c.id}
                    href={`/inbox/${c.id}`}
                    className="flex items-center justify-between gap-3 rounded-md p-2 hover:bg-accent"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={c.customerName} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.customerName}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.subject}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(c.lastMessageAt)}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI performance</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Stat label="Auto-resolved" value="847" delta="+12%" />
            <Stat label="Avg response time" value="1.2s" delta="-8%" positive />
            <Stat label="Handoff rate" value="14%" delta="-2%" positive />
            <Stat label="Knowledge accuracy" value="92%" delta="+3%" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, delta, positive }: { label: string; value: string; delta: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-semibold">{value}</span>
        <Badge variant={positive ? 'success' : 'secondary'}>{delta}</Badge>
      </span>
    </div>
  );
}
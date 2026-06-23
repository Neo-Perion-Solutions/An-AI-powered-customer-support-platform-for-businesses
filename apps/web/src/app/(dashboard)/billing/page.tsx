'use client';

import Link from 'next/link';
import { Download, ArrowUpRight, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useInvoices, useSubscription } from '@/hooks/use-billing';
import { LoadingState } from '@/components/loading-state';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';

export default function BillingPage() {
  const { data: sub, isLoading } = useSubscription();
  const { data: invoices = [] } = useInvoices();

  if (isLoading || !sub) return <LoadingState />;

  const usagePct = (n: number, total: number) => Math.min(100, Math.round((n / total) * 100));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">Plan, usage and invoices.</p>
        </div>
        <Button asChild>
          <Link href="/billing/subscription">Manage plan <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current plan</CardTitle>
                <CardDescription>You&apos;re on the {sub.plan.name} plan.</CardDescription>
              </div>
              <Badge variant={sub.status === 'active' ? 'success' : 'destructive'}>{sub.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <UsageRow label="Conversations" used={sub.usage.conversations} total={sub.limits.conversations} pct={usagePct(sub.usage.conversations, sub.limits.conversations)} />
              <UsageRow label="AI replies" used={sub.usage.aiReplies} total={sub.limits.aiReplies} pct={usagePct(sub.usage.aiReplies, sub.limits.aiReplies)} />
              <UsageRow label="Storage" used={sub.usage.storageGb} total={sub.limits.storageGb} pct={usagePct(sub.usage.storageGb, sub.limits.storageGb)} suffix=" GB" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Next invoice</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(sub.plan.price)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(sub.currentPeriodEnd, { dateStyle: 'medium' })}
            </p>
            <Button variant="outline" className="mt-4 w-full">
              <CreditCard className="mr-2 h-4 w-4" /> Update payment method
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No invoices yet</p>
          ) : (
            <div className="divide-y">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{inv.number}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(inv.date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatCurrency(inv.amount, inv.currency)}</span>
                    <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'pending' ? 'warning' : 'destructive'}>
                      {inv.status}
                    </Badge>
                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UsageRow({ label, used, total, pct, suffix = '' }: { label: string; used: number; total: number; pct: number; suffix?: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {formatNumber(used)}{suffix} / {formatNumber(total)}{suffix}
        </span>
      </div>
      <Progress value={pct} />
    </div>
  );
}
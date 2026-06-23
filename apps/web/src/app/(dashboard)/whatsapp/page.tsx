'use client';

import Link from 'next/link';
import { MessageCircle, Plus, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWhatsappAccounts } from '@/hooks/use-whatsapp';
import { formatNumber } from '@/lib/utils';
import type { WhatsAppAccount } from '@/types/api';

export default function WhatsappPage() {
  const { data: accounts = [] } = useWhatsappAccounts();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp</h1>
          <p className="text-muted-foreground">Connect accounts and run campaigns.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href="/whatsapp/campaigns">Campaigns</Link></Button>
          <Button><Plus className="mr-2 h-4 w-4" /> Connect account</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Connected accounts" value={accounts.length} />
        <SummaryCard title="Messages (24h)" value={formatNumber(accounts.reduce((s, a) => s + a.messagesLast24h, 0))} />
        <SummaryCard title="Delivery rate" value="98.4%" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>All WhatsApp Business accounts linked to your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No accounts connected yet.</p>
          ) : (
            <div className="space-y-3">
              {accounts.map((a) => (
                <AccountRow key={a.id} account={a} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: number | string }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle></CardHeader>
      <CardContent><p className="text-2xl font-bold">{value}</p></CardContent>
    </Card>
  );
}

function AccountRow({ account }: { account: WhatsAppAccount }) {
  const Icon = account.status === 'connected' ? CheckCircle2 : account.status === 'pending' ? Loader2 : AlertCircle;
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-green-100 p-2 text-green-600 dark:bg-green-900/30">
          <MessageCircle className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium">{account.displayName}</p>
          <p className="text-xs text-muted-foreground">{account.phoneNumber}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{formatNumber(account.messagesLast24h)} msgs/24h</span>
        <Badge variant={account.status === 'connected' ? 'success' : account.status === 'pending' ? 'warning' : 'destructive'} className="capitalize">
          <Icon className="mr-1 h-3 w-3" /> {account.status}
        </Badge>
        <Button variant="ghost" size="icon"><RefreshCw className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
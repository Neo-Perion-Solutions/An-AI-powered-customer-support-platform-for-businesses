'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Search, Users } from 'lucide-react';

const ORGS = [
  { id: '1', name: 'Acme Healthcare', slug: 'acme-healthcare', plan: 'PRO', members: 12, conversations: 1247, created: '2026-01-15' },
  { id: '2', name: 'BigCorp Inc', slug: 'bigcorp', plan: 'ENTERPRISE', members: 84, conversations: 12453, created: '2025-09-20' },
  { id: '3', name: 'StartupCo', slug: 'startupco', plan: 'STARTER', members: 4, conversations: 87, created: '2026-05-10' },
  { id: '4', name: 'Trial User', slug: 'trial', plan: 'FREE', members: 1, conversations: 0, created: '2026-06-22' },
];

const PLAN_COLORS = {
  FREE: 'bg-gray-100 text-gray-700',
  STARTER: 'bg-blue-100 text-blue-700',
  PRO: 'bg-purple-100 text-purple-700',
  ENTERPRISE: 'bg-amber-100 text-amber-700',
};

export default function AdminOrgsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Organizations</h1>
          <p className="text-sm text-muted-foreground">Manage all customer organizations.</p>
        </div>
        <Button>Add organization</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-semibold">{ORGS.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Paid</p><p className="text-2xl font-semibold">{ORGS.filter(o => o.plan !== 'FREE').length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Total members</p><p className="text-2xl font-semibold">{ORGS.reduce((s, o) => s + o.members, 0)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">MRR estimate</p><p className="text-2xl font-semibold">$7,469</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All organizations</CardTitle>
              <CardDescription>Search and manage customer accounts.</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search organizations..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ORGS.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-muted p-2"><Building2 className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-medium">{o.name}</p>
                    <p className="text-xs text-muted-foreground">/{o.slug} · created {o.created}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />{o.members} members</p>
                    <p className="text-xs text-muted-foreground">{o.conversations.toLocaleString()} conversations</p>
                  </div>
                  <Badge className={PLAN_COLORS[o.plan as keyof typeof PLAN_COLORS]}>{o.plan}</Badge>
                  <Button variant="ghost" size="sm">Manage</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

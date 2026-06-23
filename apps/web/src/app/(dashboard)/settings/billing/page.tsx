'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, Plus } from 'lucide-react';

const PAYMENT_METHODS = [
  { id: '1', brand: 'Visa', last4: '4242', expiry: '12/27', isDefault: true },
];

const INVOICES = [
  { id: 'inv_001', number: 'INV-2026-001', date: '2026-06-01', amount: 199, status: 'paid' },
  { id: 'inv_002', number: 'INV-2026-002', date: '2026-05-01', amount: 199, status: 'paid' },
  { id: 'inv_003', number: 'INV-2026-003', date: '2026-04-01', amount: 199, status: 'paid' },
];

export default function BillingSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing & Payments</h1>
        <p className="text-sm text-muted-foreground">Manage payment methods and view invoices.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4" />Payment methods</CardTitle>
              <CardDescription>Cards and payment options on file.</CardDescription>
            </div>
            <Button variant="outline" size="sm"><Plus className="mr-2 h-3.5 w-3.5" />Add method</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {PAYMENT_METHODS.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-3">
                <div className="rounded bg-muted px-3 py-1.5 text-xs font-medium">{m.brand}</div>
                <div>
                  <p className="text-sm font-medium">**** **** **** {m.last4}</p>
                  <p className="text-xs text-muted-foreground">Expires {m.expiry}</p>
                </div>
              </div>
              {m.isDefault && <Badge>Default</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Download past invoices for your records.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {INVOICES.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{inv.number}</p>
                  <p className="text-xs text-muted-foreground">{inv.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">${inv.amount}.00</span>
                  <Badge className="bg-green-100 text-green-700">{inv.status}</Badge>
                  <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

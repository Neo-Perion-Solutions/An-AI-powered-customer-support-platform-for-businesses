'use client';

import Link from 'next/link';
import { Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PLANS = [
  { name: 'Starter', price: 29, features: ['1 inbox channel', '500 AI replies/mo', '1 GB knowledge', 'Email support'] },
  { name: 'Pro', price: 99, popular: true, features: ['Unlimited channels', '5,000 AI replies/mo', '10 GB knowledge', 'Priority support', 'WhatsApp', 'Advanced analytics'] },
  { name: 'Enterprise', price: null, features: ['Unlimited everything', 'Dedicated CSM', 'SSO / SAML', '99.99% SLA', 'Audit logs', 'On-prem option'] },
];

export default function SubscriptionPage() {
  return (
    <div className="space-y-6 p-6">
      <Link href="/billing" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to billing
      </Link>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Choose a plan</h1>
        <p className="mt-2 text-muted-foreground">Upgrade or downgrade anytime.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {PLANS.map((p) => (
          <Card key={p.name} className={p.popular ? 'border-primary shadow-lg ring-1 ring-primary' : ''}>
            <CardContent className="pt-6 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-2xl font-bold">{p.name}</h2>
                {p.popular && <Badge>Popular</Badge>}
              </div>
              <div className="mt-2 mb-6">
                {p.price ? (
                  <span className="text-4xl font-bold">${p.price}<span className="text-base font-normal text-muted-foreground">/mo</span></span>
                ) : (
                  <span className="text-3xl font-bold">Custom</span>
                )}
              </div>
              <ul className="space-y-2 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" variant={p.popular ? 'default' : 'outline'}>
                {p.price ? `Upgrade to ${p.name}` : 'Contact sales'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
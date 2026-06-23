'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    desc: 'For small teams getting started',
    monthly: 29,
    yearly: 290,
    cta: 'Start free trial',
    features: [
      '1 inbox channel',
      '500 AI replies/mo',
      '1 GB knowledge base',
      'Email support',
      'Basic analytics',
    ],
  },
  {
    name: 'Pro',
    desc: 'For growing support teams',
    monthly: 99,
    yearly: 990,
    cta: 'Start free trial',
    popular: true,
    features: [
      'Unlimited channels',
      '5,000 AI replies/mo',
      '10 GB knowledge base',
      'Priority support',
      'Advanced analytics',
      'Custom chatbot branding',
      'WhatsApp integration',
    ],
  },
  {
    name: 'Enterprise',
    desc: 'For large organizations',
    monthly: null,
    yearly: null,
    cta: 'Contact sales',
    features: [
      'Unlimited everything',
      'Dedicated success manager',
      'SSO / SAML',
      '99.99% uptime SLA',
      'Custom integrations',
      'Audit logs',
      'On-premise deployment',
    ],
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Neo Support AI
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Choose your plan</h1>
        <p className="mt-4 text-muted-foreground text-lg">Start with a 14-day free trial. Upgrade anytime.</p>

        <div className="mt-10 inline-flex items-center gap-3 rounded-full border bg-card px-4 py-2">
          <span className={!yearly ? 'font-semibold' : 'text-muted-foreground'}>Monthly</span>
          <Switch checked={yearly} onCheckedChange={setYearly} aria-label="Toggle yearly" />
          <span className={yearly ? 'font-semibold' : 'text-muted-foreground'}>
            Yearly <Badge variant="secondary" className="ml-1">Save 20%</Badge>
          </span>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {PLANS.map((p) => (
            <Card key={p.name} className={`p-8 flex flex-col ${p.popular ? 'border-primary shadow-lg ring-1 ring-primary' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold">{p.name}</h3>
                {p.popular && <Badge>Most popular</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-6 mb-6">
                {p.monthly === null ? (
                  <div className="text-3xl font-bold">Custom</div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${yearly ? Math.round(p.yearly! / 12) : p.monthly}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                )}
                {yearly && p.monthly !== null && (
                  <p className="text-xs text-muted-foreground mt-1">Billed annually (${p.yearly})</p>
                )}
              </div>
              <Button asChild className="w-full mb-6" variant={p.popular ? 'default' : 'outline'}>
                <Link href={p.monthly === null ? '/register?plan=enterprise' : '/register'}>
                  {p.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <ul className="space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Neo Support AI
      </footer>
    </div>
  );
}
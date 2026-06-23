import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  MessageSquare,
  Bot,
  BookOpen,
  Ticket,
  Users,
  BarChart3,
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  Check,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Neo Support AI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="/pricing" className="hover:text-primary transition-colors">Plans</Link>
            <Link href="#faq" className="hover:text-primary transition-colors">FAQ</Link>
          </nav>
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

      <section className="relative mesh-bg overflow-hidden">
        <div className="container mx-auto px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-powered customer support
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl md:text-6xl font-bold tracking-tight">
            Resolve customers faster with <span className="gradient-text">AI that knows your business</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Omnichannel inbox, intelligent chatbot, knowledge base and analytics — built for modern support teams.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/register">
                Start free trial <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="h-4 w-4 text-primary" /> 14-day free trial</span>
            <span className="flex items-center gap-1"><Check className="h-4 w-4 text-primary" /> No credit card</span>
            <span className="flex items-center gap-1"><Check className="h-4 w-4 text-primary" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Everything you need to delight customers</h2>
          <p className="mt-4 text-muted-foreground">One platform, every channel, zero context switching.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: MessageSquare, title: 'Omnichannel inbox', desc: 'Email, WhatsApp, web chat and social — unified.' },
            { icon: Bot, title: 'AI chatbot', desc: 'Custom prompts, smart handoff, learning from your docs.' },
            { icon: BookOpen, title: 'Knowledge base', desc: 'Upload PDFs, scrape URLs, train FAQs in minutes.' },
            { icon: Ticket, title: 'Ticketing', desc: 'Kanban boards, SLA tracking, smart assignment.' },
            { icon: Users, title: 'Team collaboration', desc: 'Internal notes, mentions, shared inboxes.' },
            { icon: BarChart3, title: 'Real-time analytics', desc: 'CSAT, deflection, ROI — all in one dashboard.' },
            { icon: Shield, title: 'Enterprise security', desc: 'SOC2 ready, encryption at rest and in transit.' },
            { icon: Zap, title: 'Lightning fast', desc: 'Sub-second responses, 99.99% uptime SLA.' },
            { icon: Sparkles, title: 'Smart automations', desc: 'Auto-tagging, sentiment, escalation rules.' },
          ].map((f) => (
            <Card key={f.title} className="p-6 hover:shadow-lg transition-shadow">
              <f.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground mb-8">Start free. Scale as you grow.</p>
          <Button asChild size="lg">
            <Link href="/pricing">Compare plans <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <section id="faq" className="container mx-auto px-4 py-24 max-w-3xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Frequently asked questions</h2>
        <div className="space-y-4">
          {[
            { q: 'How does the AI chatbot work?', a: 'It uses your knowledge base, FAQs and conversation history to answer questions automatically. You can configure escalation rules and hand off to humans at any time.' },
            { q: 'Can I cancel anytime?', a: 'Yes — cancel from billing settings. No contracts, no fees.' },
            { q: 'Do you offer a free trial?', a: '14 days, full feature access, no credit card required.' },
            { q: 'Is my data secure?', a: 'AES-256 encryption at rest, TLS in transit, daily backups, GDPR compliant.' },
          ].map((f) => (
            <Card key={f.q} className="p-6">
              <h3 className="font-semibold mb-2">{f.q}</h3>
              <p className="text-sm text-muted-foreground">{f.a}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Sparkles className="h-5 w-5 text-primary" />
              Neo Support AI
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">Modern customer support, powered by AI.</p>
          </div>
          <div className="text-sm">
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="#features">Features</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="#faq">FAQ</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>About</li><li>Blog</li><li>Careers</li>
            </ul>
          </div>
          <div className="text-sm">
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Privacy</li><li>Terms</li><li>Security</li>
            </ul>
          </div>
        </div>
        <div className="border-t py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Neo Support AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
import Link from 'next/link';
import { Sparkles, MessageCircle, Zap, Shield } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between mesh-bg p-10 text-white">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl z-10">
          <Sparkles className="h-6 w-6" />
          Neo Support AI
        </Link>
        <div className="space-y-6 z-10">
          <h2 className="text-4xl font-bold leading-tight">
            AI support that <span className="gradient-text">actually understands</span> your business
          </h2>
          <p className="text-white/80 text-lg max-w-md">
            Train your chatbot on your docs, deflect 60% of tickets, and keep customers happy.
          </p>
          <div className="grid gap-4 max-w-md">
            {[
              { icon: MessageCircle, label: 'Omnichannel inbox' },
              { icon: Zap, label: 'Sub-second AI responses' },
              { icon: Shield, label: 'SOC2 / GDPR compliant' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 rounded-lg bg-white/10 backdrop-blur p-3 border border-white/20">
                <f.icon className="h-5 w-5" />
                <span className="text-sm">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/60 z-10">© {new Date().getFullYear()} Neo Support AI</p>
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
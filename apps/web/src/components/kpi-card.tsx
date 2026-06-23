'use client';

import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: number;
  icon?: React.ReactNode;
  sparkline?: number[];
  format?: (v: number) => string;
}

export function KpiCard({ label, value, delta, icon, sparkline, format }: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        {typeof delta === 'number' && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium',
              positive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {positive ? '+' : ''}
            {delta.toFixed(1)}%
          </span>
        )}
        {sparkline && sparkline.length > 0 && <Sparkline data={sparkline} />}
      </div>
    </Card>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-8 w-24 text-primary">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
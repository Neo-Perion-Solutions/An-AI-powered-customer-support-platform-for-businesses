'use client';

import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

interface ChartWrapperProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: unknown[];
  dataKey?: string;
  xKey?: string;
  height?: number;
}

export function ChartWrapper({ type, data, dataKey = 'value', xKey = 'date', height = 300 }: ChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      {type === 'line' ? (
        <LineChart data={data as Record<string, unknown>[]}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey={xKey} className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
          <Line type="monotone" dataKey={dataKey} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
        </LineChart>
      ) : type === 'bar' ? (
        <BarChart data={data as Record<string, unknown>[]}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey={xKey} className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
          <Bar dataKey={dataKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      ) : type === 'area' ? (
        <AreaChart data={data as Record<string, unknown>[]}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey={xKey} className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
          <Area type="monotone" dataKey={dataKey} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
        </AreaChart>
      ) : (
        <PieChart>
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
          <Legend />
          <Pie
            data={data as { name: string; value: number }[]}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {(data as unknown[]).map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      )}
    </ResponsiveContainer>
  );
}
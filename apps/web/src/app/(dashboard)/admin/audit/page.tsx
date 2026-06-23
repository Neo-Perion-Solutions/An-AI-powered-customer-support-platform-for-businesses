'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download } from 'lucide-react';

const AUDIT_LOGS = [
  { id: '1', user: 'Alice Admin', action: 'CREATE', entity: 'Ticket', entityId: 'tkt_1004', timestamp: '2026-06-23 14:32:11', ip: '192.168.1.1' },
  { id: '2', user: 'Bob Agent', action: 'UPDATE', entity: 'Conversation', entityId: 'cnv_abc123', timestamp: '2026-06-23 14:30:45', ip: '192.168.1.1' },
  { id: '3', user: 'Alice Admin', action: 'LOGIN', entity: 'User', entityId: 'usr_admin', timestamp: '2026-06-23 14:15:22', ip: '192.168.1.1' },
  { id: '4', user: 'Alice Admin', action: 'PERMISSION_CHANGE', entity: 'Role', entityId: 'role_agent', timestamp: '2026-06-23 13:45:00', ip: '192.168.1.1' },
  { id: '5', user: 'Bob Agent', action: 'EXPORT', entity: 'Conversation', entityId: 'cnv_xyz789', timestamp: '2026-06-23 12:20:11', ip: '192.168.1.1' },
  { id: '6', user: 'Alice Admin', action: 'DELETE', entity: 'KnowledgeSource', entityId: 'ks_old', timestamp: '2026-06-23 11:00:00', ip: '192.168.1.1' },
  { id: '7', user: 'Alice Admin', action: 'CREATE', entity: 'KnowledgeSource', entityId: 'ks_new', timestamp: '2026-06-23 10:55:00', ip: '192.168.1.1' },
  { id: '8', user: 'Charlie Customer', action: 'LOGIN', entity: 'User', entityId: 'usr_cust', timestamp: '2026-06-23 10:00:00', ip: '10.0.0.5' },
];

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-gray-100 text-gray-700',
  LOGOUT: 'bg-gray-100 text-gray-700',
  EXPORT: 'bg-amber-100 text-amber-700',
  IMPORT: 'bg-amber-100 text-amber-700',
  PERMISSION_CHANGE: 'bg-purple-100 text-purple-700',
};

export default function AdminAuditPage() {
  const [filter, setFilter] = useState('');
  const filtered = AUDIT_LOGS.filter((l) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return l.user.toLowerCase().includes(q) || l.entity.toLowerCase().includes(q) || l.action.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audit logs</h1>
          <p className="text-sm text-muted-foreground">Track all changes and actions across the system.</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent activity ({filtered.length})</CardTitle>
              <CardDescription>All actions are immutable and timestamped.</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search logs..." value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                  <th className="px-3 py-2">Timestamp</th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Entity</th>
                  <th className="px-3 py-2">IP</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="px-3 py-3 text-muted-foreground font-mono text-xs">{log.timestamp}</td>
                    <td className="px-3 py-3 font-medium">{log.user}</td>
                    <td className="px-3 py-3">
                      <Badge className={ACTION_COLORS[log.action]}>{log.action}</Badge>
                    </td>
                    <td className="px-3 py-3">{log.entity} · <span className="text-xs text-muted-foreground font-mono">{log.entityId}</span></td>
                    <td className="px-3 py-3 text-muted-foreground font-mono text-xs">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

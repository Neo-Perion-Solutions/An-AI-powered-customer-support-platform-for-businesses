'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Shield, Users } from 'lucide-react';

const ROLES = [
  { id: '1', name: 'OWNER', description: 'Full access to everything including billing.', members: 1, system: true },
  { id: '2', name: 'ADMIN', description: 'Manage organization, members, and all content.', members: 2, system: true },
  { id: '3', name: 'AGENT', description: 'Handle conversations, tickets, and customers.', members: 5, system: true },
  { id: '4', name: 'VIEWER', description: 'Read-only access to dashboards and reports.', members: 4, system: true },
  { id: '5', name: 'CUSTOM', description: 'Custom role with selected permissions.', members: 0, system: false },
];

const PERMISSIONS = [
  { category: 'Organization', items: [
    { key: 'org:read', label: 'View organization', enabled: true },
    { key: 'org:write', label: 'Edit organization', enabled: true },
  ]},
  { category: 'Users', items: [
    { key: 'user:read', label: 'View users', enabled: true },
    { key: 'user:write', label: 'Invite and edit users', enabled: true },
    { key: 'user:delete', label: 'Remove users', enabled: false },
  ]},
  { category: 'Conversations', items: [
    { key: 'conversation:read', label: 'View conversations', enabled: true },
    { key: 'conversation:write', label: 'Send messages', enabled: true },
    { key: 'conversation:assign', label: 'Assign conversations', enabled: true },
  ]},
  { category: 'Tickets', items: [
    { key: 'ticket:read', label: 'View tickets', enabled: true },
    { key: 'ticket:write', label: 'Create and edit tickets', enabled: true },
    { key: 'ticket:assign', label: 'Assign tickets', enabled: true },
    { key: 'ticket:delete', label: 'Delete tickets', enabled: false },
  ]},
  { category: 'Knowledge', items: [
    { key: 'knowledge:read', label: 'View knowledge base', enabled: true },
    { key: 'knowledge:write', label: 'Add knowledge sources', enabled: false },
    { key: 'knowledge:delete', label: 'Delete knowledge sources', enabled: false },
  ]},
  { category: 'Analytics', items: [
    { key: 'analytics:read', label: 'View analytics', enabled: true },
    { key: 'analytics:export', label: 'Export reports', enabled: false },
  ]},
  { category: 'Billing', items: [
    { key: 'billing:read', label: 'View billing', enabled: false },
    { key: 'billing:write', label: 'Manage subscription', enabled: false },
  ]},
  { category: 'Admin', items: [
    { key: 'audit:read', label: 'View audit logs', enabled: false },
    { key: 'settings:write', label: 'Edit settings', enabled: true },
  ]},
];

export default function AdminRolesPage() {
  const [selectedRole, setSelectedRole] = useState('AGENT');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground">Define what each role can see and do.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />Create role</Button>
      </div>

      <Tabs value={selectedRole} onValueChange={setSelectedRole} orientation="vertical" className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <TabsList className="flex-col h-auto bg-transparent p-0 space-y-1">
                {ROLES.map((r) => (
                  <TabsTrigger key={r.id} value={r.name} className="w-full justify-start data-[state=active]:bg-muted">
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5" />
                        <span className="text-sm">{r.name}</span>
                        {r.system && <Badge variant="outline" className="text-[10px]">System</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">{r.members}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardContent>
          </Card>
        </div>

        {ROLES.map((r) => (
          <TabsContent key={r.id} value={r.name} className="flex-1 m-0 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" />{r.name}</CardTitle>
                    <CardDescription>{r.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />{r.members} members
                  </div>
                </div>
              </CardHeader>
            </Card>

            {PERMISSIONS.map((cat) => (
              <Card key={cat.category}>
                <CardHeader>
                  <CardTitle className="text-sm">{cat.category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cat.items.map((perm) => (
                    <div key={perm.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{perm.label}</p>
                        <p className="text-xs text-muted-foreground font-mono">{perm.key}</p>
                      </div>
                      <Switch defaultChecked={perm.enabled} disabled={r.system} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, UserPlus } from 'lucide-react';

const USERS = [
  { id: '1', name: 'Alice Admin', email: 'admin@demo.com', org: 'Acme Healthcare', role: 'OWNER', status: 'active', lastActive: '2 min ago' },
  { id: '2', name: 'Bob Agent', email: 'agent@demo.com', org: 'Acme Healthcare', role: 'AGENT', status: 'active', lastActive: '5 min ago' },
  { id: '3', name: 'Charlie Customer', email: 'customer@demo.com', org: 'Acme Healthcare', role: 'VIEWER', status: 'active', lastActive: '1 hour ago' },
  { id: '4', name: 'Diana Designer', email: 'diana@demo.com', org: 'Acme Healthcare', role: 'AGENT', status: 'pending', lastActive: 'Never' },
  { id: '5', name: 'Eric Engineer', email: 'eric@bigcorp.com', org: 'BigCorp Inc', role: 'ADMIN', status: 'active', lastActive: '2 days ago' },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage all users across organizations.</p>
        </div>
        <Button><UserPlus className="mr-2 h-4 w-4" />Add user</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All users ({USERS.length})</CardTitle>
              <CardDescription>Search, filter, and manage user accounts.</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Organization</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Last active</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {USERS.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">{u.org}</td>
                    <td className="px-3 py-3"><Badge variant="outline">{u.role}</Badge></td>
                    <td className="px-3 py-3">
                      <Badge className={u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{u.lastActive}</td>
                    <td className="px-3 py-3 text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </td>
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

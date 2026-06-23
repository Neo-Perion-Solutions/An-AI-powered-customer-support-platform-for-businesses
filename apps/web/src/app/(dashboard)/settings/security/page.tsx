'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Lock, Smartphone, Key } from 'lucide-react';

export default function SecuritySettingsPage() {
  const { toast } = useToast();
  const [twoFA, setTwoFA] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const onChangePassword = () => {
    if (newPwd !== confirmPwd) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    toast({ title: 'Password updated' });
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Security</h1>
        <p className="text-sm text-muted-foreground">Manage your password and authentication settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="h-4 w-4" />Change password</CardTitle>
          <CardDescription>Use a strong password with at least 12 characters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="cur">Current password</Label>
            <Input id="cur" type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new">New password</Label>
            <Input id="new" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="conf">Confirm new password</Label>
            <Input id="conf" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={onChangePassword} disabled={!currentPwd || !newPwd}>Update password</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Smartphone className="h-4 w-4" />Two-factor authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Authenticator app</p>
            <p className="text-xs text-muted-foreground">{twoFA ? 'Enabled' : 'Not enabled'}</p>
          </div>
          <div className="flex items-center gap-2">
            {twoFA && <Badge className="bg-green-100 text-green-700">Active</Badge>}
            <Switch checked={twoFA} onCheckedChange={setTwoFA} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Key className="h-4 w-4" />Active sessions</CardTitle>
          <CardDescription>Devices currently logged into your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Chrome on macOS</p>
              <p className="text-xs text-muted-foreground">San Francisco, CA · Last active 2 minutes ago</p>
            </div>
            <Badge>Current</Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Safari on iPhone</p>
              <p className="text-xs text-muted-foreground">San Francisco, CA · Last active 3 days ago</p>
            </div>
            <Button variant="ghost" size="sm">Revoke</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

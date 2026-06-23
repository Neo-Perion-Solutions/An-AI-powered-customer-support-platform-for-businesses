'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/hooks/use-toast';
import { Building2, Globe } from 'lucide-react';

export default function OrganizationSettingsPage() {
  const org = useAuthStore((s) => s.organization);
  const { toast } = useToast();
  const [name, setName] = useState(org?.name ?? '');
  const [slug, setSlug] = useState(org?.slug ?? '');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    toast({ title: 'Organization updated' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Organization</h1>
        <p className="text-sm text-muted-foreground">Manage your organization settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Update your organization name and slug.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="orgName">Organization name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="orgName" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">URL slug</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="pl-9" />
            </div>
            <p className="text-xs text-muted-foreground">Used in your public URLs: neo.app/{slug}</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>Your current subscription tier.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{org?.plan ?? 'FREE'}</p>
              <p className="text-xs text-muted-foreground">Upgrade for more features and higher limits.</p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/billing'}>Manage plan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

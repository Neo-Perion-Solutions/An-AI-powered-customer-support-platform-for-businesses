'use client';

import { useState } from 'react';
import { Send, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useCampaigns, useCreateCampaign } from '@/hooks/use-whatsapp';
import { useToast } from '@/hooks/use-toast';
import { formatRelativeTime } from '@/lib/utils';
import type { Campaign } from '@/types/api';

const STATUS_VARIANT: Record<Campaign['status'], 'success' | 'warning' | 'destructive' | 'secondary'> = {
  draft: 'secondary',
  scheduled: 'warning',
  sending: 'warning',
  sent: 'success',
  failed: 'destructive',
};

export default function CampaignsPage() {
  const { data: campaigns = [] } = useCampaigns();
  const create = useCreateCampaign();
  const toast = useToast();
  const [name, setName] = useState('');
  const [audience, setAudience] = useState('all-customers');
  const [template, setTemplate] = useState('');
  const [schedule, setSchedule] = useState('');

  const submit = async (send: boolean) => {
    if (!name || !template) {
      toast.error('Please fill in all fields');
      return;
    }
    await create.mutateAsync({
      name,
      audience: [audience],
      template,
      scheduledAt: send ? undefined : schedule || undefined,
    });
    toast.success(send ? 'Campaign sending...' : 'Campaign scheduled');
    setName('');
    setTemplate('');
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Campaigns</h1>
        <p className="text-muted-foreground">Compose and send broadcast messages.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Composer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Spring sale announcement" />
            </div>
            <div>
              <Label htmlFor="audience">Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger id="audience"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-customers">All customers</SelectItem>
                  <SelectItem value="vip">VIP customers</SelectItem>
                  <SelectItem value="inactive">Inactive (30+ days)</SelectItem>
                  <SelectItem value="custom">Custom segment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="template">Message template</Label>
              <Textarea id="template" rows={5} value={template} onChange={(e) => setTemplate(e.target.value)} placeholder="Hi {{name}}, check out our latest offers..." />
            </div>
            <div>
              <Label htmlFor="schedule">Schedule (optional)</Label>
              <Input id="schedule" type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => submit(true)} disabled={create.isPending}>
                <Send className="mr-2 h-4 w-4" /> Send now
              </Button>
              <Button variant="outline" onClick={() => submit(false)} disabled={create.isPending}>
                <Calendar className="mr-2 h-4 w-4" /> Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent campaigns</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {campaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No campaigns yet</p>
            ) : (
              campaigns.map((c) => (
                <div key={c.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{c.name}</p>
                    <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.audience} recipients · {c.sent} sent · {c.delivered} delivered
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(c.scheduledAt ?? new Date().toISOString())}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
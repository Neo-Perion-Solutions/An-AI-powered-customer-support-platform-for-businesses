'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Mail, MessageSquare, Ticket } from 'lucide-react';

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">Choose what you want to be notified about.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" />In-app notifications</CardTitle>
          <CardDescription>Show notifications in the Neo Support AI interface.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { id: 'newMessage', label: 'New customer message', desc: 'When a customer sends a message in your inbox.' },
            { id: 'ticketAssigned', label: 'Ticket assigned to you', desc: 'When a ticket is assigned to you.' },
            { id: 'mention', label: 'You are mentioned', desc: 'When someone mentions you in a comment.' },
            { id: 'aiEscalation', label: 'AI escalation', desc: 'When AI cannot answer and escalates to a human.' },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch id={item.id} defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="h-4 w-4" />Email notifications</CardTitle>
          <CardDescription>Receive email updates for important events.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { id: 'emailDaily', label: 'Daily digest', desc: 'Summary of activity from the past 24 hours.' },
            { id: 'emailUrgent', label: 'Urgent tickets', desc: 'Tickets marked urgent.' },
            { id: 'emailWeekly', label: 'Weekly report', desc: 'Performance and analytics summary.' },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch id={item.id} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

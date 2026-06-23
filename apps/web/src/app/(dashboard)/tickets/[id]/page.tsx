'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { LoadingState } from '@/components/loading-state';
import { useAddComment, useTicket, useTicketComments, useUpdateTicket } from '@/hooks/use-tickets';
import { formatRelativeTime } from '@/lib/utils';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: ticket, isLoading } = useTicket(id);
  const { data: comments = [] } = useTicketComments(id);
  const update = useUpdateTicket(id);
  const addComment = useAddComment(id);
  const [draft, setDraft] = useState('');
  const [internal, setInternal] = useState(false);

  if (isLoading || !ticket) return <LoadingState />;

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <Link href="/tickets" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to tickets
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-mono">#{ticket.number}</span>
            <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 'secondary'}>{ticket.priority}</Badge>
          </div>
          <h1 className="mt-1 text-2xl font-bold">{ticket.subject}</h1>
          <p className="mt-2 text-muted-foreground">{ticket.description}</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Conversation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar name={c.authorName} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{c.authorName}</span>
                      {c.internal && <Badge variant="warning" className="text-xs">Internal</Badge>}
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(c.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={internal ? 'Internal note (only visible to team)...' : 'Reply to customer...'}
              rows={3}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
                Internal note
              </label>
              <Button
                onClick={async () => {
                  if (!draft.trim()) return;
                  await addComment.mutateAsync({ content: draft, internal });
                  setDraft('');
                }}
                disabled={!draft.trim()}
              >
                <Send className="mr-2 h-4 w-4" /> {internal ? 'Add note' : 'Reply'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="Status">
              <Select value={ticket.status} onValueChange={(v) => update.mutate({ status: v as typeof ticket.status })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={ticket.priority} onValueChange={(v) => update.mutate({ priority: v as typeof ticket.priority })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Assignee">
              <Select defaultValue={ticket.assigneeId}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="u1">Alice</SelectItem>
                  <SelectItem value="u2">Bob</SelectItem>
                  <SelectItem value="u3">Carol</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="text-sm font-medium">{ticket.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm">{formatRelativeTime(ticket.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tags</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {ticket.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
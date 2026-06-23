'use client';

import Link from 'next/link';
import { FileText, Globe, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { useKnowledgeSources } from '@/hooks/use-knowledge';
import { formatRelativeTime } from '@/lib/utils';

export default function KnowledgePage() {
  const { data, isLoading } = useKnowledgeSources();
  const items = data?.items ?? [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">Sources your chatbot uses to answer questions.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/knowledge/faqs"><FileText className="mr-2 h-4 w-4" /> FAQs</Link>
          </Button>
          <Button asChild>
            <Link href="/knowledge/upload"><Plus className="mr-2 h-4 w-4" /> Add source</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total sources</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{items.length || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total chunks</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{items.reduce((s, i) => s + (i.chunks || 0), 0)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Storage</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{(items.reduce((s, i) => s + (i.size ?? 0), 0) / 1024 / 1024).toFixed(1)} MB</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sources</CardTitle>
          <CardDescription>All uploaded files, URLs and FAQs.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState />
          ) : items.length === 0 ? (
            <EmptyState
              title="No sources yet"
              description="Upload a PDF or scrape a URL to get started."
              action={<Button asChild><Link href="/knowledge/upload">Upload source</Link></Button>}
            />
          ) : (
            <div className="divide-y">
              {items.map((s) => (
                <div key={s.id} className="flex items-center gap-4 py-3">
                  <div className="rounded-md bg-primary/10 p-2 text-primary">
                    {s.type === 'url' ? <Globe className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.chunks} chunks · {formatRelativeTime(s.createdAt)}
                    </p>
                  </div>
                  <Badge variant={s.status === 'ready' ? 'success' : s.status === 'failed' ? 'destructive' : 'warning'}>
                    {s.status}
                  </Badge>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
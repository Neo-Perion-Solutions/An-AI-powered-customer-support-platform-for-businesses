'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileUpload } from '@/components/file-upload';
import { useScrapeUrl, useUploadSource } from '@/hooks/use-knowledge';
import { useToast } from '@/hooks/use-toast';

export default function KnowledgeUploadPage() {
  const router = useRouter();
  const toast = useToast();
  const upload = useUploadSource();
  const scrape = useScrapeUrl();
  const [url, setUrl] = useState('');

  const onUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        await upload.mutateAsync({ file, onProgress: (p) => { /* progress */ } });
      } catch (e) {
        // ignore
      }
    }
    toast.success('Sources uploaded — processing');
    router.push('/knowledge');
  };

  const onScrape = async () => {
    if (!url) return;
    try {
      await scrape.mutateAsync(url);
      toast.success('URL queued for scraping');
      router.push('/knowledge');
    } catch {
      toast.error('Failed to scrape URL');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Link href="/knowledge" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to knowledge
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add knowledge source</h1>
        <p className="text-muted-foreground">Upload documents or scrape websites.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="file">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file"><FileText className="mr-2 h-4 w-4" /> Upload file</TabsTrigger>
              <TabsTrigger value="url"><Globe className="mr-2 h-4 w-4" /> Scrape URL</TabsTrigger>
            </TabsList>
            <TabsContent value="file" className="mt-6">
              <FileUpload onUpload={onUpload} />
            </TabsContent>
            <TabsContent value="url" className="mt-6 space-y-4">
              <div>
                <Label htmlFor="url">Website URL</Label>
                <Input id="url" type="url" placeholder="https://docs.example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
              </div>
              <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                We&apos;ll crawl up to 50 pages and extract content. May take a few minutes.
              </div>
              <Button onClick={onScrape} disabled={!url || scrape.isPending}>
                {scrape.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Start scraping
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
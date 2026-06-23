'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateFaq, useDeleteFaq, useFaqs, useUpdateFaq } from '@/hooks/use-knowledge';
import { faqSchema, type FaqInput } from '@/lib/validators';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { useToast } from '@/hooks/use-toast';
import { formatRelativeTime } from '@/lib/utils';
import type { Faq } from '@/types/api';

export default function FaqsPage() {
  const { data: faqs = [], isLoading } = useFaqs();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
          <p className="text-muted-foreground">Curated Q&amp;A pairs your bot can quote verbatim.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add FAQ
        </Button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : faqs.length === 0 ? (
        <EmptyState
          title="No FAQs yet"
          description="Create your first FAQ to help your bot answer common questions."
          action={<Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add FAQ</Button>}
        />
      ) : (
        <div className="space-y-3">
          {faqs.map((f) => (
            <FaqCard key={f.id} faq={f} onEdit={() => { setEditing(f); setOpen(true); }} />
          ))}
        </div>
      )}

      <FaqDialog open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function FaqCard({ faq, onEdit }: { faq: Faq; onEdit: () => void }) {
  const remove = useDeleteFaq();
  const toast = useToast();
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold">{faq.question}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
            <p className="mt-2 text-xs text-muted-foreground">Added {formatRelativeTime(faq.createdAt)}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await remove.mutateAsync(faq.id);
                toast.success('FAQ deleted');
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FaqDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: Faq | null }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FaqInput>({
    resolver: zodResolver(faqSchema),
    values: editing ? { question: editing.question, answer: editing.answer } : undefined,
  });
  const create = useCreateFaq();
  const update = useUpdateFaq();
  const toast = useToast();

  const onSubmit = async (data: FaqInput) => {
    try {
      if (editing) await update.mutateAsync({ id: editing.id, payload: data });
      else await create.mutateAsync(data);
      toast.success(editing ? 'FAQ updated' : 'FAQ created');
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to save FAQ');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="question">Question</Label>
            <Input id="question" {...register('question')} />
            {errors.question && <p className="mt-1 text-xs text-destructive">{errors.question.message}</p>}
          </div>
          <div>
            <Label htmlFor="answer">Answer</Label>
            <Textarea id="answer" rows={4} {...register('answer')} />
            {errors.answer && <p className="mt-1 text-xs text-destructive">{errors.answer.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
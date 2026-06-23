'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Save, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { chatbotSchema, type ChatbotInput } from '@/lib/validators';
import { useChatbot, useUpdateChatbot } from '@/hooks/use-chatbot';

export default function ChatbotPage() {
  const { data: chatbot, isLoading } = useChatbot();
  const update = useUpdateChatbot();
  const toast = useToast();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<ChatbotInput>({
    resolver: zodResolver(chatbotSchema),
    defaultValues: {
      name: 'Support Bot',
      systemPrompt: 'You are a helpful customer support assistant for our SaaS product. Be concise, friendly and accurate. If unsure, escalate to a human.',
      welcomeMessage: 'Hi! How can I help you today?',
      fallbackMessage: "I'm not sure about that — let me connect you with a human agent.",
      handoffEnabled: true,
    },
  });

  useEffect(() => {
    if (chatbot) {
      reset({
        name: chatbot.name,
        systemPrompt: chatbot.systemPrompt,
        welcomeMessage: chatbot.welcomeMessage,
        fallbackMessage: chatbot.fallbackMessage,
        handoffEnabled: chatbot.handoffEnabled,
      });
    }
  }, [chatbot, reset]);

  const onSubmit = async (data: ChatbotInput) => {
    await update.mutateAsync(data);
    toast.success('Chatbot updated');
    reset(data);
  };

  if (isLoading) return null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-7 w-7 text-primary" /> AI Chatbot
          </h1>
          <p className="text-muted-foreground">Train your bot&apos;s tone, knowledge and escalation rules.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Play className="mr-2 h-4 w-4" /> Test</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={!isDirty || update.isPending}>
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="escalation">Escalation</TabsTrigger>
          <TabsTrigger value="model">Model</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General settings</CardTitle>
                <CardDescription>Basic info about your bot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Bot name</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="systemPrompt">System prompt</Label>
                  <Textarea id="systemPrompt" rows={6} {...register('systemPrompt')} />
                  {errors.systemPrompt && <p className="mt-1 text-xs text-destructive">{errors.systemPrompt.message}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">Define the bot&apos;s personality and rules.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Bot messages</CardTitle>
                <CardDescription>Customize what your bot says</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="welcomeMessage">Welcome message</Label>
                  <Textarea id="welcomeMessage" rows={2} {...register('welcomeMessage')} />
                </div>
                <div>
                  <Label htmlFor="fallbackMessage">Fallback message</Label>
                  <Textarea id="fallbackMessage" rows={2} {...register('fallbackMessage')} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="escalation">
            <Card>
              <CardHeader>
                <CardTitle>Escalation rules</CardTitle>
                <CardDescription>When to hand off to a human</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable handoff</Label>
                    <p className="text-xs text-muted-foreground">Bot can transfer to a live agent</p>
                  </div>
                  <Switch
                    checked={watch('handoffEnabled')}
                    onCheckedChange={(v) => setValue('handoffEnabled', v, { shouldDirty: true })}
                  />
                </div>
                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                  <p className="font-medium">Trigger conditions</p>
                  <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Customer asks for a human</li>
                    <li>Sentiment drops below threshold</li>
                    <li>Bot confidence below 60%</li>
                    <li>VIP customer</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="model">
            <Card>
              <CardHeader>
                <CardTitle>Model settings</CardTitle>
                <CardDescription>Fine-tune model behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Model</Label>
                  <Input defaultValue="gpt-4o-mini" />
                </div>
                <div>
                  <Label>Temperature: {watch('name') ? '0.7' : '0.7'}</Label>
                  <Slider defaultValue={[0.7]} max={1} step={0.1} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
}
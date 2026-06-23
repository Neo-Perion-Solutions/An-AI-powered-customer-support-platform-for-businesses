import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'Neo Support AI',
    template: '%s | Neo Support AI',
  },
  description:
    'AI-powered customer support platform with omnichannel inbox, chatbot builder, knowledge base, and analytics.',
  keywords: ['AI support', 'chatbot', 'helpdesk', 'omnichannel', 'WhatsApp', 'customer service'],
  authors: [{ name: 'Neo Support AI' }],
  openGraph: {
    title: 'Neo Support AI',
    description: 'AI-powered customer support platform.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
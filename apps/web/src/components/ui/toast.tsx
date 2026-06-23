'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive: 'border-destructive/50 bg-destructive text-destructive-foreground',
        success: 'border-green-500/50 bg-green-50 text-green-900 dark:bg-green-900/30 dark:text-green-100',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {}

export function Toast({ className, variant, ...props }: ToastProps) {
  return <div className={cn(toastVariants({ variant }), className)} {...props} />;
}

export function ToastClose({ className, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn('absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:text-foreground hover:opacity-100', className)}
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  );
}
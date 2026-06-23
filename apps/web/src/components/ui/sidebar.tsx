'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export const Sidebar = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn('flex h-full w-64 shrink-0 flex-col border-r bg-card', className)}
      {...props}
    />
  )
);
Sidebar.displayName = 'Sidebar';

export const SidebarHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex h-14 items-center border-b px-4', className)} {...props} />
);

export const SidebarContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex-1 overflow-y-auto py-2', className)} {...props} />
);

export const SidebarFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('border-t p-4', className)} {...props} />
);
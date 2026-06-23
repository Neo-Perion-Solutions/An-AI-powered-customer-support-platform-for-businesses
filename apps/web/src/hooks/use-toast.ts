'use client';

import { toast as sonnerToast } from 'sonner';

export function useToast() {
  return {
    success: (msg: string) => sonnerToast.success(msg),
    error: (msg: string) => sonnerToast.error(msg),
    info: (msg: string) => sonnerToast.info(msg),
    warning: (msg: string) => sonnerToast.warning(msg),
    promise: <T,>(promise: Promise<T>, msgs: { loading: string; success: string; error: string }) =>
      sonnerToast.promise(promise, msgs),
  };
}
'use client';

import { toast as sonnerToast } from 'sonner';

export function useToast() {
  const toastFn = Object.assign(
    (opts: { title?: string; description?: string }) => {
      if (opts.title) {
        sonnerToast(opts.title, { description: opts.description });
      } else if (opts.description) {
        sonnerToast(opts.description);
      }
    },
    {
      success: (msg: string) => sonnerToast.success(msg),
      error: (msg: string) => sonnerToast.error(msg),
      info: (msg: string) => sonnerToast.info(msg),
      warning: (msg: string) => sonnerToast.warning(msg),
      promise: <T>(promise: Promise<T>, msgs: { loading: string; success: string; error: string }) =>
        sonnerToast.promise(promise, msgs),
    }
  );

  return {
    toast: toastFn,
    ...toastFn,
  };
}
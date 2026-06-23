'use client';

import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/services/api';

export function useApi<T = unknown>(
  key: readonly unknown[],
  url: string,
  options?: UseQueryOptions<T>
) {
  return useQuery<T>({
    queryKey: [...key],
    queryFn: async () => {
      const { data } = await api.get(url);
      return data.data as T;
    },
    ...options,
  });
}

export function useApiMutation<TVariables, TData = unknown>(url: string, method: 'post' | 'put' | 'patch' | 'delete' = 'post') {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (payload) => {
      const { data } = await api.request({ url, method, data: payload });
      return data.data as TData;
    },
  });
}

export { getErrorMessage };
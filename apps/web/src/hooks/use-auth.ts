'use client';

import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const organization = useAuthStore((s) => s.organization);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);

  const hydrate = useAuthStore((s) => s.hydrate);

  return {
    user,
    organization,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    hydrate,
  };
}
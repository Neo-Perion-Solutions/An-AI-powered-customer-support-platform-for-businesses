'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Organization } from '@/types/api';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  setSession: (data: { user: User; organization: Organization; accessToken: string; refreshToken: string }) => void;
  setUser: (user: User | null) => void;
  setOrganization: (org: Organization | null) => void;
  setTokens: (access: string, refresh: string) => void;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      organization: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      setSession: (data) =>
        set({
          user: data.user,
          organization: data.organization,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      setUser: (user) => set({ user }),
      setOrganization: (organization) => set({ organization }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      login: async ({ email, password }) => {
        set({ isLoading: true });
        try {
          await new Promise((r) => setTimeout(r, 500));
          const mockUser: User = {
            id: 'u_1',
            email,
            name: email.split('@')[0] ?? 'User',
            role: 'owner',
            organizationId: 'org_1',
            createdAt: new Date().toISOString(),
          };
          const mockOrg: Organization = {
            id: 'org_1',
            name: 'Acme Inc',
            slug: 'acme',
            plan: 'pro',
            createdAt: new Date().toISOString(),
          };
          set({
            user: mockUser,
            organization: mockOrg,
            accessToken: 'mock_access_token',
            refreshToken: 'mock_refresh_token',
            isLoading: false,
          });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          await new Promise((r) => setTimeout(r, 800));
          const email = String(data.email ?? '');
          const mockUser: User = {
            id: 'u_1',
            email,
            name: String(data.name ?? ''),
            role: 'owner',
            organizationId: 'org_1',
            createdAt: new Date().toISOString(),
          };
          const mockOrg: Organization = {
            id: 'org_1',
            name: String(data.organizationName ?? 'Organization'),
            slug: 'org',
            plan: 'starter',
            createdAt: new Date().toISOString(),
          };
          set({
            user: mockUser,
            organization: mockOrg,
            accessToken: 'mock_access_token',
            refreshToken: 'mock_refresh_token',
            isLoading: false,
          });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      logout: async () => {
        set({ user: null, organization: null, accessToken: null, refreshToken: null });
      },

      hydrate: async () => {
        const state = get();
        if (state.user && state.accessToken) return;
      },
    }),
    {
      name: 'neo-auth',
      partialize: (s) => ({ user: s.user, organization: s.organization, accessToken: s.accessToken, refreshToken: s.refreshToken }),
    }
  )
);
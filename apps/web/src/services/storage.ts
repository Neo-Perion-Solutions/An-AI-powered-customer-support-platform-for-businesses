'use client';

export const storage = {
  get<T>(key: string, fallback: T | null = null): T | null {
    if (typeof window === 'undefined') return fallback;
    try {
      const value = window.localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
  remove(key: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },
  clear() {
    if (typeof window === 'undefined') return;
    window.localStorage.clear();
  },
};

export const session = {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const value = window.sessionStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  },
  set<T>(key: string, value: T) {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
  remove(key: string) {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(key);
  },
};
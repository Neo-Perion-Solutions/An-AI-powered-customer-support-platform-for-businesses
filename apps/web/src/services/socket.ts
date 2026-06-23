'use client';

import { io, Socket } from 'socket.io-client';
import { WS_URL } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(): Socket {
  if (socket?.connected) return socket;
  const token = useAuthStore.getState().accessToken;
  socket = io(WS_URL, {
    transports: ['websocket'],
    auth: { token },
    autoConnect: true,
  });
  socket.on('connect_error', (err) => {
    console.warn('[socket] connection error', err.message);
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
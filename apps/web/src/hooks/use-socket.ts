'use client';

import { useEffect, useRef, useState } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const s = socketRef.current ?? connectSocket();
    socketRef.current = s;
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    if (s.connected) setConnected(true);
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, []);

  const on = (event: string, handler: (...args: unknown[]) => void) => {
    socketRef.current?.on(event, handler as (...args: any[]) => void);
    return () => socketRef.current?.off(event, handler as (...args: any[]) => void);
  };

  const emit = (event: string, ...args: unknown[]) => {
    socketRef.current?.emit(event, ...args);
  };

  return { connected, on, emit, socket: socketRef.current };
}

export function useSocketCleanup() {
  useEffect(() => {
    connectSocket();
    return () => {
      // keep alive across routes; disconnect on full logout only
    };
  }, []);
}
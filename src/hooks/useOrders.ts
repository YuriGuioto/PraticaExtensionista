import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

import { API_BASE_URL, api } from '../services/api.ts';
import { OrderRecord, OrderStatus } from '../types/api.ts';

const socketOrigin = import.meta.env.VITE_SOCKET_URL ?? API_BASE_URL.replace('/api', '');

export const useOrders = (statusFilter?: OrderStatus[]) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let socket: Socket | undefined;
    try {
      socket = io(socketOrigin, {
        transports: ['websocket'],
      });
      socket.on('orders:update', () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      });
    } catch (error) {
      console.warn('Socket connection failed', error);
    }

    return () => {
      socket?.disconnect();
    };
  }, [queryClient]);

  const statusKey = statusFilter && statusFilter.length > 0 ? statusFilter.slice().sort().join(',') : 'all';

  return useQuery({
    queryKey: ['orders', statusKey],
    queryFn: async () => {
      const params = statusFilter && statusFilter.length > 0 ? { status: statusFilter } : undefined;
      const { data } = await api.get<{ data: OrderRecord[] }>('/orders', { params });
      return data.data;
    },
    refetchInterval: 15000,
  });
};

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AdminMenuManager } from '../components/AdminMenuManager.tsx';
import { AdminNotificationsPanel } from '../components/AdminNotificationsPanel.tsx';
import { AdminOrderList } from '../components/AdminOrderList.tsx';
import { useMenuCategories, useMenuItems } from '../hooks/useMenu.ts';
import { useOrders } from '../hooks/useOrders.ts';
import { api } from '../services/api.ts';
import { OrderStatus } from '../types/api.ts';

export const AdminDashboardPage = () => {
  const [statusFilter, setStatusFilter] = useState<OrderStatus[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = window.localStorage.getItem('acai-alert-sound');
    return stored ? stored === 'true' : true;
  });
  const [flashEnabled, setFlashEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = window.localStorage.getItem('acai-alert-flash');
    return stored ? stored === 'true' : true;
  });
  const [highlightedOrderCodes, setHighlightedOrderCodes] = useState<string[]>([]);
  const { data: orders = [], isLoading: isLoadingOrders } = useOrders(statusFilter);
  const { data: categories = [], isLoading: isLoadingCategories } = useMenuCategories();
  const {
    data: menuItems = [],
    isLoading: isLoadingItems,
    refetch: refetchItems,
  } = useMenuItems();
  const queryClient = useQueryClient();
  const knownOrderIdsRef = useRef<string[]>([]);
  const isFirstLoadRef = useRef(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('acai-alert-sound', String(soundEnabled));
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('acai-alert-flash', String(flashEnabled));
    }
  }, [flashEnabled]);

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      await api.patch(`/orders/${orderId}/status`, { status, adminPin: import.meta.env.VITE_ADMIN_PIN });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const awaitingPreparation = useMemo(() => orders.filter((order) => order.status === 'received'), [orders]);
  const readyOrders = useMemo(() => orders.filter((order) => order.status === 'ready'), [orders]);

  const playNewOrderSound = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    const AudioCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtor();
    }
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => undefined);
    }
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 880;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.6);
  };

  useEffect(() => {
    if (orders.length === 0) {
      knownOrderIdsRef.current = [];
      return;
    }

    const previousIds = knownOrderIdsRef.current;
    const previousSet = new Set(previousIds);
    const newOrders = orders.filter((order) => !previousSet.has(order.id));
    knownOrderIdsRef.current = orders.map((order) => order.id);

    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }

    if (newOrders.length === 0) {
      return;
    }

    if (soundEnabled) {
      playNewOrderSound();
    }

    if (flashEnabled) {
      const codes = newOrders.map((order) => order.code);
      setHighlightedOrderCodes(codes);
      if (typeof window !== 'undefined') {
        if (highlightTimeoutRef.current) {
          window.clearTimeout(highlightTimeoutRef.current);
        }
        highlightTimeoutRef.current = window.setTimeout(() => {
          setHighlightedOrderCodes([]);
          highlightTimeoutRef.current = null;
        }, 5000);
      }
    }
  }, [orders, soundEnabled, flashEnabled]);

  useEffect(() => () => {
    if (typeof window !== 'undefined' && highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
  }, []);

  const toggleFilter = (status: OrderStatus) => {
    setStatusFilter((current) =>
      current.includes(status) ? current.filter((value) => value !== status) : [...current, status],
    );
  };

  const quickFilter = (status: OrderStatus) => setStatusFilter([status]);

  const clearFilters = () => setStatusFilter([]);

  const filters: { label: string; value: OrderStatus; accent: string }[] = [
    { label: 'Recebidos', value: 'received', accent: 'bg-amber-100 text-amber-800' },
    { label: 'Em preparo', value: 'in_preparation', accent: 'bg-sky-100 text-sky-800' },
    { label: 'Prontos', value: 'ready', accent: 'bg-emerald-100 text-emerald-800' },
    { label: 'Entregues', value: 'delivered', accent: 'bg-slate-100 text-slate-700' },
  ];

  return (
    <section className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] bg-gradient-to-r from-acai-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          Painel ADM
        </p>
        <h1 className="text-4xl font-black">Pedidos em tempo real</h1>
        <p className="text-slate-600">
          Acompanhe pedidos recebidos, avance status em um clique e mantenha clientes informados.
        </p>
      </header>

      <AdminNotificationsPanel
        awaitingPreparation={awaitingPreparation}
        readyToDeliver={readyOrders}
        onFocusStatus={quickFilter}
        highlightedOrderCodes={highlightedOrderCodes}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-600">Alertas em tempo real</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-2 font-semibold ${
              soundEnabled ? 'border-acai-200 text-acai-700' : 'border-slate-200 text-slate-500'
            }`}
          >
            <span>Som ao chegar pedidos</span>
            <span className={`rounded-full px-3 py-1 text-xs ${soundEnabled ? 'bg-acai-600 text-white' : 'bg-slate-100'}`}>
              {soundEnabled ? 'Ligado' : 'Desligado'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFlashEnabled((prev) => !prev)}
            className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-2 font-semibold ${
              flashEnabled ? 'border-emerald-200 text-emerald-700' : 'border-slate-200 text-slate-500'
            }`}
          >
            <span>Destaque visual</span>
            <span className={`rounded-full px-3 py-1 text-xs ${flashEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>
              {flashEnabled ? 'Ligado' : 'Desligado'}
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-slate-600">Filtrar status</p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => toggleFilter(filter.value)}
                className={`rounded-full px-4 py-1 text-sm font-semibold transition ${filter.accent} ${
                  statusFilter.includes(filter.value)
                    ? 'ring-2 ring-offset-2 ring-acai-500'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          {statusFilter.length > 0 && (
            <button type="button" onClick={clearFilters} className="text-sm font-semibold text-acai-600">
              Limpar
            </button>
          )}
        </div>

        {isLoadingOrders ? (
          <p>Carregando pedidos...</p>
        ) : orders.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Nenhum pedido por enquanto.
          </p>
        ) : (
          <AdminOrderList
            orders={orders}
            onAdvance={(orderId, status) => updateStatus.mutate({ orderId, status })}
          />
        )}
      </div>

      <AdminMenuManager
        categories={categories}
        items={menuItems}
        refetchItems={refetchItems}
        isLoading={isLoadingCategories || isLoadingItems}
      />
    </section>
  );
};

import { OrderRecord, OrderStatus } from '../types/api.ts';

const statusLabel: Record<OrderStatus, string> = {
  received: 'Recebido',
  in_preparation: 'Em preparo',
  ready: 'Pronto',
  delivered: 'Entregue',
};

interface Props {
  orders: OrderRecord[];
  onAdvance: (orderId: string, status: OrderStatus) => void;
}

const statusFlow: OrderStatus[] = ['received', 'in_preparation', 'ready', 'delivered'];

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const AdminOrderList = ({ orders, onAdvance }: Props) => {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {orders.map((order) => {
        const currentIndex = statusFlow.indexOf(order.status);
        const nextStatus = statusFlow[Math.min(currentIndex + 1, statusFlow.length - 1)];
        return (
          <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <header className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{order.code}</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                {statusLabel[order.status]}
              </span>
            </header>
            <p className="text-sm text-slate-500">{order.customerName}</p>
            {order.tableLabel && <p className="text-xs text-slate-400">Mesa: {order.tableLabel}</p>}
            <p className="text-xs text-slate-400">{formatTime(order.createdAt)}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {order.items.map((item) => (
                <li key={`${order.id}-${item.itemId}`}>
                  {item.quantity}x {item.name ?? item.itemId}
                </li>
              ))}
            </ul>
            {order.history && order.history.length > 0 && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                <p className="mb-2 font-semibold text-slate-500">Histórico</p>
                <ol className="space-y-1">
                  {order.history.map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between gap-2">
                      <span>{statusLabel[entry.newStatus]}</span>
                      <span>{formatTime(entry.createdAt)}</span>
                      {entry.admin?.name && <span className="text-[11px] text-slate-400">por {entry.admin.name}</span>}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <footer className="mt-4 flex items-center justify-between">
              <p className="text-lg font-semibold">R$ {order.total.toFixed(2)}</p>
              {order.status !== 'delivered' && (
                <button
                  type="button"
                  onClick={() => onAdvance(order.id, nextStatus)}
                  className="rounded-xl bg-acai-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Avançar para {statusLabel[nextStatus]}
                </button>
              )}
            </footer>
          </article>
        );
      })}
    </div>
  );
};

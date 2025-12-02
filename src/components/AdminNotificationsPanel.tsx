import { OrderRecord, OrderStatus } from '../types/api';

interface Props {
  awaitingPreparation: OrderRecord[];
  readyToDeliver: OrderRecord[];
  onFocusStatus: (status: OrderStatus) => void;
  highlightedOrderCodes?: string[];
}

const formatSince = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(Math.floor(diff / 60000), 0);
  if (minutes < 1) return 'agora';
  return `${minutes} min`;
};

const highlightOrders = (orders: OrderRecord[]) => orders.slice(0, 3);

export const AdminNotificationsPanel = ({ awaitingPreparation, readyToDeliver, onFocusStatus, highlightedOrderCodes = [] }: Props) => {
  const awaitingHighlight = highlightOrders(awaitingPreparation);
  const readyHighlight = highlightOrders(readyToDeliver);

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article
        className={`rounded-3xl border border-amber-200 bg-amber-50 p-5 ${
          highlightedOrderCodes.some((code) => awaitingHighlight.some((order) => order.code === code))
            ? 'animate-pulse'
            : ''
        }`}
      >
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">À preparar</p>
            <h3 className="text-3xl font-black text-amber-900">{awaitingPreparation.length} pedidos</h3>
            <p className="text-sm text-amber-700">Clientes aguardando confirmação</p>
          </div>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-amber-900">
            {formatSince(awaitingPreparation[0]?.createdAt)}
          </span>
        </header>
        <ul className="mt-4 space-y-2 text-sm text-amber-800">
          {awaitingHighlight.length === 0 ? (
            <li>Nenhum pedido esperando.</li>
          ) : (
            awaitingHighlight.map((order) => (
              <li
                key={order.id}
                className={`flex items-center justify-between rounded-2xl px-3 py-2 ${
                  highlightedOrderCodes.includes(order.code)
                    ? 'bg-white text-amber-900 shadow'
                    : 'bg-white/60'
                }`}
              >
                <span className="font-semibold">{order.code}</span>
                <span>{order.customerName}</span>
              </li>
            ))
          )}
        </ul>
        <button
          type="button"
          onClick={() => onFocusStatus('received')}
          className="mt-4 rounded-2xl bg-amber-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Ver pedidos a preparar
        </button>
      </article>
      <article
        className={`rounded-3xl border border-emerald-200 bg-emerald-50 p-5 ${
          highlightedOrderCodes.some((code) => readyHighlight.some((order) => order.code === code))
            ? 'animate-pulse'
            : ''
        }`}
      >
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">Prontos</p>
            <h3 className="text-3xl font-black text-emerald-900">{readyToDeliver.length} pedidos</h3>
            <p className="text-sm text-emerald-700">Aguardando retirada/entrega</p>
          </div>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-900">
            {formatSince(readyToDeliver[0]?.updatedAt)}
          </span>
        </header>
        <ul className="mt-4 space-y-2 text-sm text-emerald-800">
          {readyHighlight.length === 0 ? (
            <li>Nenhum pedido pronto.</li>
          ) : (
            readyHighlight.map((order) => (
              <li
                key={order.id}
                className={`flex items-center justify-between rounded-2xl px-3 py-2 ${
                  highlightedOrderCodes.includes(order.code)
                    ? 'bg-white text-emerald-900 shadow'
                    : 'bg-white/60'
                }`}
              >
                <span className="font-semibold">{order.code}</span>
                <span>{order.customerName}</span>
              </li>
            ))
          )}
        </ul>
        <button
          type="button"
          onClick={() => onFocusStatus('ready')}
          className="mt-4 rounded-2xl bg-emerald-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Ver pedidos prontos
        </button>
      </article>
    </section>
  );
};

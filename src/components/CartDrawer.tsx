import { useCartStore } from '../store/cartStore.ts';

interface Props {
  onReview: () => void;
}

export const CartDrawer = ({ onReview }: Props) => {
  const { items, total, updateQuantity, removeItem } = useCartStore();
  const totalValue = total();

  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="fixed bottom-6 right-6 w-full max-w-sm rounded-3xl border border-white/30 bg-white/70 p-4 shadow-2xl shadow-acai-900/10 backdrop-blur-xl">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Seu pedido</h2>
        <span className="text-sm text-slate-500">{items.length} itens</span>
      </header>
      <ul className="mt-3 flex max-h-60 flex-col gap-2 overflow-y-auto pr-2">
        {items.map((item) => (
          <li key={item.itemId} className="flex items-center justify-between gap-3 text-sm">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-slate-500">R$ {item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                className="rounded-full border border-slate-200 px-2"
              >
                -
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                className="rounded-full border border-slate-200 px-2"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => removeItem(item.itemId)}
                className="text-xs text-rose-500"
              >
                remover
              </button>
            </div>
          </li>
        ))}
      </ul>
      <footer className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Total estimado</p>
          <p className="text-xl font-bold text-acai-700">R$ {totalValue.toFixed(2)}</p>
        </div>
        <button
          type="button"
          onClick={onReview}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-acai-600 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-acai-500/40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="17" cy="19" r="1" />
          </svg>
          Revisar pedido
        </button>
      </footer>
    </aside>
  );
};

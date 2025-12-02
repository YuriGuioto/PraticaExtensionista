import { FormEvent } from 'react';

import { useCartStore } from '../store/cartStore.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    customerName: string;
    tableLabel?: string;
    contact?: string;
    notes?: string;
  }) => void;
}

export const OrderReviewModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const { items, total } = useCartStore();
  const totalValue = total();

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      customerName: String(formData.get('customerName') ?? ''),
      tableLabel: String(formData.get('tableLabel') ?? ''),
      contact: String(formData.get('contact') ?? ''),
      notes: String(formData.get('notes') ?? ''),
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-acai-700">Revisar pedido</h2>
          <button type="button" onClick={onClose} className="text-slate-500">
            fechar
          </button>
        </header>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.itemId} className="flex items-center justify-between text-sm">
              <p>
                {item.quantity}x {item.name}
              </p>
              <p className="font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <p className="text-right text-xs text-slate-500">Total: R$ {totalValue.toFixed(2)}</p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold text-slate-600" htmlFor="customerName">
              Nome
            </label>
            <input
              id="customerName"
              name="customerName"
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="Ex.: Ana (Mesa 8)"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-600" htmlFor="tableLabel">
                Mesa / Retirada
              </label>
              <input
                id="tableLabel"
                name="tableLabel"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                placeholder="Mesa 8"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600" htmlFor="contact">
                Contato
              </label>
              <input
                id="contact"
                name="contact"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                placeholder="WhatsApp"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600" htmlFor="notes">
              Observações
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="Ex.: Sem granola para o item 2"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-2xl bg-guarana py-3 text-base font-semibold text-white"
          >
            Enviar pedido
          </button>
        </form>
      </section>
    </div>
  );
};

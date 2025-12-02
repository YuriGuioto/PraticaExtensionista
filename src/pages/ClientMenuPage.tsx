import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { CartDrawer } from '../components/CartDrawer.tsx';
import { MenuCategoryTabs } from '../components/MenuCategoryTabs.tsx';
import { MenuItemCard } from '../components/MenuItemCard.tsx';
import { OrderReviewModal } from '../components/OrderReviewModal.tsx';
import { useMenuCategories, useMenuItems } from '../hooks/useMenu.ts';
import { useCartStore } from '../store/cartStore.ts';
import { api } from '../services/api.ts';
import { MenuItem } from '../types/api.ts';

export const ClientMenuPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const { data: categories = [], isLoading: isLoadingCategories } = useMenuCategories();
  const { data: items = [], isLoading: isLoadingItems } = useMenuItems(selectedCategory);
  const { addItem, clear, items: cartItems } = useCartStore();

  const createOrder = useMutation({
    mutationFn: async (payload: { customerName: string; tableLabel?: string; contact?: string }) => {
      const { data } = await api.post('/orders', {
        customerName: payload.customerName,
        tableLabel: payload.tableLabel,
        contact: payload.contact,
        items: cartItems.map((cartItem) => ({
          itemId: cartItem.itemId,
          quantity: cartItem.quantity,
          notes: cartItem.notes,
        })),
      });
      return data;
    },
    onSuccess: (response) => {
      clear();
      setConfirmation(`Pedido ${response.data?.code ?? ''} recebido!`);
      setIsReviewing(false);
    },
  });

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl,
    });
  };

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return items
      .filter((item) => (selectedCategory ? item.categoryId.endsWith(selectedCategory) : true))
      .filter((item) => {
        if (!normalizedSearch) {
          return true;
        }
        return (
          item.name.toLowerCase().includes(normalizedSearch) ||
          item.description.toLowerCase().includes(normalizedSearch)
        );
      });
  }, [items, searchTerm, selectedCategory]);

  const showSkeletons = isLoadingCategories || isLoadingItems;

  const handleReviewRequest = () => {
    setIsReviewing(true);
  };

  return (
    <section className="space-y-8 pb-16">
      <header className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-acai-600 via-purple-600 to-indigo-500 px-8 py-10 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                Terça do Açaí em Dobro
              </p>
              <h1 className="text-4xl font-black leading-tight">Compre um bowl e ganhe toppings extras</h1>
              <p className="max-w-3xl text-base text-white/80">
                Monte a combinação perfeita com frutas frescas, bases cremosas e toppings crocantes. Promoção válida para pedidos feitos pelo cardápio digital.
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-2xl bg-white/90 px-6 py-3 text-base font-semibold text-acai-700 shadow-xl shadow-acai-400/40 transition hover:-translate-y-0.5"
              onClick={() => setSelectedCategory(undefined)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
              Pedir Agora
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] bg-gradient-to-r from-acai-600 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Cardápio
            </p>
            <h2 className="text-2xl font-black text-slate-900">
              {selectedCategory
                ? categories.find((cat) => cat.slug === selectedCategory)?.name ?? 'Todos'
                : 'Todos'}{' '}
              <span className="text-base font-semibold text-slate-500">({filteredItems.length} itens)</span>
            </h2>
          </div>
          <label className="relative w-full max-w-sm">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-md shadow-acai-900/10">
                <img src="/icons/search.svg" alt="Buscar" className="h-6 w-6" />
              </span>
            </span>
            <input
              type="search"
              placeholder="Buscar delícias..."
              className="w-full rounded-2xl border border-white/40 bg-white/70 px-14 py-3 text-sm font-medium text-slate-700 shadow-lg shadow-acai-900/5 backdrop-blur focus:border-acai-300 focus:outline-none focus:ring-2 focus:ring-acai-200"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
        </div>
      </header>

      {confirmation && (
        <div className="rounded-2xl border border-lime-200 bg-lime-50 px-6 py-4 text-lime-900">
          {confirmation}
        </div>
      )}

      {categories.length > 0 && (
        <MenuCategoryTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={(slug) => setSelectedCategory(slug)}
        />
      )}

      {showSkeletons ? (
        <p>Carregando cardápio...</p>
      ) : (
        <>
          {filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center text-slate-500">
              Nenhum item encontrado para sua busca. Experimente outra combinação ou volte para "Todos".
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} onAdd={handleAddToCart} />
              ))}
            </div>
          )}
        </>
      )}

      <CartDrawer onReview={handleReviewRequest} />

      <OrderReviewModal
        isOpen={isReviewing}
        onClose={() => setIsReviewing(false)}
        onSubmit={(payload) => createOrder.mutate(payload)}
      />
    </section>
  );
};

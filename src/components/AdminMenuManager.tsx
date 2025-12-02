import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { api } from '../services/api';
import { MenuCategory, MenuItem } from '../types/api';

interface Props {
  categories: MenuCategory[];
  items: MenuItem[];
  refetchItems: () => void;
  isLoading: boolean;
}

interface FormState {
  id?: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  ingredients: string;
  tags: string;
  isAvailable: boolean;
}

const emptyForm = (categoryId?: string): FormState => ({
  name: '',
  description: '',
  price: '',
  categoryId: categoryId ?? '',
  imageUrl: '',
  ingredients: '',
  tags: '',
  isAvailable: true,
});

const parseList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const mapFormToPayload = (payload: FormState) => ({
  name: payload.name,
  description: payload.description,
  price: Number(payload.price),
  categoryId: payload.categoryId,
  imageUrl: payload.imageUrl || undefined,
  ingredients: parseList(payload.ingredients),
  tags: parseList(payload.tags),
  isAvailable: payload.isAvailable,
});

const mapItemToPayload = (item: MenuItem, overrides?: Partial<MenuItem>) => ({
  name: overrides?.name ?? item.name,
  description: overrides?.description ?? item.description,
  price: overrides?.price ?? item.price,
  categoryId: overrides?.categoryId ?? item.categoryId,
  imageUrl: overrides?.imageUrl ?? item.imageUrl ?? undefined,
  ingredients: overrides?.ingredients ?? item.ingredients,
  tags: overrides?.tags ?? item.tags ?? [],
  isAvailable: overrides?.isAvailable ?? item.isAvailable,
  options:
    (overrides?.options ?? item.options)?.map((option) => ({
      label: option.label,
      values: option.values,
    })) ?? undefined,
});

export const AdminMenuManager = ({ categories, items, refetchItems, isLoading }: Props) => {
  const [formState, setFormState] = useState<FormState>(() => emptyForm(categories[0]?.id));
  const [feedback, setFeedback] = useState<string | null>(null);
  const categoryLabels = useMemo(() => Object.fromEntries(categories.map((category) => [category.id, category.name])), [categories]);
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  useEffect(() => {
    if (!formState.categoryId && categories.length > 0) {
      setFormState((prev) => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories, formState.categoryId]);

  const saveMutation = useMutation({
    mutationFn: async (payload: FormState) => {
      const body = mapFormToPayload(payload);

      if (payload.id) {
        const { data } = await api.put(`/admin/menu/items/${payload.id}`, body);
        return data;
      }
      const { data } = await api.post('/admin/menu/items', body);
      return data;
    },
    onSuccess: (_, variables) => {
      refetchItems();
      setFeedback(variables.id ? 'Item atualizado!' : 'Item cadastrado!');
      setFormState(emptyForm(categories[0]?.id));
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/admin/menu/items/${itemId}`);
    },
    onSuccess: () => {
      refetchItems();
      setFeedback('Item removido do cardápio.');
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  const availabilityMutation = useMutation({
    mutationFn: async ({ item, isAvailable }: { item: MenuItem; isAvailable: boolean }) => {
      const body = mapItemToPayload(item, { isAvailable });
      const { data } = await api.put(`/admin/menu/items/${item.id}`, body);
      return data;
    },
    onMutate: ({ item }) => {
      setPendingToggleId(item.id);
    },
    onSuccess: (_, variables) => {
      refetchItems();
      setFeedback(variables.isAvailable ? 'Item disponível para pedidos.' : 'Item pausado do cardápio.');
      setTimeout(() => setFeedback(null), 4000);
    },
    onSettled: () => setPendingToggleId(null),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveMutation.mutate(formState);
  };

  const handleEdit = (item: MenuItem) => {
    setFormState({
      id: item.id,
      name: item.name,
      description: item.description,
      price: String(item.price),
      categoryId: item.categoryId,
      imageUrl: item.imageUrl ?? '',
      ingredients: item.ingredients.join(', '),
      tags: item.tags?.join(', ') ?? '',
      isAvailable: item.isAvailable,
    });
  };

  const handleDelete = (itemId: string) => {
    if (confirm('Tem certeza que deseja remover este item do cardápio?')) {
      deleteMutation.mutate(itemId);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">Gerenciar cardápio</h2>
        <p className="text-sm text-slate-500">Cadastre, atualize ou remova itens. Alterações aparecem imediatamente para os clientes.</p>
      </header>

      {feedback && (
        <p className="rounded-2xl bg-lime-50 px-4 py-2 text-sm text-lime-700">{feedback}</p>
      )}

      <form className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600" htmlFor="name">
              Nome
            </label>
            <input
              id="name"
              name="name"
              required
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600" htmlFor="price">
              Preço (R$)
            </label>
            <input
              id="price"
              name="price"
              required
              type="number"
              step="0.5"
              value={formState.price}
              onChange={(event) => setFormState((prev) => ({ ...prev, price: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600" htmlFor="categoryId">
              Categoria
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              value={formState.categoryId}
              onChange={(event) => setFormState((prev) => ({ ...prev, categoryId: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600" htmlFor="imageUrl">
              URL da imagem
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              value={formState.imageUrl}
              onChange={(event) => setFormState((prev) => ({ ...prev, imageUrl: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
              placeholder="https://..."
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600" htmlFor="description">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={3}
            value={formState.description}
            onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600" htmlFor="ingredients">
              Ingredientes (separe por vírgula)
            </label>
            <textarea
              id="ingredients"
              name="ingredients"
              required
              rows={2}
              value={formState.ingredients}
              onChange={(event) => setFormState((prev) => ({ ...prev, ingredients: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600" htmlFor="tags">
              Tags (opcional)
            </label>
            <textarea
              id="tags"
              name="tags"
              rows={2}
              value={formState.tags}
              onChange={(event) => setFormState((prev) => ({ ...prev, tags: event.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2"
              placeholder="vegano, promoção"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={formState.isAvailable}
            onChange={(event) => setFormState((prev) => ({ ...prev, isAvailable: event.target.checked }))}
          />
          Disponível para pedidos
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="rounded-2xl bg-acai-600 px-6 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {formState.id ? 'Atualizar item' : 'Cadastrar item'}
          </button>
          {formState.id && (
            <button
              type="button"
              onClick={() => setFormState(emptyForm(categories[0]?.id))}
              className="rounded-2xl border border-slate-200 px-6 py-2 font-semibold text-slate-600"
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">Itens cadastrados</h3>
        {isLoading ? (
          <p className="text-sm text-slate-500">Carregando itens...</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold">{item.name}</p>
                    <p className="text-xs text-slate-400">{categoryLabels[item.categoryId] ?? 'Sem categoria'}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">R$ {item.price.toFixed(2)}</p>
                    <p className={`text-xs font-semibold ${item.isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {item.isAvailable ? 'Disponível' : 'Indisponível'}
                    </p>
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{item.description}</p>
                <div className="mt-3 flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="rounded-full border border-slate-200 px-3 py-1 font-semibold"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-full border border-rose-200 px-3 py-1 font-semibold text-rose-600"
                  >
                    Remover
                  </button>
                  <button
                    type="button"
                    onClick={() => availabilityMutation.mutate({ item, isAvailable: !item.isAvailable })}
                    disabled={pendingToggleId === item.id && availabilityMutation.isPending}
                    className={`rounded-full border px-3 py-1 font-semibold ${
                      item.isAvailable
                        ? 'border-amber-200 text-amber-700'
                        : 'border-emerald-200 text-emerald-700'
                    } ${pendingToggleId === item.id && availabilityMutation.isPending ? 'opacity-50' : ''}`}
                  >
                    {item.isAvailable ? 'Pausar vendas' : 'Reativar'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

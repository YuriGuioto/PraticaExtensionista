import { useQuery } from '@tanstack/react-query';

import { api } from '../services/api.ts';
import { MenuCategory, MenuItem } from '../types/api.ts';

export const useMenuCategories = () =>
  useQuery({
    queryKey: ['menu', 'categories'],
    queryFn: async () => {
      const { data } = await api.get<{ data: MenuCategory[] }>('/menu/categories');
      return data.data;
    },
  });

export const useMenuItems = (category?: string) =>
  useQuery({
    queryKey: ['menu', 'items', category ?? 'all'],
    queryFn: async () => {
      const { data } = await api.get<{ data: MenuItem[] }>('/menu/items', {
        params: category ? { category } : undefined,
      });
      return data.data;
    },
  });

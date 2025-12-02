export interface MenuCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  highlight?: string;
  sortOrder: number;
}

export interface MenuItemOption {
  label: string;
  values: string[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  tags?: string[];
  baseSize?: string;
  options?: MenuItemOption[];
}

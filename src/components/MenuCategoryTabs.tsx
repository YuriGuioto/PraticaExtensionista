import { MenuCategory } from '../types/api.ts';

interface Props {
  categories: MenuCategory[];
  selected?: string;
  onSelect: (slug?: string) => void;
}

export const MenuCategoryTabs = ({ categories, selected, onSelect }: Props) => {
  return (
    <div className="flex flex-wrap gap-3 border-b border-white/20 pb-4">
      <button
        type="button"
        onClick={() => onSelect(undefined)}
        className={`rounded-full px-5 py-2 text-sm font-semibold transition hover:text-acai-700 ${
          !selected ? 'bg-white/70 text-acai-700 shadow-md shadow-acai-100 backdrop-blur' : 'text-slate-500'
        }`}
      >
        Todos
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.slug)}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition hover:text-acai-700 ${
            selected === category.slug
              ? 'bg-white/70 text-acai-700 shadow-md shadow-acai-100 backdrop-blur'
              : 'text-slate-500'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

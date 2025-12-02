import { MenuItem } from '../types/api.ts';

interface Props {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export const MenuItemCard = ({ item, onAdd }: Props) => {
  const preparationTime = item.baseSize ?? '15-20 min';

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-white/70 via-white/20 to-white/5 shadow-2xl shadow-acai-900/5 backdrop-blur-xl">
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
          loading="lazy"
        />
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
          {preparationTime}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-5 py-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {item.description}
          </p>
        </div>
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">A partir de</span>
            <p className="text-2xl font-black text-acai-700">R$ {item.price.toFixed(2)}</p>
          </div>
          <button
            type="button"
            disabled={!item.isAvailable}
            onClick={() => onAdd(item)}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg transition ${
              item.isAvailable
                ? 'bg-gradient-to-br from-acai-600 to-indigo-500 hover:from-acai-500 hover:to-indigo-400'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
};

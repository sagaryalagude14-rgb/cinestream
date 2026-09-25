import React from 'react';
import { DEFAULT_CATEGORIES } from '../../utils/constants';

interface CategoryPillsProps {
  activeCategory: string;
  onSelectCategory: (id: string, genreId?: number) => void;
  categories?: Array<{ id: string; name: string; genreId?: number }>;
  className?: string;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  activeCategory,
  onSelectCategory,
  categories = DEFAULT_CATEGORIES,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-x-auto no-scrollbar py-2 ${className}`}>
      <div className="flex items-center gap-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id, cat.genreId)}
              className={`whitespace-nowrap px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 shrink-0 ${
                isActive
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-md'
                  : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800/80'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import { X, SlidersHorizontal, RotateCcw, Check, Star } from 'lucide-react';
import { GENRE_MAP } from '../../utils/constants';

export interface FilterState {
  minRating: number;
  minYear: number;
  maxYear: number;
  mediaType: 'all' | 'movie' | 'tv';
  sortBy: 'popularity' | 'rating' | 'newest' | 'title';
  selectedGenres: number[];
}

export const DEFAULT_FILTER_STATE: FilterState = {
  minRating: 6.0,
  minYear: 2000,
  maxYear: 2026,
  mediaType: 'all',
  sortBy: 'popularity',
  selectedGenres: [],
};

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  totalMatchesCount?: number;
}

const AVAILABLE_GENRES = [
  { id: 878, name: 'Sci-Fi' },
  { id: 28, name: 'Action' },
  { id: 18, name: 'Drama' },
  { id: 16, name: 'Animation' },
  { id: 9648, name: 'Mystery' },
  { id: 35, name: 'Comedy' },
  { id: 12, name: 'Adventure' },
  { id: 80, name: 'Crime' },
];

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onChange,
  onReset,
  totalMatchesCount,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const toggleGenre = (genreId: number) => {
    const exists = filters.selectedGenres.includes(genreId);
    const updated = exists
      ? filters.selectedGenres.filter((id) => id !== genreId)
      : [...filters.selectedGenres, genreId];
    onChange({ ...filters, selectedGenres: updated });
  };

  const isFiltered =
    filters.minRating > 6.0 ||
    filters.minYear > 2000 ||
    filters.maxYear < 2026 ||
    filters.mediaType !== 'all' ||
    filters.sortBy !== 'popularity' ||
    filters.selectedGenres.length > 0;

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md h-full bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-slideInRight">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-800 text-red-500">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">Advanced Filters</h2>
              <p className="text-[11px] text-zinc-400">Refine discovery across ratings, years & genres</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close filters drawer"
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Media Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5">
              Media Type
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => onChange({ ...filters, mediaType: 'all' })}
                className={`py-2 text-xs font-medium rounded-lg transition-colors ${
                  filters.mediaType === 'all'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Titles
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...filters, mediaType: 'movie' })}
                className={`py-2 text-xs font-medium rounded-lg transition-colors ${
                  filters.mediaType === 'movie'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Movies Only
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...filters, mediaType: 'tv' })}
                className={`py-2 text-xs font-medium rounded-lg transition-colors ${
                  filters.mediaType === 'tv'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                TV Shows
              </button>
            </div>
          </div>

          {/* Sort Order Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onChange({
                  ...filters,
                  sortBy: e.target.value as FilterState['sortBy'],
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-750 text-xs text-zinc-200 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="popularity">Most Popular / Trending</option>
              <option value="rating">Highest Rated (IMDb / Critics)</option>
              <option value="newest">Latest Release Date</option>
              <option value="title">Alphabetical (A - Z)</option>
            </select>
          </div>

          {/* Rating Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Minimum Rating
              </label>
              <span className="flex items-center gap-1 font-mono text-xs font-bold text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                <span>{filters.minRating.toFixed(1)} / 10</span>
              </span>
            </div>
            <input
              type="range"
              min="5.0"
              max="9.5"
              step="0.1"
              value={filters.minRating}
              onChange={(e) =>
                onChange({
                  ...filters,
                  minRating: parseFloat(e.target.value),
                })
              }
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
              <span>5.0</span>
              <span>7.0</span>
              <span>8.5</span>
              <span>9.5</span>
            </div>
          </div>

          {/* Release Year Range Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Release Window
              </label>
              <span className="font-mono text-xs font-semibold text-zinc-200">
                {filters.minYear} – {filters.maxYear}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-zinc-400 block mb-1">From Year</span>
                <select
                  value={filters.minYear}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      minYear: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-750 text-xs text-zinc-200 focus:outline-none"
                >
                  {[1990, 1995, 2000, 2005, 2010, 2015, 2020, 2024].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block mb-1">To Year</span>
                <select
                  value={filters.maxYear}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      maxYear: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-750 text-xs text-zinc-200 focus:outline-none"
                >
                  {[2015, 2020, 2022, 2024, 2025, 2026].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Genre Multi-Select Pills */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5">
              Specific Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_GENRES.map((g) => {
                const isSelected = filters.selectedGenres.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGenre(g.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    <span>{g.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            disabled={!isFiltered}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              isFiltered
                ? 'text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700'
                : 'text-zinc-600 bg-zinc-900 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Show Results {typeof totalMatchesCount === 'number' ? `(${totalMatchesCount})` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

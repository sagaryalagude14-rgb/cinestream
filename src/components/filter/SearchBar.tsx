import React, { useRef, useState, useEffect } from 'react';
import { Search, X, Star, Film, ArrowRight, Sparkles } from 'lucide-react';
import { MediaItem } from '../../types/media';
import { TMDB_IMAGE_BASE_W500, formatYear, getDisplayTitle } from '../../utils/constants';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  suggestions?: MediaItem[];
  onSelectSuggestion?: (item: MediaItem) => void;
  onSelectGenreTag?: (genreId: number, genreName: string) => void;
  activeGenreId?: number;
}

const QUICK_GENRE_TAGS = [
  { id: 878, name: 'Sci-Fi' },
  { id: 28, name: 'Action' },
  { id: 16, name: 'Animation' },
  { id: 18, name: 'Drama' },
  { id: 35, name: 'Comedy' },
  { id: 53, name: 'Thriller' },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search movies, TV shows, actors, genres...',
  autoFocus = false,
  className = '',
  suggestions = [],
  onSelectSuggestion,
  onSelectGenreTag,
  activeGenreId,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const topSuggestions = suggestions.slice(0, 4);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (onSubmit) onSubmit();
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-zinc-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onFocus={() => {
              if (value.trim().length > 0) setShowDropdown(true);
            }}
            onChange={(e) => {
              onChange(e.target.value);
              setShowDropdown(true);
            }}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full pl-12 pr-12 py-3.5 bg-zinc-900/90 border border-zinc-750 rounded-2xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 shadow-xl transition-all"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setShowDropdown(false);
                inputRef.current?.focus();
              }}
              aria-label="Clear search query"
              className="absolute right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Instant Auto-Suggest Dropdown (Top 4 Matches) */}
      {showDropdown && value.trim().length > 0 && topSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-2xl backdrop-blur-xl overflow-hidden p-2 animate-fadeIn">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between border-b border-zinc-800/80 mb-1">
            <span>Instant Matches</span>
            <span className="text-zinc-500 font-normal">Press Enter for full results</span>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {topSuggestions.map((item) => {
              const title = getDisplayTitle(item);
              const year = formatYear(item.release_date || item.first_air_date);
              const poster = item.poster_path
                ? item.poster_path.startsWith('http') || item.poster_path.startsWith('/src/assets')
                  ? item.poster_path
                  : `${TMDB_IMAGE_BASE_W500}${item.poster_path}`
                : '';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setShowDropdown(false);
                    if (onSelectSuggestion) onSelectSuggestion(item);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/80 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Tiny Thumbnail */}
                    <div className="h-12 w-9 rounded-md bg-zinc-850 shrink-0 overflow-hidden relative border border-zinc-800">
                      {poster ? (
                        <img
                          src={poster}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                          <Film className="h-4 w-4 text-zinc-500" />
                        </div>
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-white group-hover:text-red-400 transition-colors truncate">
                        {title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                        <span>{year}</span>
                        <span aria-hidden="true" className="text-zinc-600">·</span>
                        <span className="flex items-center gap-0.5 text-amber-400 font-mono">
                          <Star className="h-3 w-3 fill-amber-400" />
                          <span>{item.vote_average ? item.vote_average.toFixed(1) : '8.2'}</span>
                        </span>
                        <span aria-hidden="true" className="text-zinc-600">·</span>
                        <span className="uppercase text-[10px] text-zinc-500">
                          {item.media_type === 'tv' ? 'Series' : 'Movie'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-zinc-500 group-hover:text-white transition-colors pl-2">
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Genre Tags Below Search Input */}
      {onSelectGenreTag && (
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-zinc-500 font-medium mr-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-red-500" />
            <span>Tags:</span>
          </span>
          {QUICK_GENRE_TAGS.map((tag) => {
            const isSelected = activeGenreId === tag.id;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onSelectGenreTag(tag.id, tag.name)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-sm shadow-red-950'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

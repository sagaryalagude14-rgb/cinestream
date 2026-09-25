import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/filter/SearchBar';
import { FilterDrawer, FilterState, DEFAULT_FILTER_STATE } from '../components/filter/FilterDrawer';
import { MediaGrid } from '../components/media/MediaGrid';
import { VideoPreviewModal } from '../components/media/VideoPreviewModal';
import { useFetchMedia } from '../hooks/useFetchMedia';
import { useDebounce } from '../hooks/useDebounce';
import { useModal } from '../hooks/useModal';
import { useProfile } from '../context/ProfileContext';
import { GENRE_MAP, formatYear } from '../utils/constants';
import { MediaItem } from '../types/media';
import { SlidersHorizontal, X, Star, Sparkles, RotateCcw } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);

  const { activeProfile, filterForActiveProfile } = useProfile();
  const { isOpen, selectedMedia, openModal, closeModal } = useModal();

  // Advanced Filter Drawer State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  // Sync debounced search to URL search param
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setSearchParams({ q: debouncedQuery.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [debouncedQuery, setSearchParams]);

  // Fetch search or trending candidates
  const endpoint = debouncedQuery.trim() ? `/search/multi` : `/trending/all/week`;
  const { data, loading } = useFetchMedia(endpoint, {
    query: debouncedQuery.trim(),
  });

  // Calculate active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.minRating > 6.0) count++;
    if (filters.minYear > 2000 || filters.maxYear < 2026) count++;
    if (filters.mediaType !== 'all') count++;
    if (filters.sortBy !== 'popularity') count++;
    count += filters.selectedGenres.length;
    return count;
  }, [filters]);

  // Combined Filtering & Sorting
  const processedResults = useMemo(() => {
    // 1. Profile Kids filter
    let list = filterForActiveProfile(data);

    // 2. Media Type filter
    if (filters.mediaType !== 'all') {
      list = list.filter((item) => item.media_type === filters.mediaType);
    }

    // 3. Minimum Rating filter
    if (filters.minRating > 5.0) {
      list = list.filter((item) => (item.vote_average || 8.0) >= filters.minRating);
    }

    // 4. Release Year range filter
    list = list.filter((item) => {
      const year = parseInt(formatYear(item.release_date || item.first_air_date), 10);
      return year >= filters.minYear && year <= filters.maxYear;
    });

    // 5. Selected Genre tags filter
    if (filters.selectedGenres.length > 0) {
      list = list.filter((item) =>
        filters.selectedGenres.some((gid) => item.genre_ids?.includes(gid))
      );
    }

    // 6. Sorting
    const sorted = [...list];
    if (filters.sortBy === 'rating') {
      sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (filters.sortBy === 'newest') {
      sorted.sort((a, b) => {
        const dateA = a.release_date || a.first_air_date || '1970-01-01';
        const dateB = b.release_date || b.first_air_date || '1970-01-01';
        return dateB.localeCompare(dateA);
      });
    } else if (filters.sortBy === 'title') {
      sorted.sort((a, b) => {
        const titleA = a.title || a.name || '';
        const titleB = b.title || b.name || '';
        return titleA.localeCompare(titleB);
      });
    }

    return sorted;
  }, [data, filterForActiveProfile, filters]);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTER_STATE);
  };

  const handleToggleGenreTag = (genreId: number) => {
    setFilters((prev) => {
      const exists = prev.selectedGenres.includes(genreId);
      return {
        ...prev,
        selectedGenres: exists
          ? prev.selectedGenres.filter((id) => id !== genreId)
          : [...prev.selectedGenres, genreId],
      };
    });
  };

  const popularSearches = activeProfile.isKidsMode
    ? ['Spider-Man', 'Arcane', 'Interstellar', 'Animation', 'Adventure']
    : ['Interstellar', 'Cyberpunk', 'Dune', 'Batman', 'Arcane', 'Severance'];

  return (
    <div className="w-full min-h-screen bg-zinc-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header and Smart Search Bar */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight mb-2">
          Discover & Search
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mb-6">
          Query by titles, cast, directors, or refine by critic ratings and release windows.
        </p>

        {/* Smart Search Bar with Auto-suggest & Quick Tags */}
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search by title, director, keyword..."
          autoFocus={!initialQuery}
          suggestions={filterForActiveProfile(data)}
          onSelectSuggestion={(item) => openModal(item)}
          onSelectGenreTag={handleToggleGenreTag}
          activeGenreId={filters.selectedGenres[0]}
        />

        {/* Popular Searches */}
        {!query && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400">
            <span className="flex items-center gap-1 text-zinc-500">
              <Sparkles className="h-3.5 w-3.5 text-red-500" />
              <span>Trending:</span>
            </span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Control Bar: Results Info + Filter Drawer Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-zinc-850">
        <div className="text-xs sm:text-sm text-zinc-400 flex items-center gap-2">
          {debouncedQuery.trim() ? (
            <span>
              Results for <strong className="text-white">"{debouncedQuery}"</strong> ({processedResults.length} titles)
            </span>
          ) : (
            <span>
              Curated Catalogue ({processedResults.length} titles)
            </span>
          )}
        </div>

        {/* Filter Drawer Trigger Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              activeFiltersCount > 0
                ? 'bg-red-950/40 border-red-500/60 text-red-400 hover:bg-red-900/50'
                : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-750 text-zinc-200'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Advanced Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white leading-none">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Pill Tags Row with Instant Clear */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-fadeIn">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">
            Active:
          </span>

          {/* Rating Pill */}
          {filters.minRating > 6.0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs border border-zinc-700">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>★ {filters.minRating.toFixed(1)}+</span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, minRating: 6.0 }))}
                className="hover:text-red-400 transition-colors p-0.5 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Year Range Pill */}
          {(filters.minYear > 2000 || filters.maxYear < 2026) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs border border-zinc-700">
              <span>{filters.minYear} – {filters.maxYear}</span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, minYear: 2000, maxYear: 2026 }))}
                className="hover:text-red-400 transition-colors p-0.5 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Media Type Pill */}
          {filters.mediaType !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs border border-zinc-700">
              <span>{filters.mediaType === 'movie' ? 'Movies Only' : 'TV Shows Only'}</span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, mediaType: 'all' }))}
                className="hover:text-red-400 transition-colors p-0.5 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Sort Pill */}
          {filters.sortBy !== 'popularity' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs border border-zinc-700">
              <span>Sorted: {filters.sortBy}</span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, sortBy: 'popularity' }))}
                className="hover:text-red-400 transition-colors p-0.5 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Genre Tags */}
          {filters.selectedGenres.map((gid) => (
            <span
              key={gid}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/60 text-red-300 text-xs border border-red-800/80"
            >
              <span>{GENRE_MAP[gid] || `Genre ${gid}`}</span>
              <button
                onClick={() => handleToggleGenreTag(gid)}
                className="hover:text-white transition-colors p-0.5 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {/* Clear All Button */}
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2 py-1 transition-colors ml-auto cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Clear All</span>
          </button>
        </div>
      )}

      {/* Results Media Grid */}
      <MediaGrid
        items={processedResults}
        loading={loading}
        aspectRatio="portrait"
        onSelectMedia={openModal}
        emptyTitle={
          query
            ? `No matches found for "${query}"`
            : 'No titles match these active filters'
        }
        emptyDescription="Try lowering your minimum rating or clearing specific genre tags."
        onClearFilter={() => {
          setQuery('');
          handleResetFilters();
        }}
      />

      {/* Advanced Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        totalMatchesCount={processedResults.length}
      />

      {/* Detail Modal */}
      <VideoPreviewModal
        isOpen={isOpen}
        onClose={closeModal}
        item={selectedMedia}
      />
    </div>
  );
};

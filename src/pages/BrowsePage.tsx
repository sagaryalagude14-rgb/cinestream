import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LayoutGrid, Rows3, SlidersHorizontal, Film, Tv, Shield } from 'lucide-react';
import { useFetchMedia } from '../hooks/useFetchMedia';
import { useModal } from '../hooks/useModal';
import { useProfile } from '../context/ProfileContext';
import { MediaGrid } from '../components/media/MediaGrid';
import { MediaRow } from '../components/media/MediaRow';
import { VideoPreviewModal } from '../components/media/VideoPreviewModal';
import { CategoryPills } from '../components/filter/CategoryPills';
import { MediaItem } from '../types/media';

export const BrowsePage: React.FC = () => {
  const { type = 'movies' } = useParams<{ type: string }>();
  const isMovie = type === 'movies';
  const mediaType = isMovie ? 'movie' : 'tv';
  const { activeProfile, filterForActiveProfile } = useProfile();

  const [viewMode, setViewMode] = useState<'grid' | 'slider'>('grid');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeGenreId, setActiveGenreId] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'rating' | 'newest' | 'title'>('rating');

  const { isOpen, selectedMedia, openModal, closeModal } = useModal();

  // Fetch primary list
  const endpoint = isMovie ? '/discover/movie' : '/discover/tv';
  const { data, loading, refetch } = useFetchMedia(endpoint, {
    sort_by: sortBy === 'rating' ? 'vote_average.desc' : 'popularity.desc',
    ...(activeGenreId ? { with_genres: activeGenreId } : {}),
  });

  const handleSelectCategory = (id: string, genreId?: number) => {
    setActiveCategory(id);
    setActiveGenreId(genreId);
  };

  // Sort and filter results
  const processedItems = useMemo(() => {
    let list = [...data];

    // Filter by media_type if endpoint returned mixed
    list = list.filter((item) => (item.media_type ? item.media_type === mediaType : true));

    // Client-side fallback filter by genre if needed
    if (activeGenreId) {
      list = list.filter((item) => item.genre_ids?.includes(activeGenreId));
    }

    // Sort
    if (sortBy === 'rating') {
      list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => {
        const dateA = a.release_date || a.first_air_date || '1970-01-01';
        const dateB = b.release_date || b.first_air_date || '1970-01-01';
        return dateB.localeCompare(dateA);
      });
    } else if (sortBy === 'title') {
      list.sort((a, b) => {
        const titleA = a.title || a.name || '';
        const titleB = b.title || b.name || '';
        return titleA.localeCompare(titleB);
      });
    }

    return filterForActiveProfile(list);
  }, [data, mediaType, activeGenreId, sortBy, filterForActiveProfile]);

  // Split into genre groups for slider view mode
  const genreGroups = useMemo(() => {
    if (viewMode !== 'slider') return [];
    const groups: { title: string; items: MediaItem[] }[] = [
      {
        title: 'Top Rated In Selection',
        items: [...processedItems].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0)).slice(0, 10),
      },
      {
        title: 'Recently Added & Released',
        items: [...processedItems].slice().reverse().slice(0, 10),
      },
      {
        title: 'Sci-Fi & High Concept',
        items: processedItems.filter((i) => i.genre_ids?.includes(878) || i.genre_ids?.includes(10765)),
      },
      {
        title: 'Action & Thrillers',
        items: processedItems.filter((i) => i.genre_ids?.includes(28) || i.genre_ids?.includes(53)),
      },
    ];
    return groups.filter((g) => g.items.length > 0);
  }, [processedItems, viewMode]);

  return (
    <div className="w-full min-h-screen bg-zinc-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Title & Type Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-850">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold tracking-wider text-red-500 uppercase">
            {isMovie ? <Film className="h-4 w-4" /> : <Tv className="h-4 w-4" />}
            <span>{isMovie ? 'Feature Films Catalogue' : 'Television & Series'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight">
            Browse {isMovie ? 'Movies' : 'TV Shows'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Discover {processedItems.length} titles streaming in high-definition audio & video.
          </p>
        </div>

        {/* View Mode & Sorting Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300">
            <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'newest' | 'title')}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="rating" className="bg-zinc-900 text-zinc-200">Highest Rated</option>
              <option value="newest" className="bg-zinc-900 text-zinc-200">Latest Release</option>
              <option value="title" className="bg-zinc-900 text-zinc-200">Alphabetical (A-Z)</option>
            </select>
          </div>

          {/* Grid vs. Slider Layout Toggle */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid layout"
              title="Grid View"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('slider')}
              aria-label="Carousel layout"
              title="Slider View"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'slider'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Rows3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="my-6">
        <CategoryPills
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />
      </div>

      {/* Viewport Display: Grid or Slider */}
      {viewMode === 'grid' ? (
        <MediaGrid
          items={processedItems}
          loading={loading}
          aspectRatio="portrait"
          onSelectMedia={openModal}
          onClearFilter={() => {
            setActiveCategory('all');
            setActiveGenreId(undefined);
            refetch();
          }}
        />
      ) : (
        <div className="space-y-6">
          {genreGroups.map((group, idx) => (
            <MediaRow
              key={idx}
              title={group.title}
              items={group.items}
              loading={loading}
              aspectRatio="landscape"
              onSelectMedia={openModal}
            />
          ))}
        </div>
      )}

      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={isOpen}
        onClose={closeModal}
        item={selectedMedia}
      />
    </div>
  );
};

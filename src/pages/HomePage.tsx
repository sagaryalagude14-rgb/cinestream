import React, { useState, useMemo } from 'react';
import { HeroBanner } from '../components/media/HeroBanner';
import { MediaRow } from '../components/media/MediaRow';
import { VideoPreviewModal } from '../components/media/VideoPreviewModal';
import { CategoryPills } from '../components/filter/CategoryPills';
import { useFetchMedia } from '../hooks/useFetchMedia';
import { useModal } from '../hooks/useModal';
import { useWatchHistory } from '../context/WatchHistoryContext';
import { useProfile } from '../context/ProfileContext';
import { MediaItem } from '../types/media';
import { Shield } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isOpen, selectedMedia, openModal, closeModal } = useModal();
  const { watchHistory, removeFromHistory } = useWatchHistory();
  const { activeProfile, filterForActiveProfile } = useProfile();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeGenreId, setActiveGenreId] = useState<number | undefined>(undefined);

  // Derive continue watching items from watchHistory
  const continueWatchingItems = useMemo(() => {
    const rawItems = watchHistory
      .filter((h) => h.media && h.duration > 0 && h.currentTime < h.duration * 0.98)
      .map((h) => h.media);
    return filterForActiveProfile(rawItems);
  }, [watchHistory, filterForActiveProfile]);

  // Fetch multiple categories
  const trending = useFetchMedia('/trending/all/week');
  const topRated = useFetchMedia('/movie/top_rated');
  const sciFi = useFetchMedia('/discover/movie', { with_genres: 878 });
  const action = useFetchMedia('/discover/movie', { with_genres: 28 });
  const tvSeries = useFetchMedia('/discover/tv');

  // Filter lists based on active profile (Kids vs Standard)
  const filteredTrending = useMemo(() => filterForActiveProfile(trending.data), [trending.data, filterForActiveProfile]);
  const filteredTopRated = useMemo(() => filterForActiveProfile(topRated.data), [topRated.data, filterForActiveProfile]);
  const filteredSciFi = useMemo(() => filterForActiveProfile(sciFi.data), [sciFi.data, filterForActiveProfile]);
  const filteredAction = useMemo(() => filterForActiveProfile(action.data), [action.data, filterForActiveProfile]);
  const filteredTvSeries = useMemo(() => filterForActiveProfile(tvSeries.data), [tvSeries.data, filterForActiveProfile]);

  const handleSelectCategory = (id: string, genreId?: number) => {
    setActiveCategory(id);
    setActiveGenreId(genreId);
  };

  // Filter items for interactive category pills
  const filteredHighlights = useMemo(() => {
    if (activeCategory === 'all') return null;
    const allItems = [
      ...filteredTrending,
      ...filteredTopRated,
      ...filteredSciFi,
      ...filteredAction,
      ...filteredTvSeries,
    ];
    // Remove duplicates
    const uniqueMap = new Map<number, MediaItem>();
    allItems.forEach((item) => uniqueMap.set(item.id, item));
    const unique = Array.from(uniqueMap.values());

    if (activeCategory === 'trending') return filteredTrending;
    if (activeCategory === 'top_rated') return filteredTopRated;
    if (activeGenreId) {
      return unique.filter((item) => item.genre_ids?.includes(activeGenreId));
    }
    return unique;
  }, [activeCategory, activeGenreId, filteredTrending, filteredTopRated, filteredSciFi, filteredAction, filteredTvSeries]);

  const heroItems = filteredTrending.length > 0 ? filteredTrending : filteredTopRated;

  return (
    <div className="w-full min-h-screen bg-zinc-950 pb-16">
      {/* Featured Hero Banner */}
      <HeroBanner
        items={heroItems}
        onOpenModal={openModal}
      />

      {/* Main Content Area */}
      <div className="relative z-20 -mt-8 sm:-mt-12 max-w-7xl mx-auto">
        {/* Kids Mode Notice Banner */}
        {activeProfile.isKidsMode && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mb-6 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 backdrop-blur-md flex items-center justify-between gap-3 text-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded bg-amber-500 text-zinc-950">
                <Shield className="h-4 w-4 fill-current" />
              </span>
              <span className="text-zinc-200">
                <strong className="text-amber-400">Kids Zone Active:</strong> Viewing profile "{activeProfile.name}". Mature content (TV-MA, R) and violence are hidden.
              </span>
            </div>
          </div>
        )}

        {/* Dedicated Continue Watching Row (Directly below HeroBanner, shown ONLY when watchHistory has 1+ items) */}
        {continueWatchingItems.length > 0 && (
          <div className="animate-fadeIn">
            <MediaRow
              title="Continue Watching"
              items={continueWatchingItems}
              aspectRatio="landscape"
              onSelectMedia={openModal}
              showRemoveFromHistory={true}
              onRemoveFromHistory={(id) => removeFromHistory(id)}
            />
          </div>
        )}

        {/* Interactive Category Filter Pills */}
        <div className="px-4 sm:px-6 lg:px-8 mb-4">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-900/80">
            <CategoryPills
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
            />
          </div>
        </div>

        {/* If a category is selected, show filtered showcase row */}
        {filteredHighlights && (
          <div className="animate-fadeIn">
            <MediaRow
              title={`Filtered Results (${filteredHighlights.length} titles)`}
              items={filteredHighlights}
              aspectRatio="landscape"
              onSelectMedia={openModal}
            />
          </div>
        )}

        {/* Standard Curated Rows */}
        <MediaRow
          title={activeProfile.isKidsMode ? 'Popular With Kids & Families' : 'Trending This Week'}
          items={filteredTrending}
          loading={trending.loading}
          aspectRatio="landscape"
          onSelectMedia={openModal}
        />

        <MediaRow
          title={activeProfile.isKidsMode ? 'Top Rated Family Favorites' : 'Critically Acclaimed & Top Rated'}
          items={filteredTopRated}
          loading={topRated.loading}
          aspectRatio="portrait"
          onSelectMedia={openModal}
        />

        <MediaRow
          title="Sci-Fi & Cosmic Horizons"
          items={filteredSciFi}
          loading={sciFi.loading}
          aspectRatio="landscape"
          onSelectMedia={openModal}
        />

        {filteredAction.length > 0 && (
          <MediaRow
            title={activeProfile.isKidsMode ? 'Animated Heroes & Adventures' : 'High-Octane Action & Thrillers'}
            items={filteredAction}
            loading={action.loading}
            aspectRatio="portrait"
            onSelectMedia={openModal}
          />
        )}

        {filteredTvSeries.length > 0 && (
          <MediaRow
            title={activeProfile.isKidsMode ? 'Family Shows & Cartoons' : 'Acclaimed TV Series & Dramas'}
            items={filteredTvSeries}
            loading={tvSeries.loading}
            aspectRatio="landscape"
            onSelectMedia={openModal}
          />
        )}
      </div>

      {/* Media Detail & Trailer Preview Modal */}
      <VideoPreviewModal
        isOpen={isOpen}
        onClose={closeModal}
        item={selectedMedia}
      />
    </div>
  );
};

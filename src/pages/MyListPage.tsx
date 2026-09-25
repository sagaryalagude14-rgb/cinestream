import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, Film, PlusCircle, Shield } from 'lucide-react';
import { useSavedMedia } from '../context/SavedMediaContext';
import { useProfile } from '../context/ProfileContext';
import { useModal } from '../hooks/useModal';
import { MediaGrid } from '../components/media/MediaGrid';
import { VideoPreviewModal } from '../components/media/VideoPreviewModal';

export const MyListPage: React.FC = () => {
  const { savedList, clearList } = useSavedMedia();
  const { activeProfile, filterForActiveProfile } = useProfile();
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { isOpen, selectedMedia, openModal, closeModal } = useModal();

  const profileSafeList = useMemo(
    () => filterForActiveProfile(savedList),
    [savedList, filterForActiveProfile]
  );

  const filteredItems = useMemo(() => {
    if (filterType === 'all') return profileSafeList;
    return profileSafeList.filter((item) => item.media_type === filterType);
  }, [profileSafeList, filterType]);

  return (
    <div className="w-full min-h-screen bg-zinc-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-850">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold tracking-wider text-red-500 uppercase">
            <Bookmark className="h-4 w-4" />
            <span>Personal Collection</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight">
            My Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {savedList.length} {savedList.length === 1 ? 'title' : 'titles'} saved to your library for uninterrupted streaming.
          </p>
        </div>

        {/* Action Controls */}
        {savedList.length > 0 && (
          <div className="flex items-center gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterType === 'all'
                    ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All ({savedList.length})
              </button>
              <button
                onClick={() => setFilterType('movie')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterType === 'movie'
                    ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => setFilterType('tv')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterType === 'tv'
                    ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                TV
              </button>
            </div>

            {/* Clear All Watchlist Button */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-red-950/40 hover:border-red-800/80 text-zinc-400 hover:text-red-400 text-xs transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Clear Watchlist?</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Are you sure you want to remove all {savedList.length} items from your saved library? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearList();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Grid or Empty State */}
      <div className="mt-8">
        {savedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-zinc-850 bg-zinc-900/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-850 text-zinc-500 mb-4">
              <Bookmark className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold font-display text-white mb-2">
              Your Watchlist is empty
            </h2>
            <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">
              Explore trending blockbusters, high-concept sci-fi, and acclaimed TV series to bookmark titles for later viewing.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-lg shadow-red-950/50"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Explore Home Titles</span>
              </Link>
              <Link
                to="/browse/movies"
                className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
              >
                Browse Movies
              </Link>
            </div>
          </div>
        ) : (
          <MediaGrid
            items={filteredItems}
            aspectRatio="portrait"
            onSelectMedia={openModal}
            emptyTitle="No matching titles in this category"
            emptyDescription="Try selecting 'All' to see your complete list of saved media."
          />
        )}
      </div>

      {/* Preview Modal */}
      <VideoPreviewModal
        isOpen={isOpen}
        onClose={closeModal}
        item={selectedMedia}
      />
    </div>
  );
};

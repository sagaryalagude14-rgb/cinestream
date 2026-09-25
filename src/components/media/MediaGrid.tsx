import React from 'react';
import { MediaItem } from '../../types/media';
import { MediaCard } from './MediaCard';
import { SkeletonCard } from '../common/SkeletonCard';
import { Film } from 'lucide-react';

interface MediaGridProps {
  items: MediaItem[];
  loading?: boolean;
  aspectRatio?: 'landscape' | 'portrait';
  onSelectMedia: (item: MediaItem) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onClearFilter?: () => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  loading = false,
  aspectRatio = 'portrait',
  onSelectMedia,
  emptyTitle = 'No titles found',
  emptyDescription = 'Try adjusting your search criteria or explore other categories.',
  onClearFilter,
}) => {
  if (loading) {
    return (
      <div
        className={`grid gap-4 sm:gap-5 ${
          aspectRatio === 'landscape'
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
        }`}
      >
        <SkeletonCard aspectRatio={aspectRatio} count={12} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-zinc-800/80 bg-zinc-900/40 my-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-850 text-zinc-500 mb-4">
          <Film className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-zinc-200 mb-1.5 font-display">{emptyTitle}</h3>
        <p className="text-xs text-zinc-400 max-w-md mb-6">{emptyDescription}</p>
        {onClearFilter && (
          <button
            onClick={onClearFilter}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`grid gap-4 sm:gap-5 ${
        aspectRatio === 'landscape'
          ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
      }`}
    >
      {items.map((item) => (
        <div key={`${item.id}-${item.media_type || 'm'}`} className="flex justify-center">
          <MediaCard
            item={item}
            aspectRatio={aspectRatio}
            onSelect={onSelectMedia}
          />
        </div>
      ))}
    </div>
  );
};

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '../../types/media';
import { MediaCard } from './MediaCard';
import { SkeletonCard } from '../common/SkeletonCard';

interface MediaRowProps {
  title: string;
  items: MediaItem[];
  loading?: boolean;
  aspectRatio?: 'landscape' | 'portrait';
  onSelectMedia: (item: MediaItem) => void;
  viewAllLink?: string;
  showRemoveFromHistory?: boolean;
  onRemoveFromHistory?: (mediaId: number | string, e: React.MouseEvent) => void;
}

export const MediaRow: React.FC<MediaRowProps> = ({
  title,
  items,
  loading = false,
  aspectRatio = 'landscape',
  onSelectMedia,
  showRemoveFromHistory = false,
  onRemoveFromHistory,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [items, loading]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 350);
    }
  };

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section className="relative my-8 sm:my-10 px-4 sm:px-6 lg:px-8 group">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100 font-display">
          {title}
        </h2>
      </div>

      {/* Horizontal Carousel Container */}
      <div className="relative">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            aria-label={`Scroll ${title} left`}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-r-lg bg-black/80 hover:bg-black text-white border border-l-0 border-zinc-700/80 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 focus:opacity-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          onScroll={checkScroll}
          className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
        >
          {loading ? (
            <SkeletonCard aspectRatio={aspectRatio} count={6} />
          ) : (
            items.map((item) => (
              <MediaCard
                key={`${item.id}-${item.media_type || 'm'}`}
                item={item}
                aspectRatio={aspectRatio}
                onSelect={onSelectMedia}
                showRemoveFromHistory={showRemoveFromHistory}
                onRemoveFromHistory={onRemoveFromHistory}
              />
            ))
          )}
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            aria-label={`Scroll ${title} right`}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-l-lg bg-black/80 hover:bg-black text-white border border-r-0 border-zinc-700/80 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 focus:opacity-100"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </section>
  );
};

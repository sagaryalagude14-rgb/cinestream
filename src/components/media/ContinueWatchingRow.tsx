import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, X, ChevronLeft, ChevronRight, Clock, Star, Film } from 'lucide-react';
import { MediaItem } from '../../types/media';
import { useWatchHistory } from '../../context/WatchHistoryContext';
import { getDisplayTitle, formatYear } from '../../utils/constants';

export const formatRemainingTime = (currentTime: number, duration: number): string => {
  const remainingSeconds = Math.max(0, duration - currentTime);
  const minutes = Math.floor(remainingSeconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m remaining`;
  }
  return `${minutes}m remaining`;
};

interface ContinueWatchingRowProps {
  items?: MediaItem[];
  onSelectMedia: (item: MediaItem) => void;
  onRemoveFromHistory?: (id: number) => void;
}

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({
  items,
  onSelectMedia,
  onRemoveFromHistory,
}) => {
  const navigate = useNavigate();
  const { watchHistory, getMediaProgress, removeFromHistory } = useWatchHistory();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // If items prop is provided use it, otherwise derive from context history
  const activeItems: MediaItem[] = items && items.length > 0
    ? items
    : watchHistory
        .filter((h) => h.media && h.duration > 0 && h.currentTime < h.duration * 0.98)
        .map((h) => h.media);

  if (!activeItems || activeItems.length === 0) {
    return null;
  }

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const { clientWidth } = scrollContainerRef.current;
    const scrollAmount = clientWidth * 0.75;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScrollability, 350);
  };

  return (
    <div className="relative my-6 px-4 sm:px-6 lg:px-8 group/row">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Continue Watching
            <span className="text-xs font-normal text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full border border-zinc-700/60">
              {activeItems.length}
            </span>
          </h2>
        </div>
      </div>

      <div className="relative">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
            className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/85 hover:bg-black text-white border border-zinc-700 shadow-2xl flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
            className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/85 hover:bg-black text-white border border-zinc-700 shadow-2xl flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Cards Carousel Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          className="flex items-stretch gap-4 overflow-x-auto scrollbar-none py-2 -my-2 scroll-smooth"
        >
          {activeItems.map((item) => {
            const progress = getMediaProgress(item.id);
            const currentTime = progress?.currentTime || 0;
            const duration = progress?.duration || item.duration_seconds || item.durationSeconds || 7200;
            const percent = duration > 0 ? Math.min(100, Math.max(1, Math.round((currentTime / duration) * 100))) : 0;
            const remainingLabel = formatRemainingTime(currentTime, duration);

            const title = getDisplayTitle(item);
            const year = formatYear(item.release_date || item.first_air_date);

            const imageSrc =
              item.backdropUrl ||
              item.backdrop_path ||
              item.posterUrl ||
              item.poster_path;

            const finalImageSrc = imageSrc?.startsWith('http')
              ? imageSrc
              : imageSrc
              ? `https://image.tmdb.org/t/p/w780${imageSrc}`
              : '';

            const handlePlay = (e: React.MouseEvent) => {
              e.stopPropagation();
              navigate(`/watch/${item.id}`);
            };

            const handleRemove = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (onRemoveFromHistory) {
                onRemoveFromHistory(item.id);
              } else {
                removeFromHistory(item.id);
              }
            };

            return (
              <div
                key={item.id}
                onClick={() => onSelectMedia(item)}
                className="group/card relative flex-shrink-0 w-72 sm:w-80 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black cursor-pointer flex flex-col"
              >
                {/* Image Container with Aspect Ratio */}
                <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                  {finalImageSrc ? (
                    <img
                      src={finalImageSrc}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                      onError={(e) => {
                        // High quality fallback still
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-zinc-900">
                      <Film className="w-8 h-8 text-zinc-600 mb-2" />
                      <p className="text-xs text-zinc-400 font-medium text-center line-clamp-1">{title}</p>
                    </div>
                  )}

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Remove Button (top-left) */}
                  <button
                    onClick={handleRemove}
                    aria-label={`Remove ${title} from history`}
                    title="Remove from Continue Watching"
                    className="absolute top-2.5 left-2.5 z-20 p-1.5 rounded-full bg-black/70 hover:bg-red-600 text-zinc-300 hover:text-white border border-zinc-700/80 transition-all duration-200 cursor-pointer shadow-md opacity-0 group-hover/card:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Rating Badge (top-right) */}
                  <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 border border-zinc-700/60 text-[11px] font-mono font-medium text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{item.vote_average ? item.vote_average.toFixed(1) : '8.8'}</span>
                  </div>

                  {/* Center Play Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl backdrop-blur-sm transform group-hover/card:scale-105 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Remaining Time Badge inside image frame */}
                  <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2 py-1 rounded bg-black/80 backdrop-blur-md border border-zinc-700/60 text-xs font-mono font-semibold text-white shadow-md">
                    <Clock className="w-3.5 h-3.5 text-red-500" />
                    <span>{remainingLabel}</span>
                  </div>

                  {/* Bottom Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800 z-20 overflow-hidden">
                    <div
                      className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.9)] transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Card Footer Details */}
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-white font-bold text-sm truncate group-hover/card:text-red-400 transition-colors">
                      {title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                      <span className="text-red-400 font-semibold">{remainingLabel}</span>
                      <span>•</span>
                      <span>{year}</span>
                      <span>•</span>
                      <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {item.media_type === 'tv' ? 'Series' : 'Movie'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/80">
                    <button
                      onClick={handlePlay}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Resume</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMedia(item);
                      }}
                      className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

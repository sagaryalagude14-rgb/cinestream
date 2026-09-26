import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check, ThumbsUp, Info, Star, Film, X, Clock } from 'lucide-react';
import { MediaItem } from '../../types/media';
import { TMDB_IMAGE_BASE_W500, formatYear, getDisplayTitle, getGenreNames } from '../../utils/constants';
import { useSavedMedia } from '../../context/SavedMediaContext';
import { useWatchHistory } from '../../context/WatchHistoryContext';
import { formatRemainingTime } from './ContinueWatchingRow';

interface MediaCardProps {
  item: MediaItem;
  aspectRatio?: 'landscape' | 'portrait';
  onSelect?: (item: MediaItem) => void;
  priority?: boolean;
  onRemoveFromHistory?: (mediaId: number | string, e: React.MouseEvent) => void;
  showRemoveFromHistory?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  aspectRatio = 'landscape',
  onSelect,
  onRemoveFromHistory,
  showRemoveFromHistory = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();
  const { isSaved, toggleSaved } = useSavedMedia();
  const { getMediaProgress, removeFromHistory } = useWatchHistory();

  const title = getDisplayTitle(item);
  const year = formatYear(item.release_date || item.first_air_date);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '8.2';
  const genres = getGenreNames(item.genre_ids, item.genres);
  const saved = isSaved(item.id);

  // Watch progress calculation from context
  const progress = getMediaProgress(item.id);
  const progressPercent =
    progress && progress.duration > 0
      ? Math.min(100, Math.max(1, Math.round((progress.currentTime / progress.duration) * 100)))
      : 0;

  const remainingTimeLabel =
    progress && progress.duration > progress.currentTime
      ? formatRemainingTime(progress.currentTime, progress.duration)
      : null;

  // Determine image URL prioritizing explicit high-res posterUrl/backdropUrl
  const rawPath = aspectRatio === 'landscape'
    ? item.backdropUrl || item.backdrop_path || item.posterUrl || item.poster_path
    : item.posterUrl || item.poster_path || item.backdropUrl || item.backdrop_path;

  const imageUrl = rawPath
    ? rawPath.startsWith('http') || rawPath.startsWith('/src/assets')
      ? rawPath
      : `${TMDB_IMAGE_BASE_W500}${rawPath}`
    : '';

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${item.id}`);
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaved(item);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(item);
    }
  };

  const handleRemoveHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveFromHistory) {
      onRemoveFromHistory(item.id, e);
    } else {
      removeFromHistory(item.id);
    }
  };

  const aspectClass = aspectRatio === 'landscape' ? 'aspect-video' : 'aspect-[2/3]';

  const shouldShowRemove = showRemoveFromHistory || Boolean(onRemoveFromHistory);

  return (
    <div
      onClick={handleCardClick}
      className="group relative cursor-pointer flex flex-col flex-shrink-0 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800/80 transition-all duration-300 hover:border-zinc-700 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/70 hover:z-20"
      style={{
        minWidth: aspectRatio === 'landscape' ? '280px' : '190px',
        maxWidth: aspectRatio === 'landscape' ? '320px' : '220px',
      }}
    >
      {/* Media Image Container */}
      <div className={`w-full ${aspectClass} bg-zinc-850 relative overflow-hidden`}>
        {/* Zero-broken-image fallback container */}
        {(!imageUrl || imageError) ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-zinc-900 via-zinc-850 to-zinc-950 text-center select-none">
            <Film className="h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-xs font-semibold text-zinc-300 line-clamp-2">{title}</p>
            <span className="text-[10px] text-zinc-500 mt-1">{genres[0] || 'Feature Film'}</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const fallback = item.posterUrl || item.backdropUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';
              if (target.src !== fallback) {
                target.src = fallback;
              } else {
                setImageError(true);
              }
            }}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Shimmer skeleton before image loads */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
            <Film className="h-6 w-6 text-zinc-700 animate-spin" />
          </div>
        )}

        {/* Subtle top gradient for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Remove from History (X) button on hover */}
        {shouldShowRemove && (
          <button
            onClick={handleRemoveHistory}
            aria-label={`Remove ${title} from watch history`}
            title="Remove from Continue Watching"
            className="absolute top-2 left-2 z-30 p-1.5 rounded-full bg-black/80 hover:bg-red-600 text-zinc-300 hover:text-white border border-zinc-700/80 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Match / Rating chip in top corner */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-zinc-700/50 text-[11px] font-mono text-amber-400">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span>{rating}</span>
        </div>

        {/* Small overlay timestamp badge on hover */}
        {remainingTimeLabel && (
          <div className="absolute bottom-2.5 left-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 px-2 py-0.5 rounded bg-black/85 backdrop-blur-md border border-zinc-700/60 text-[10px] font-mono font-medium text-white shadow-md">
            <Clock className="h-3 w-3 text-red-500" />
            <span>{remainingTimeLabel}</span>
          </div>
        )}

        {/* Watch Progress Bar fixed at bottom edge of image container */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="w-full h-1 bg-zinc-800/90 overflow-hidden">
              <div
                className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Card Info Section */}
      <div className="p-3 bg-zinc-900 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-white line-clamp-1 transition-colors">
            {title}
          </h3>

          {/* Clean metadata line without pill enclosures */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1 font-normal">
            {remainingTimeLabel ? (
              <span className="text-red-400 font-medium">
                {remainingTimeLabel}
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">
                {item.match_percentage ? `${item.match_percentage}% Match` : '96% Match'}
              </span>
            )}
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{year}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="uppercase text-[10px] text-zinc-400">
              {item.media_type === 'tv' ? 'TV' : 'Film'}
            </span>
          </div>
        </div>

        {/* Hover Quick Actions */}
        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePlay}
              aria-label={`Play ${title}`}
              title="Play Now"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-950 hover:bg-zinc-200 transition-colors shadow-sm focus:outline-none cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
            </button>
            <button
              onClick={handleToggleSave}
              aria-label={saved ? 'Remove from My List' : 'Add to My List'}
              title={saved ? 'In My List' : 'Add to Watchlist'}
              className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors focus:outline-none cursor-pointer ${
                saved
                  ? 'bg-zinc-800 border-red-500 text-red-500'
                  : 'bg-zinc-850/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500'
              }`}
            >
              {saved ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={handleLike}
              aria-label="Rate this title"
              title="Like"
              className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors focus:outline-none cursor-pointer ${
                isLiked
                  ? 'bg-zinc-800 border-red-500 text-red-500'
                  : 'bg-zinc-850/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500'
              }`}
            >
              <ThumbsUp className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <button
            onClick={handleCardClick}
            aria-label="Detailed info"
            title="More Info"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-850 border border-zinc-700/70 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors cursor-pointer"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

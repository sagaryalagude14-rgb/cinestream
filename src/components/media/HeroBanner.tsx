import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Plus, Check, Star, Volume2, VolumeX } from 'lucide-react';
import { MediaItem } from '../../types/media';
import { TMDB_IMAGE_BASE_ORIGINAL, formatYear, getDisplayTitle, getGenreNames } from '../../utils/constants';
import { useSavedMedia } from '../../context/SavedMediaContext';

// Import our local generated cinematic hero image asset
import heroLocalImage from '../../assets/images/hero_stellar_odyssey_1790351837024.jpg';

interface HeroBannerProps {
  items: MediaItem[];
  onOpenModal: (item: MediaItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ items, onOpenModal }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const { isSaved, toggleSaved } = useSavedMedia();

  const featuredItems = items.slice(0, 5);
  const currentItem = featuredItems[currentIndex] || items[0];

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (featuredItems.length <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
        setIsTransitioning(false);
      }, 300);
    }, 8000);

    return () => clearInterval(timer);
  }, [featuredItems.length, currentIndex]);

  if (!currentItem) {
    return (
      <div className="w-full h-[65vh] sm:h-[75vh] bg-zinc-950 flex items-center justify-center animate-pulse">
        <div className="h-10 w-48 bg-zinc-900 rounded" />
      </div>
    );
  }

  const title = getDisplayTitle(currentItem);
  const year = formatYear(currentItem.release_date || currentItem.first_air_date);
  const genres = getGenreNames(currentItem.genre_ids, currentItem.genres);
  const saved = isSaved(currentItem.id);

  // Background resolution
  let backdropSrc = '';
  if (currentIndex === 0) {
    backdropSrc = heroLocalImage;
  } else if (currentItem.backdrop_path) {
    backdropSrc = currentItem.backdrop_path.startsWith('http')
      ? currentItem.backdrop_path
      : `${TMDB_IMAGE_BASE_ORIGINAL}${currentItem.backdrop_path}`;
  } else {
    backdropSrc = heroLocalImage;
  }

  const handlePlayNow = () => {
    navigate(`/watch/${currentItem.id}`);
  };

  const handleMoreInfo = () => {
    onOpenModal(currentItem);
  };

  const handleSelectIndex = (idx: number) => {
    if (idx === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(idx);
      setIsTransitioning(false);
    }, 200);
  };

  return (
    <div className="relative w-full h-[68vh] sm:h-[78vh] lg:h-[84vh] overflow-hidden bg-zinc-950 select-none">
      {/* High-Resolution Hero Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          isTransitioning ? 'opacity-40 scale-102' : 'opacity-100 scale-100'
        }`}
      >
        <img
          src={backdropSrc}
          alt={title}
          className="w-full h-full object-cover object-center transform transition-transform duration-10000 ease-linear scale-105"
          onError={(e) => {
            // Fallback to local generated asset
            (e.target as HTMLImageElement).src = heroLocalImage;
          }}
        />

        {/* Sophisticated Multi-Stage Cinematic Scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent w-full md:w-3/4" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-end pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {/* Brand/Cinema Kicker */}
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold tracking-wider text-red-500 uppercase">
            <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>Featured Spotlight Presentation</span>
          </div>

          {/* Dynamic Headline */}
          <h1
            className={`font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white transition-all duration-300 ${
              isTransitioning ? 'translate-y-2 opacity-50' : 'translate-y-0 opacity-100'
            }`}
            style={{ textWrap: 'balance' }}
          >
            {title}
          </h1>

          {/* Zero-Pill Metadata Line */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-zinc-300 mt-3 font-normal">
            <span className="flex items-center gap-1 text-amber-400 font-mono font-medium">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span>{currentItem.vote_average ? currentItem.vote_average.toFixed(1) : '8.8'}</span>
            </span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-emerald-400 font-medium">
              {currentItem.match_percentage || 98}% Match
            </span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{year}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{currentItem.maturity_rating || 'PG-13'}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-zinc-400">{genres.join(' / ')}</span>
          </div>

          {/* Truncated Description */}
          <p
            className={`mt-4 text-xs sm:text-sm md:text-base text-zinc-300/90 line-clamp-3 leading-relaxed transition-opacity duration-300 ${
              isTransitioning ? 'opacity-40' : 'opacity-100'
            }`}
          >
            {currentItem.overview}
          </p>

          {/* Action CTAs */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={handlePlayNow}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-sm transition-all duration-200 shadow-xl hover:scale-102 focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
            >
              <Play className="h-4 w-4 fill-zinc-950" />
              <span>Play Now</span>
            </button>

            <button
              onClick={handleMoreInfo}
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 backdrop-blur-md text-white font-medium text-sm border border-zinc-700/70 transition-all duration-200 hover:scale-102 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 cursor-pointer"
            >
              <Info className="h-4 w-4 text-zinc-300" />
              <span>More Info</span>
            </button>

            <button
              onClick={() => toggleSaved(currentItem)}
              aria-label={saved ? 'Remove from My List' : 'Add to My List'}
              title={saved ? 'In Watchlist' : 'Add to Watchlist'}
              className={`flex h-11 w-11 items-center justify-center rounded-lg border backdrop-blur-md transition-colors focus:outline-none cursor-pointer ${
                saved
                  ? 'bg-zinc-850 border-red-500 text-red-500'
                  : 'bg-zinc-900/60 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {saved ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Bottom controls: Carousel Indicators + Sound Toggle */}
        <div className="absolute bottom-6 right-4 sm:right-6 lg:right-8 flex items-center gap-4 z-20">
          {/* Thumbnails / Indicators */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-zinc-800/80">
            {featuredItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => handleSelectIndex(idx)}
                aria-label={`Jump to spotlight ${idx + 1}`}
                className={`h-2 transition-all duration-300 rounded-full ${
                  idx === currentIndex ? 'w-6 bg-red-600' : 'w-2 bg-zinc-600 hover:bg-zinc-400'
                }`}
              />
            ))}
          </div>

          {/* Sound Toggle Indicator */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            aria-label={isMuted ? 'Unmute preview sound' : 'Mute preview sound'}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-red-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};

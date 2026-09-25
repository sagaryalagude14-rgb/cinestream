import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Plus,
  Check,
  Star,
  Volume2,
  VolumeX,
  Maximize2,
  Share2,
  Film,
  ChevronDown,
  Clock,
  Tv,
  Users,
  Clapperboard,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { MediaItem, Season, Episode, CastMember, CrewMember } from '../../types/media';
import { TMDB_IMAGE_BASE_ORIGINAL, TMDB_IMAGE_BASE_W500, formatYear, getDisplayTitle, getGenreNames } from '../../utils/constants';
import { useSavedMedia } from '../../context/SavedMediaContext';
import { useWatchHistory } from '../../context/WatchHistoryContext';
import { getOrGenerateSeasons, getOrGenerateCastAndCrew } from '../../services/mockData';

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MediaItem | null;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(1);

  const navigate = useNavigate();
  const { isSaved, toggleSaved } = useSavedMedia();
  const { getMediaProgress } = useWatchHistory();

  const isTv = item?.media_type === 'tv' || Boolean(item?.seasons) || Boolean(item?.seasons_data?.length);
  const title = item ? getDisplayTitle(item) : '';

  // Get or generate rich seasons data for TV series
  const seasonsData: Season[] = useMemo(() => {
    if (!item || !isTv) return [];
    if (item.seasons_data && item.seasons_data.length > 0) {
      return item.seasons_data;
    }
    return getOrGenerateSeasons(item.id, title, item.seasons || 2);
  }, [item, isTv, title]);

  const activeSeason = useMemo(() => {
    return seasonsData.find((s) => s.season_number === selectedSeasonNumber) || seasonsData[0];
  }, [seasonsData, selectedSeasonNumber]);

  // Extract or generate Cast & Crew members
  const creditsData = useMemo(() => {
    if (!item) return { cast_members: [], crew_members: [] };
    if (item.cast_members && item.cast_members.length > 0) {
      return {
        cast_members: item.cast_members,
        crew_members: item.crew_members || [],
      };
    }
    return getOrGenerateCastAndCrew(item.id, title);
  }, [item, title]);

  if (!item) return null;

  const year = formatYear(item.release_date || item.first_air_date);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '8.6';
  const genres = getGenreNames(item.genre_ids, item.genres);
  const saved = isSaved(item.id);

  // Watch progress for modal
  const progress = getMediaProgress(item.id);
  const hasProgress = progress && progress.duration > 0 && progress.currentTime > 60 && progress.currentTime < progress.duration * 0.95;
  const progressPercent = hasProgress ? Math.round((progress.currentTime / progress.duration) * 100) : 0;
  const remainingMinutes = hasProgress ? Math.ceil((progress.duration - progress.currentTime) / 60) : 0;

  // YouTube trailer key
  const trailerKey = item.trailer_key || 'zSWdZVtXT7E';

  // Backdrop path
  const backdropUrl = item.backdrop_path
    ? item.backdrop_path.startsWith('http') || item.backdrop_path.startsWith('/src/assets')
      ? item.backdrop_path
      : `${TMDB_IMAGE_BASE_ORIGINAL}${item.backdrop_path}`
    : '';

  const handlePlayNow = (seasonNum?: number, episodeNum?: number) => {
    onClose();
    if (isTv && episodeNum) {
      navigate(`/watch/${item.id}?season=${seasonNum || selectedSeasonNumber}&episode=${episodeNum}`);
    } else {
      navigate(`/watch/${item.id}`);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.origin + `/watch/${item.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      {/* Video Trailer / Backdrop Header */}
      <div className="relative w-full aspect-video sm:h-[400px] bg-black overflow-hidden">
        {isPlayingTrailer && trailerKey ? (
          <div className="w-full h-full relative">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? '1' : '0'}&controls=0&loop=1&playlist=${trailerKey}&rel=0`}
              title={`${title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-full h-[135%] -top-[17.5%] relative border-0 pointer-events-none scale-105"
            />

            {/* Video overlay controls */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 hover:bg-black text-white border border-zinc-700/80 transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-red-500" />}
              </button>
              <button
                onClick={() => setIsPlayingTrailer(false)}
                className="px-2.5 py-1 rounded bg-black/70 hover:bg-black text-zinc-300 hover:text-white border border-zinc-700/80 text-xs transition-colors cursor-pointer"
              >
                Backdrop
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {backdropUrl ? (
              <img
                src={backdropUrl}
                alt={title}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                <Film className="h-16 w-16 text-zinc-700" />
              </div>
            )}
            <div className="absolute bottom-4 right-4 z-20">
              <button
                onClick={() => setIsPlayingTrailer(true)}
                className="px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black text-white border border-zinc-700/80 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Play Trailer</span>
              </button>
            </div>
          </div>
        )}

        {/* Gradient Scrims for text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent pointer-events-none" />

        {/* Watch Progress Bar at bottom of media viewer */}
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0 z-30">
            <div className="w-full h-1 bg-zinc-800/90">
              <div
                className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Floating Quick Action Overlay */}
        <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight drop-shadow-md">
              {title}
            </h2>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => handlePlayNow()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-sm transition-colors shadow-lg cursor-pointer"
              >
                <Play className="h-4 w-4 fill-zinc-950 ml-0.5" />
                <span>{hasProgress ? `Resume (${remainingMinutes}m left)` : 'Play'}</span>
              </button>

              <button
                onClick={() => toggleSaved(item)}
                aria-label={saved ? 'Remove from My List' : 'Add to My List'}
                title={saved ? 'In Watchlist' : 'Add to Watchlist'}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                  saved
                    ? 'bg-zinc-800 border-red-500 text-red-500'
                    : 'bg-black/60 border-zinc-600 text-white hover:bg-zinc-800'
                }`}
              >
                {saved ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </button>

              <button
                onClick={handleShare}
                aria-label="Share media link"
                title="Share link"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/60 border border-zinc-600 text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
              </button>
              {copiedLink && (
                <span className="text-xs text-emerald-400 font-medium animate-fadeIn">
                  Link copied!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detailed Body */}
      <div className="p-6 sm:p-8 bg-zinc-900 text-zinc-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            {/* Metadata Line */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-400">
              <span className="text-emerald-400 font-semibold">
                {item.match_percentage || 97}% Match
              </span>
              <span aria-hidden="true">·</span>
              <span>{year}</span>
              <span aria-hidden="true">·</span>
              <span className="px-1.5 py-0.5 border border-zinc-700 rounded text-[11px] text-zinc-300 font-mono">
                {item.maturity_rating || 'TV-MA'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{item.duration || (item.seasons ? `${item.seasons} Seasons` : '2h 10m')}</span>
              <span aria-hidden="true">·</span>
              <span className="px-1.5 py-0.5 border border-zinc-700/80 rounded text-[10px] text-zinc-300 font-semibold tracking-wider">
                ULTRA HD 4K
              </span>
            </div>

            {/* Overview */}
            <p className="text-sm text-zinc-200 leading-relaxed pt-1">
              {item.overview}
            </p>

            {/* Audio & Video Quality Indicators */}
            <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-zinc-300">Audio:</span>
                <span>Spatial Dolby Atmos, 5.1 Surround</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-zinc-300">Subtitles:</span>
                <span>English [CC], Spanish, French, German</span>
              </div>
            </div>
          </div>

          {/* Cast & Specs Sidebar (1 col) */}
          <div className="space-y-4 text-xs bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/60">
            <div>
              <span className="text-zinc-500 block mb-1 font-medium">Genres:</span>
              <p className="text-zinc-200 leading-relaxed">
                {genres.join(', ')}
              </p>
            </div>

            {item.director && (
              <div>
                <span className="text-zinc-500 block mb-1 font-medium">Director / Creator:</span>
                <p className="text-zinc-200">{item.director}</p>
              </div>
            )}

            <div>
              <span className="text-zinc-500 block mb-1 font-medium">Audience Score:</span>
              <div className="flex items-center gap-1.5 text-amber-400 font-mono font-medium">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                <span>{rating} / 10 (IMDb Certified)</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handlePlayNow()}
                className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Launch Fullscreen Player</span>
              </button>
            </div>
          </div>
        </div>

        {/* TV Show Season & Episode Picker Section */}
        {isTv && seasonsData.length > 0 && (
          <div className="mt-8 pt-6 border-t border-zinc-800/80">
            {/* Header + Season Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2.5">
                <Tv className="h-5 w-5 text-red-500" />
                <h3 className="font-display text-xl font-bold text-white tracking-tight">
                  Episodes
                </h3>
                <span className="text-xs text-zinc-500">
                  ({activeSeason?.episodes.length || 0} episodes)
                </span>
              </div>

              {/* Season Selector Dropdown */}
              <div className="relative">
                <select
                  value={selectedSeasonNumber}
                  onChange={(e) => setSelectedSeasonNumber(Number(e.target.value))}
                  className="px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-semibold text-white focus:outline-none focus:border-red-500 cursor-pointer pr-9 appearance-none shadow-sm"
                >
                  {seasonsData.map((s) => (
                    <option key={s.season_number} value={s.season_number}>
                      {s.name} ({s.episode_count} Episodes)
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {/* Episode List */}
            <div className="space-y-3">
              {activeSeason?.episodes.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => handlePlayNow(activeSeason.season_number, ep.episode_number)}
                  className="group p-3 sm:p-4 rounded-xl bg-zinc-950/60 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer"
                >
                  {/* Episode Number */}
                  <span className="text-base sm:text-lg font-bold text-zinc-500 group-hover:text-white font-mono w-6 text-center shrink-0">
                    {ep.episode_number}
                  </span>

                  {/* Thumbnail Still */}
                  <div className="w-full sm:w-36 aspect-video rounded-lg bg-zinc-800 overflow-hidden relative shrink-0 border border-zinc-800">
                    {backdropUrl ? (
                      <img
                        src={backdropUrl}
                        alt={ep.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <Film className="h-6 w-6 text-zinc-600" />
                      </div>
                    )}
                    {/* Play Icon on hover */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                      <div className="h-8 w-8 rounded-full bg-white/90 group-hover:bg-white text-zinc-950 flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform">
                        <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                        {ep.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono shrink-0">
                        <Clock className="h-3 w-3" />
                        <span>{ep.runtime || ep.duration || '45m'}</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {ep.overview}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dedicated Cast & Crew Section */}
        {creditsData.cast_members.length > 0 && (
          <div className="mt-8 pt-6 border-t border-zinc-800/80">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Users className="h-5 w-5 text-red-500" />
                <h3 className="font-display text-xl font-bold text-white tracking-tight">
                  Cast & Crew
                </h3>
              </div>
              <span className="text-xs text-zinc-500 font-medium">
                {creditsData.cast_members.length} Principal Actors
              </span>
            </div>

            {/* Top Billed Cast Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
              {creditsData.cast_members.map((actor) => {
                const profileImg = actor.profile_path
                  ? `${TMDB_IMAGE_BASE_W500}${actor.profile_path}`
                  : null;

                const initials = actor.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <div
                    key={actor.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition-colors group"
                  >
                    {/* Actor Avatar */}
                    {profileImg ? (
                      <img
                        src={profileImg}
                        alt={actor.name}
                        className="w-11 h-11 rounded-lg object-cover object-top border border-zinc-750 shrink-0 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-750 flex items-center justify-center font-bold text-xs text-zinc-300 shrink-0">
                        {initials}
                      </div>
                    )}

                    {/* Actor & Role Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                        {actor.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {actor.character}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Key Creative Crew Cards */}
            {creditsData.crew_members.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <Clapperboard className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Creative Leadership</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {creditsData.crew_members.map((crew, idx) => (
                    <div
                      key={`${crew.id}-${idx}`}
                      className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/70"
                    >
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1">
                        {crew.job}
                      </span>
                      <p className="text-xs font-semibold text-white truncate">
                        {crew.name}
                      </p>
                      {crew.department && crew.department !== crew.job && (
                        <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                          {crew.department}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

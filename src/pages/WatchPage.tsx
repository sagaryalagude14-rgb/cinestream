import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Subtitles,
  Check,
  Film,
  FastForward,
  SkipForward,
  RotateCcw as ReplayIcon,
  CheckCircle2,
  Tv,
  X,
  ChevronDown,
  Clock,
  ListVideo,
} from 'lucide-react';
import { fetchMediaDetails } from '../services/tmdbApi';
import { MediaItem, Season, Episode } from '../types/media';
import { getDisplayTitle, formatYear } from '../utils/constants';
import { useWatchHistory } from '../context/WatchHistoryContext';
import { MOCK_MEDIA_ITEMS, getOrGenerateSeasons } from '../services/mockData';

export const WatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getMediaProgress, updateProgress } = useWatchHistory();

  const [media, setMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Episode tracking from search params
  const paramSeason = parseInt(searchParams.get('season') || '1', 10);
  const paramEpisode = parseInt(searchParams.get('episode') || '1', 10);
  const [currentSeasonNumber, setCurrentSeasonNumber] = useState<number>(paramSeason || 1);
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState<number>(paramEpisode || 1);

  // Player playback states
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(7200); // default 2 hours
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [activeSubtitle, setActiveSubtitle] = useState('English [CC]');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Drawer & Menus visibility
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState(false);

  // Resume toast banner state
  const [resumeNotification, setResumeNotification] = useState<{
    show: boolean;
    time: number;
    formatted: string;
  } | null>(null);

  // Action toast (e.g., "Skipped Intro (+85s)")
  const [actionToast, setActionToast] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for unmount progress saving
  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;
  const totalDurationRef = useRef(totalDuration);
  totalDurationRef.current = totalDuration;
  const mediaRef = useRef(media);
  mediaRef.current = media;
  const updateProgressRef = useRef(updateProgress);
  updateProgressRef.current = updateProgress;

  const isSeries = media?.media_type === 'tv' || Boolean(media?.seasons) || Boolean(media?.seasons_data?.length);

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);

    const pad = (n: number) => String(n).padStart(2, '0');
    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  // Seasons and episode list for TV shows
  const title = media ? getDisplayTitle(media) : 'CineStream Cinema Player';
  const seasonsData: Season[] = useMemo(() => {
    if (!media || !isSeries) return [];
    if (media.seasons_data && media.seasons_data.length > 0) {
      return media.seasons_data;
    }
    return getOrGenerateSeasons(media.id, title, media.seasons || 2);
  }, [media, isSeries, title]);

  const activeSeason = useMemo(() => {
    return seasonsData.find((s) => s.season_number === currentSeasonNumber) || seasonsData[0];
  }, [seasonsData, currentSeasonNumber]);

  const activeEpisode = useMemo(() => {
    if (!activeSeason) return null;
    return activeSeason.episodes.find((ep) => ep.episode_number === currentEpisodeNumber) || activeSeason.episodes[0];
  }, [activeSeason, currentEpisodeNumber]);

  // Fetch media details & restore progress
  useEffect(() => {
    let isMounted = true;
    if (id) {
      setLoading(true);
      fetchMediaDetails(id, 'movie').then((res) => {
        if (!isMounted) return;
        setMedia(res);
        setLoading(false);

        // Check for existing saved watch progress (> 5% and < 95%)
        const savedProgress = getMediaProgress(res.id);
        if (savedProgress && savedProgress.duration > 0) {
          const ratio = savedProgress.currentTime / savedProgress.duration;
          if (ratio > 0.04 && ratio < 0.96) {
            setCurrentTime(savedProgress.currentTime);
            setTotalDuration(savedProgress.duration);

            // Show resume notification toast
            setResumeNotification({
              show: true,
              time: savedProgress.currentTime,
              formatted: formatTime(savedProgress.currentTime),
            });

            // Auto-hide toast after 7 seconds
            setTimeout(() => {
              if (isMounted) {
                setResumeNotification((prev) => (prev ? { ...prev, show: false } : null));
              }
            }, 7000);
          } else {
            setCurrentTime(120); // standard demo start
          }
        } else {
          setCurrentTime(120);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Periodic auto-save progress every 5 seconds while playing (uses stable refs)
  useEffect(() => {
    if (!media?.id || !isPlaying) return;

    const saveInterval = setInterval(() => {
      if (mediaRef.current) {
        updateProgressRef.current(
          mediaRef.current.id,
          currentTimeRef.current,
          totalDurationRef.current,
          mediaRef.current
        );
      }
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [media?.id, isPlaying]);

  // Save progress on component unmount safely outside the React render phase
  useEffect(() => {
    return () => {
      if (mediaRef.current && currentTimeRef.current > 0) {
        const curMedia = mediaRef.current;
        const curTime = currentTimeRef.current;
        const curDuration = totalDurationRef.current;
        setTimeout(() => {
          updateProgressRef.current(curMedia.id, curTime, curDuration, curMedia);
        }, 0);
      }
    };
  }, []);

  // Handle auto-hide controls after inactivity
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && !showEpisodesDrawer) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowSubtitleMenu(false);
      }, 3500);
    }
  }, [isPlaying, showEpisodesDrawer]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [handleMouseMove]);

  // Keyboard shortcut listener (Space = play/pause, F = fullscreen, Esc, Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
        setShowControls(true);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key === 'ArrowRight') {
        seekRelative(10);
      } else if (e.key === 'ArrowLeft') {
        seekRelative(-10);
      } else if (e.key.toLowerCase() === 'm') {
        setIsMuted((prev) => !prev);
      } else if (e.key === 'Escape' && showEpisodesDrawer) {
        setShowEpisodesDrawer(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEpisodesDrawer]);

  // Time ticker while playing
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, totalDuration, playbackSpeed]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const seekRelative = (deltaSeconds: number) => {
    const nextTime = Math.max(0, Math.min(totalDuration, currentTimeRef.current + deltaSeconds));
    setCurrentTime(nextTime);
    if (mediaRef.current) {
      updateProgress(mediaRef.current.id, nextTime, totalDurationRef.current, mediaRef.current);
    }
    setShowControls(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (mediaRef.current) {
      updateProgress(mediaRef.current.id, newTime, totalDurationRef.current, mediaRef.current);
    }
  };

  // Skip Intro feature (+85 sec)
  const handleSkipIntro = () => {
    seekRelative(85);
    setActionToast('Skipped Opening Intro (+85s)');
    setTimeout(() => setActionToast(null), 2500);
  };

  // Switch to specific episode from drawer
  const handleSelectEpisode = (seasonNum: number, episodeNum: number, episodeName: string) => {
    setCurrentSeasonNumber(seasonNum);
    setCurrentEpisodeNumber(episodeNum);
    setCurrentTime(0);
    setSearchParams({ season: String(seasonNum), episode: String(episodeNum) }, { replace: true });
    setShowEpisodesDrawer(false);
    setIsPlaying(true);
    setActionToast(`Playing S${seasonNum}:E${episodeNum} · ${episodeName}`);
    setTimeout(() => setActionToast(null), 3000);
  };

  // Next Episode feature
  const handleNextEpisode = () => {
    if (isSeries && activeSeason) {
      const nextEpIndex = activeSeason.episodes.findIndex((ep) => ep.episode_number === currentEpisodeNumber) + 1;
      if (nextEpIndex < activeSeason.episodes.length) {
        const nextEp = activeSeason.episodes[nextEpIndex];
        handleSelectEpisode(currentSeasonNumber, nextEp.episode_number, nextEp.name);
        return;
      } else {
        // Next Season
        const nextSeason = seasonsData.find((s) => s.season_number === currentSeasonNumber + 1);
        if (nextSeason && nextSeason.episodes.length > 0) {
          const firstEp = nextSeason.episodes[0];
          handleSelectEpisode(nextSeason.season_number, firstEp.episode_number, firstEp.name);
          return;
        }
      }
    }

    // Fallback: next movie/show in mock catalog
    const currentId = Number(id);
    const currentIndex = MOCK_MEDIA_ITEMS.findIndex((m) => m.id === currentId);
    const nextItem =
      currentIndex !== -1 && currentIndex < MOCK_MEDIA_ITEMS.length - 1
        ? MOCK_MEDIA_ITEMS[currentIndex + 1]
        : MOCK_MEDIA_ITEMS[0];

    setActionToast(`Playing Next: ${nextItem.title || nextItem.name}`);
    setTimeout(() => {
      navigate(`/watch/${nextItem.id}`);
    }, 800);
  };

  // Start Over handler from resume toast
  const handleStartOver = () => {
    setCurrentTime(0);
    if (media) {
      updateProgress(media.id, 0, totalDuration, media);
    }
    setResumeNotification(null);
    setActionToast('Restarted from beginning (00:00)');
    setTimeout(() => setActionToast(null), 2500);
  };

  const trailerKey = media?.trailer_key || 'zSWdZVtXT7E';

  const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
  const subtitles = ['Off', 'English [CC]', 'Spanish', 'French', 'German'];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-screen h-screen bg-black overflow-hidden select-none cursor-default"
    >
      {/* Background Video Player */}
      <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center">
        {trailerKey ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? '1' : '0'}&controls=0&loop=1&playlist=${trailerKey}&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-[120vw] h-[120vh] max-w-none border-0"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-600">
            <Film className="h-16 w-16 mb-2" />
            <p className="text-sm">Video Stream Ready</p>
          </div>
        )}
      </div>

      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Top Bar Controls */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            aria-label="Return to previous screen"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/80 transition-colors focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display font-bold text-base sm:text-xl text-white tracking-tight">
              {title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              {isSeries && activeEpisode ? (
                <>
                  <span className="text-red-400 font-semibold font-mono">
                    S{currentSeasonNumber}:E{currentEpisodeNumber}
                  </span>
                  <span>·</span>
                  <span className="text-white font-medium truncate max-w-xs">{activeEpisode.name}</span>
                </>
              ) : (
                <span>{media?.duration || 'Feature Film'}</span>
              )}
              <span>·</span>
              <span>{media?.maturity_rating || 'PG-13'}</span>
              <span>·</span>
              <span className="text-red-500 font-semibold">4K Ultra HD</span>
            </div>
          </div>
        </div>

        {/* Top Right Quick Actions: Episodes Drawer Button & Sync */}
        <div className="flex items-center gap-3">
          {isSeries && seasonsData.length > 0 && (
            <button
              onClick={() => setShowEpisodesDrawer(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-white transition-colors cursor-pointer shadow-lg"
            >
              <ListVideo className="h-4 w-4 text-red-500" />
              <span>Episodes</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-zinc-800 text-xs text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span>Syncing Progress</span>
          </div>
        </div>
      </div>

      {/* Center Big Play/Pause Splash on Click */}
      <div
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
      >
        {!isPlaying && (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/70 border border-zinc-700 text-white shadow-2xl animate-scaleUp">
            <Play className="h-10 w-10 fill-white ml-1.5" />
          </div>
        )}
      </div>

      {/* Action Toast Feedback Overlay */}
      {actionToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-lg bg-zinc-900/90 border border-zinc-700/80 text-white text-xs font-medium shadow-2xl backdrop-blur-md animate-fadeIn flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Resume from Saved Progress Banner */}
      {resumeNotification && resumeNotification.show && (
        <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-md p-3.5 rounded-xl bg-zinc-900/95 border border-zinc-700 shadow-2xl backdrop-blur-lg flex items-center justify-between gap-3 text-xs text-zinc-200 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />
            <div>
              <p className="font-semibold text-white">Resumed Playback</p>
              <p className="text-zinc-400 text-[11px]">Continuing from {resumeNotification.formatted}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartOver}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-medium border border-zinc-700/80 transition-colors cursor-pointer"
            >
              <ReplayIcon className="h-3 w-3" />
              <span>Start Over</span>
            </button>
            <button
              onClick={() => setResumeNotification(null)}
              className="px-2 py-1 text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* "Skip Intro" Floating Overlay Button (Netflix Style) */}
      <div
        className={`absolute bottom-28 right-6 sm:right-8 z-30 transition-all duration-300 ${
          showControls || currentTime < 240 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <button
          onClick={handleSkipIntro}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/80 hover:bg-black text-white text-xs font-bold border border-zinc-600/90 shadow-2xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all focus:outline-none cursor-pointer"
        >
          <FastForward className="h-3.5 w-3.5 fill-current" />
          <span>Skip Intro (+85s)</span>
        </button>
      </div>

      {/* Bottom Player Controller Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/75 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Interactive Scrub Seekbar */}
        <div className="relative mb-3 group/scrub">
          <input
            type="range"
            min={0}
            max={totalDuration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none focus:ring-0"
          />
          <div
            className="absolute top-0 left-0 h-1.5 bg-red-600 rounded-lg pointer-events-none shadow-[0_0_8px_rgba(220,38,38,0.7)]"
            style={{ width: `${(currentTime / totalDuration) * 100}%` }}
          />
        </div>

        {/* Action Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Play/Pause, Replay 10s, Forward 10s, Volume, Timestamps */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-950 hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer"
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => seekRelative(-10)}
              aria-label="Skip backward 10 seconds"
              title="Skip -10s"
              className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            <button
              onClick={() => seekRelative(10)}
              aria-label="Skip forward 10 seconds"
              title="Skip +10s"
              className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCw className="h-5 w-5" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={() => setIsMuted(!isMuted)}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5 text-red-500" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-16 sm:w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600 hidden sm:block"
              />
            </div>

            {/* Timestamps */}
            <div className="text-xs font-mono text-zinc-400">
              <span className="text-zinc-200">{formatTime(currentTime)}</span>
              <span className="mx-1 text-zinc-600">/</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Right: Episodes Drawer Button, Next Episode, Subtitles, Playback Speed, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-4 relative">
            {/* TV Episodes Drawer Button */}
            {isSeries && seasonsData.length > 0 && (
              <button
                onClick={() => setShowEpisodesDrawer(true)}
                title="Episode List"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80 text-xs font-medium transition-colors cursor-pointer"
              >
                <ListVideo className="h-4 w-4 text-red-500" />
                <span className="hidden sm:inline">Episodes</span>
              </button>
            )}

            {/* Next Episode Button */}
            <button
              onClick={handleNextEpisode}
              aria-label="Next Episode"
              title="Play Next Title"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80 text-xs font-medium transition-colors cursor-pointer"
            >
              <SkipForward className="h-3.5 w-3.5" />
              <span>Next {isSeries ? 'Episode' : 'Title'}</span>
            </button>

            {/* Subtitles Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSubtitleMenu(!showSubtitleMenu);
                  setShowSpeedMenu(false);
                }}
                aria-label="Audio & Subtitles"
                title="Subtitles"
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  activeSubtitle !== 'Off' ? 'text-red-500' : 'text-zinc-300 hover:text-white'
                }`}
              >
                <Subtitles className="h-5 w-5" />
              </button>

              {showSubtitleMenu && (
                <div className="absolute right-0 bottom-12 w-48 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-40 text-xs">
                  <div className="font-semibold text-zinc-400 px-3 py-1.5 border-b border-zinc-800 mb-1">
                    Subtitles
                  </div>
                  {subtitles.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        setActiveSubtitle(sub);
                        setShowSubtitleMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                        activeSubtitle === sub ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>{sub}</span>
                      {activeSubtitle === sub && <Check className="h-3.5 w-3.5 text-red-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Playback Speed Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowSubtitleMenu(false);
                }}
                aria-label="Playback Speed"
                title="Playback Speed"
                className="px-2 py-1 rounded bg-zinc-900/80 border border-zinc-700/80 text-xs font-mono text-zinc-200 hover:text-white transition-colors cursor-pointer"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute right-0 bottom-12 w-32 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-1.5 z-40 text-xs font-mono">
                  <div className="font-sans font-semibold text-zinc-400 px-2 py-1 border-b border-zinc-800 mb-1">
                    Speed
                  </div>
                  {speeds.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setPlaybackSpeed(s);
                        setShowSpeedMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        playbackSpeed === s ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>{s}x</span>
                      {playbackSpeed === s && <Check className="h-3 w-3 text-red-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              title="Fullscreen (F)"
              className="text-zinc-300 hover:text-white transition-colors p-1 cursor-pointer"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Episode Slide-Over Drawer in Fullscreen Player */}
      {showEpisodesDrawer && isSeries && (
        <div className="absolute inset-y-0 right-0 z-50 w-full sm:w-96 bg-zinc-950/95 border-l border-zinc-800 shadow-2xl backdrop-blur-xl flex flex-col animate-slideInRight">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tv className="h-4 w-4 text-red-500" />
              <h3 className="font-display font-bold text-base text-white">Episodes & Seasons</h3>
            </div>
            <button
              onClick={() => setShowEpisodesDrawer(false)}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Season Selector Dropdown inside Player */}
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
            <div className="relative">
              <select
                value={currentSeasonNumber}
                onChange={(e) => {
                  const sNum = Number(e.target.value);
                  setCurrentSeasonNumber(sNum);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-semibold text-white focus:outline-none focus:border-red-500 cursor-pointer pr-8 appearance-none shadow-sm"
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

          {/* Scrollable Episodes List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeSeason?.episodes.map((ep) => {
              const isCurrentPlaying =
                ep.episode_number === currentEpisodeNumber &&
                activeSeason.season_number === currentSeasonNumber;

              return (
                <div
                  key={ep.id}
                  onClick={() => handleSelectEpisode(activeSeason.season_number, ep.episode_number, ep.name)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                    isCurrentPlaying
                      ? 'bg-zinc-900 border-red-500 shadow-md shadow-red-950/30'
                      : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`text-sm font-bold font-mono w-5 shrink-0 pt-0.5 ${
                        isCurrentPlaying ? 'text-red-500' : 'text-zinc-500 group-hover:text-white'
                      }`}
                    >
                      {ep.episode_number}
                    </span>

                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4
                          className={`text-xs font-semibold line-clamp-1 ${
                            isCurrentPlaying ? 'text-white' : 'text-zinc-200 group-hover:text-white'
                          }`}
                        >
                          {ep.name}
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                          {ep.runtime || '45m'}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {ep.overview}
                      </p>

                      {isCurrentPlaying && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span>Now Playing</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

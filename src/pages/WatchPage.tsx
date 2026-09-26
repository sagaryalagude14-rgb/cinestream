import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { RotateCcw as ReplayIcon, Play, CheckCircle2, Film } from 'lucide-react';
import { fetchMediaDetails } from '../services/tmdbApi';
import { MediaItem, Season, Episode } from '../types/media';
import { getDisplayTitle } from '../utils/constants';
import { useWatchHistory } from '../context/WatchHistoryContext';
import { getOrGenerateSeasons } from '../services/mockData';
import { CustomVideoPlayer } from '../components/player/CustomVideoPlayer';

function formatTime(secs: number): string {
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = Math.floor(secs % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export const WatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getMediaProgress, updateProgress } = useWatchHistory();

  const [media, setMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialTime, setInitialTime] = useState(0);

  // Resume toast banner state
  const [resumeNotification, setResumeNotification] = useState<{
    show: boolean;
    time: number;
    formatted: string;
  } | null>(null);

  // Episode tracking from search params
  const paramSeason = parseInt(searchParams.get('season') || '1', 10);
  const paramEpisode = parseInt(searchParams.get('episode') || '1', 10);
  const [currentSeasonNumber, setCurrentSeasonNumber] = useState<number>(paramSeason || 1);
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState<number>(paramEpisode || 1);

  const playerKeyRef = useRef<number>(0);

  // Fetch media details & restore progress
  useEffect(() => {
    let isMounted = true;
    if (id) {
      setLoading(true);
      const paramType = (searchParams.get('type') as 'movie' | 'tv') || undefined;
      fetchMediaDetails(id, paramType).then((res) => {
        if (!isMounted) return;
        setMedia(res);
        setLoading(false);

        // Check for existing saved watch progress (> 4% and < 96%)
        const savedProgress = getMediaProgress(res.id);
        if (savedProgress && savedProgress.duration > 0) {
          const ratio = savedProgress.currentTime / savedProgress.duration;
          if (ratio > 0.04 && ratio < 0.96) {
            setInitialTime(savedProgress.currentTime);

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
            setInitialTime(0);
          }
        } else {
          setInitialTime(0);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  const isSeries = media?.media_type === 'tv' || Boolean(media?.seasons) || Boolean(media?.seasons_data?.length);
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

  const handleSelectEpisode = (seasonNum: number, episodeNum: number) => {
    setCurrentSeasonNumber(seasonNum);
    setCurrentEpisodeNumber(episodeNum);
    setInitialTime(0);
    playerKeyRef.current += 1;
    setSearchParams({ season: String(seasonNum), episode: String(episodeNum) }, { replace: true });
  };

  const handleNextEpisode = () => {
    if (!activeSeason) return;
    const currentIdx = activeSeason.episodes.findIndex((e) => e.episode_number === currentEpisodeNumber);
    if (currentIdx !== -1 && currentIdx < activeSeason.episodes.length - 1) {
      const nextEp = activeSeason.episodes[currentIdx + 1];
      handleSelectEpisode(currentSeasonNumber, nextEp.episode_number);
    } else {
      // Check next season
      const nextSeason = seasonsData.find((s) => s.season_number === currentSeasonNumber + 1);
      if (nextSeason && nextSeason.episodes.length > 0) {
        handleSelectEpisode(nextSeason.season_number, nextSeason.episodes[0].episode_number);
      }
    }
  };

  const handlePreviousEpisode = () => {
    if (!activeSeason) return;
    const currentIdx = activeSeason.episodes.findIndex((e) => e.episode_number === currentEpisodeNumber);
    if (currentIdx > 0) {
      const prevEp = activeSeason.episodes[currentIdx - 1];
      handleSelectEpisode(currentSeasonNumber, prevEp.episode_number);
    }
  };

  // Start Over handler from resume toast
  const handleStartOver = () => {
    setInitialTime(0);
    playerKeyRef.current += 1;
    setResumeNotification((prev) => (prev ? { ...prev, show: false } : null));
  };

  if (loading) {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-red-500 animate-pulse" />
          <p className="text-zinc-400 text-sm font-medium tracking-wide">Loading CineStream Cinema Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Custom Core Video Player with Multi-Language Audio Dubbing & Subtitles */}
      <CustomVideoPlayer
        key={`${media?.id}-${currentSeasonNumber}-${currentEpisodeNumber}-${playerKeyRef.current}`}
        media={media}
        title={title}
        isSeries={isSeries}
        seasonsData={seasonsData}
        currentSeasonNumber={currentSeasonNumber}
        currentEpisodeNumber={currentEpisodeNumber}
        currentEpisode={activeEpisode}
        initialTime={initialTime}
        autoPlay={true}
        onBack={() => navigate(-1)}
        onTimeUpdate={(time, dur) => {
          if (media) {
            updateProgress(media.id, time, dur, media);
          }
        }}
        onSelectEpisode={handleSelectEpisode}
        onNextEpisode={handleNextEpisode}
        onPreviousEpisode={handlePreviousEpisode}
      />

      {/* Resume Notification Toast */}
      {resumeNotification?.show && (
        <div className="absolute top-20 right-8 z-40 bg-zinc-900/95 border border-zinc-700 text-white px-5 py-4 rounded-xl shadow-2xl backdrop-blur-md max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-red-500">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="font-semibold text-sm">Resumed Playback</span>
            </div>
            <button
              onClick={() => setResumeNotification((prev) => (prev ? { ...prev, show: false } : null))}
              className="text-zinc-500 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-zinc-300 text-xs mt-1.5 leading-relaxed">
            Continuing from <span className="font-bold text-white font-mono">{resumeNotification.formatted}</span>
          </p>
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-zinc-800">
            <button
              onClick={handleStartOver}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <ReplayIcon className="w-3.5 h-3.5" />
              <span>Start Over</span>
            </button>
            <button
              onClick={() => setResumeNotification((prev) => (prev ? { ...prev, show: false } : null))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Continue</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

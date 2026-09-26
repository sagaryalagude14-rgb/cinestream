import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
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
  FastForward,
  SkipForward,
  Tv,
  X,
  ChevronDown,
  Clock,
  Film,
  Languages,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { MediaItem, Season, Episode, AudioTrack, SubtitleTrack } from '../../types/media';
import { getDisplayTitle } from '../../utils/constants';

interface CustomVideoPlayerProps {
  media: MediaItem | null;
  title?: string;
  isSeries?: boolean;
  seasonsData?: Season[];
  currentSeasonNumber?: number;
  currentEpisodeNumber?: number;
  currentEpisode?: Episode | null;
  initialTime?: number;
  autoPlay?: boolean;
  onBack?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onSelectEpisode?: (seasonNum: number, episodeNum: number) => void;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function generateVttBlobUrl(cues: Array<{ start: number; end: number; text: string }>): string {
  let vtt = 'WEBVTT\n\n';
  cues.forEach((cue, index) => {
    const startM = Math.floor(cue.start / 60);
    const startS = Math.floor(cue.start % 60);
    const endM = Math.floor(cue.end / 60);
    const endS = Math.floor(cue.end % 60);
    const startStr = `${String(startM).padStart(2, '0')}:${String(startS).padStart(2, '0')}.000`;
    const endStr = `${String(endM).padStart(2, '0')}:${String(endS).padStart(2, '0')}.000`;
    if (cue.text) {
      vtt += `${index + 1}\n${startStr} --> ${endStr}\n${cue.text}\n\n`;
    }
  });
  return URL.createObjectURL(new Blob([vtt], { type: 'text/vtt' }));
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  media,
  title: customTitle,
  isSeries = false,
  seasonsData = [],
  currentSeasonNumber = 1,
  currentEpisodeNumber = 1,
  currentEpisode,
  initialTime = 0,
  autoPlay = true,
  onBack,
  onTimeUpdate,
  onSelectEpisode,
  onNextEpisode,
  onPreviousEpisode,
}) => {
  // Video & audio playback states
  const expectedTotalDuration = useMemo(() => {
    if (media?.duration_seconds && media.duration_seconds > 0) return media.duration_seconds;
    if (media?.durationSeconds && media.durationSeconds > 0) return media.durationSeconds;
    return isSeries ? 3000 : 7200;
  }, [media, isSeries]);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [totalDuration, setTotalDuration] = useState<number>(expectedTotalDuration);
  const virtualOffsetRef = useRef<number>(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackMode, setPlaybackMode] = useState<'video' | 'trailer'>('video');

  // Multi-Language Audio & Subtitle states
  const [activeAudioTrackId, setActiveAudioTrackId] = useState<string>('');
  const [activeSubtitleTrackId, setActiveSubtitleTrackId] = useState<string>('sub-en');
  const [captionOffset, setCaptionOffset] = useState<number>(0); // -2.0s to +2.0s
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string | null>(null);

  // Menus and Drawers
  const [showAudioSubtitleModal, setShowAudioSubtitleModal] = useState(false);
  const [audioSubtitleTab, setAudioSubtitleTab] = useState<'both' | 'audio' | 'subtitles'>('both');
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const displayTitle = customTitle || (media ? getDisplayTitle(media) : 'CineStream Cinema Player');
  const trailerKey = media?.trailer_key || 'zSWdZVtXT7E';
  const defaultVideoUrl = media?.video_url || media?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  // Audio tracks list
  const availableAudioTracks: AudioTrack[] = useMemo(() => {
    if (media?.audio_tracks && media.audio_tracks.length > 0) return media.audio_tracks;
    if (media?.audioTracks && media.audioTracks.length > 0) return media.audioTracks;
    return [
      { id: 'audio-en', language: 'English [Original 5.1]', code: 'en', src: defaultVideoUrl, isDefault: true },
      { id: 'audio-es', language: 'Spanish (Español Latino)', code: 'es', src: defaultVideoUrl },
      { id: 'audio-hi', language: 'Hindi (हिन्दी Dubbed)', code: 'hi', src: defaultVideoUrl },
      { id: 'audio-fr', language: 'French (Français V.F.)', code: 'fr', src: defaultVideoUrl },
      { id: 'audio-de', language: 'German (Deutsch)', code: 'de', src: defaultVideoUrl },
      { id: 'audio-ja', language: 'Japanese (日本語 吹替)', code: 'ja', src: defaultVideoUrl },
    ];
  }, [media, defaultVideoUrl]);

  // Subtitle tracks list
  const availableSubtitles: SubtitleTrack[] = useMemo(() => {
    if (media?.subtitles && media.subtitles.length > 0) return media.subtitles;
    return [
      {
        id: 'sub-en',
        language: 'English [CC]',
        code: 'en',
        isDefault: true,
        cues: [
          { start: 2, end: 7, text: '[Atmospheric cinematic soundtrack rises]' },
          { start: 8, end: 15, text: `${displayTitle}: "Every choice we make ripples across the infinite horizon."` },
          { start: 16, end: 23, text: '"We were never meant to stand still. We were born to explore."' },
          { start: 24, end: 32, text: '[Deep pulsing cinematic bass vibrating]' },
          { start: 33, end: 41, text: '"Trajectory locked. Systems nominal in 3... 2... 1..."' },
          { start: 42, end: 50, text: '[Thrusters ignite with blinding brilliance and roar to life]' },
          { start: 51, end: 60, text: '"Whatever happens on the other side... remember why we started."' },
          { start: 61, end: 72, text: '"Do not look back. The future is waiting for us."' },
        ],
      },
      {
        id: 'sub-es',
        language: 'Spanish (Español)',
        code: 'es',
        cues: [
          { start: 2, end: 7, text: '[Música cinematográfica atmosférica en aumento]' },
          { start: 8, end: 15, text: `${displayTitle}: "Cada decisión que tomamos resuena en el horizonte infinito."` },
          { start: 16, end: 23, text: '"Nunca estuvimos destinados a quedarnos quietos. Nacimos para explorar."' },
          { start: 24, end: 32, text: '[Vibraciones intensas de frecuencias bajas]' },
          { start: 33, end: 41, text: '"Trayectoria fijada. Sistemas nominales en 3... 2... 1..."' },
          { start: 42, end: 50, text: '[Los propulsores se encienden con fuerza]' },
          { start: 51, end: 60, text: '"Pase lo que pase al otro lado... recuerda por qué empezamos."' },
          { start: 61, end: 72, text: '"No mires atrás. El futuro nos está esperando."' },
        ],
      },
      {
        id: 'sub-hi',
        language: 'Hindi (हिन्दी)',
        code: 'hi',
        cues: [
          { start: 2, end: 7, text: '[गहन सिनेमाई संगीत की गूंज]' },
          { start: 8, end: 15, text: `${displayTitle}: "हमारा हर फैसला इस अनंत क्षितिज पर असर डालता है।"` },
          { start: 16, end: 23, text: '"हम ठहरने के लिए नहीं, बल्कि सीमाओं को पार करने के लिए बने हैं।"' },
          { start: 24, end: 32, text: '[शक्तिशाली ध्वनि कंपन]' },
          { start: 33, end: 41, text: '"कक्षा प्रज्वलन की तैयारी करें। उल्टी गिनती: 3... 2... 1..."' },
          { start: 42, end: 50, text: '[रॉकेट इंजनों की प्रचंड गर्जना]' },
          { start: 51, end: 60, text: '"दूसरी तरफ चाहे कुछ भी हो... याद रखना हम क्यों निकले थे।"' },
          { start: 61, end: 72, text: '"पीछे मुड़कर मत देखो। हमारा भविष्य तैयार है।"' },
        ],
      },
      {
        id: 'sub-fr',
        language: 'French (Français)',
        code: 'fr',
        cues: [
          { start: 2, end: 7, text: '[Musique orchestrale atmosphérique en crescendo]' },
          { start: 8, end: 15, text: `${displayTitle}: "Chaque choix résonne à travers l'horizon infini."` },
          { start: 16, end: 23, text: '"Nous n\'étions pas faits pour rester immobiles. Nous sommes nés pour explorer."' },
          { start: 24, end: 32, text: '[Vibrations de basses profondes]' },
          { start: 33, end: 41, text: '"Trajectoire confirmée. Systèmes prêts dans 3... 2... 1..."' },
          { start: 42, end: 50, text: '[Les réacteurs s\'allument dans un éclat aveuglant]' },
          { start: 51, end: 60, text: '"Quoi qu\'il arrive de l\'autre côté... souvenez-vous de notre but."' },
          { start: 61, end: 72, text: '"Ne regardez pas en arrière. L\'avenir nous attend."' },
        ],
      },
      {
        id: 'sub-de',
        language: 'German (Deutsch)',
        code: 'de',
        cues: [
          { start: 2, end: 7, text: '[Atmosphärische orchestrale Musik schwillt an]' },
          { start: 8, end: 15, text: `${displayTitle}: "Jede Entscheidung hallt über den unendlichen Horizont wider."` },
          { start: 16, end: 23, text: '"Wir wurden nicht geboren, um stillzustehen. Wir wurden geboren, um zu forschen."' },
          { start: 24, end: 32, text: '[Intensive Bassfrequenzen]' },
          { start: 33, end: 41, text: '"Trajektorie verriegelt. Systeme bereit in 3... 2... 1..."' },
          { start: 42, end: 50, text: '[Triebwerke entflammen mit gewaltiger Energie]' },
          { start: 51, end: 60, text: '"Was auch immer drüben geschieht... vergesst nicht, warum wir begannen."' },
          { start: 61, end: 72, text: '"Blickt nicht zurück. Die Zukunft erwartet uns."' },
        ],
      },
      {
        id: 'sub-ja',
        language: 'Japanese (日本語)',
        code: 'ja',
        cues: [
          { start: 2, end: 7, text: '[荘厳な映画音楽が高まる]' },
          { start: 8, end: 15, text: `${displayTitle}: 「私たちの選んだ道は、無限の地平線に響き渡る。」` },
          { start: 16, end: 23, text: `「立ち止まるために生まれたのではない。未知を切り拓くために生まれた。」` },
          { start: 24, end: 32, text: `[重低音の振動が空間を満たす]` },
          { start: 33, end: 41, text: `「軌道推進点火準備。カウントダウン: 3... 2... 1...」` },
          { start: 42, end: 50, text: `[エンジンが眩い光と共に点火]` },
          { start: 51, end: 60, text: `「向こう側で何が起きようと、旅立った理由を忘れるな。」` },
          { start: 61, end: 72, text: `「振り返るな。未来が私たちを待っている。」` },
        ],
      },
    ];
  }, [media, displayTitle]);

  // Initialize active tracks
  useEffect(() => {
    if (availableAudioTracks.length > 0 && !activeAudioTrackId) {
      const defaultAudio = availableAudioTracks.find((a) => a.isDefault) || availableAudioTracks[0];
      setActiveAudioTrackId(defaultAudio.id);
    }
  }, [availableAudioTracks, activeAudioTrackId]);

  useEffect(() => {
    if (availableSubtitles.length > 0 && (!activeSubtitleTrackId || activeSubtitleTrackId === 'sub-en')) {
      const defaultSub = availableSubtitles.find((s) => s.isDefault) || availableSubtitles[0];
      setActiveSubtitleTrackId(defaultSub.id);
    }
  }, [availableSubtitles, activeSubtitleTrackId]);

  // Selected tracks
  const selectedAudioTrack = useMemo(() => {
    return availableAudioTracks.find((a) => a.id === activeAudioTrackId) || availableAudioTracks[0];
  }, [availableAudioTracks, activeAudioTrackId]);

  const selectedSubtitleTrack = useMemo(() => {
    if (activeSubtitleTrackId === 'off') return null;
    return availableSubtitles.find((s) => s.id === activeSubtitleTrackId) || availableSubtitles[0];
  }, [availableSubtitles, activeSubtitleTrackId]);

  // Generate WebVTT blob track URLs
  const trackBlobUrls = useMemo(() => {
    const urls: Record<string, string> = {};
    availableSubtitles.forEach((track) => {
      urls[track.id] = generateVttBlobUrl(track.cues);
    });
    return urls;
  }, [availableSubtitles]);

  // Toast feedback helper
  const triggerToast = (msg: string) => {
    setActionToast(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setActionToast(null), 2500);
  };

  // Direct timeupdate handler from HTML5 video element with virtual full duration mapping
  const handleTimeUpdate = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const rawTime = e.currentTarget.currentTime;
      const effectiveTime = Math.min(
        totalDuration,
        Math.round(rawTime + virtualOffsetRef.current)
      );
      setCurrentTime(effectiveTime);
      if (onTimeUpdate) {
        onTimeUpdate(effectiveTime, totalDuration);
      }

      // Live cue sync
      if (!selectedSubtitleTrack || activeSubtitleTrackId === 'off') {
        setCurrentSubtitleText(null);
        return;
      }

      const cueEffectiveTime = Math.max(0, rawTime + captionOffset);
      const cues = selectedSubtitleTrack.cues;
      if (!cues || cues.length === 0) {
        setCurrentSubtitleText(null);
        return;
      }

      const maxEnd = cues[cues.length - 1]?.end || 120;
      const lookupTime = cueEffectiveTime <= maxEnd ? cueEffectiveTime : cueEffectiveTime % maxEnd;
      const matchedCue = cues.find((c) => lookupTime >= c.start && lookupTime <= c.end);
      setCurrentSubtitleText(matchedCue ? matchedCue.text : null);
    },
    [captionOffset, onTimeUpdate, selectedSubtitleTrack, activeSubtitleTrackId, totalDuration]
  );

  // Sync subtitle text when switching subtitles or sync offset while paused
  useEffect(() => {
    if (!selectedSubtitleTrack || activeSubtitleTrackId === 'off') {
      setCurrentSubtitleText(null);
      return;
    }
    const targetTime = videoRef.current ? videoRef.current.currentTime : (currentTime % 120);
    const effectiveTime = Math.max(0, targetTime + captionOffset);
    const cues = selectedSubtitleTrack.cues;
    if (!cues || cues.length === 0) {
      setCurrentSubtitleText(null);
      return;
    }
    const maxEnd = cues[cues.length - 1]?.end || 120;
    const lookupTime = effectiveTime <= maxEnd ? effectiveTime : effectiveTime % maxEnd;
    const matchedCue = cues.find((c) => lookupTime >= c.start && lookupTime <= c.end);
    setCurrentSubtitleText(matchedCue ? matchedCue.text : null);
  }, [selectedSubtitleTrack, activeSubtitleTrackId, captionOffset, currentTime]);

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const rawDur = e.currentTarget.duration;
    const finalDuration = expectedTotalDuration > (rawDur || 0) ? expectedTotalDuration : Math.round(rawDur || 7200);
    setTotalDuration(finalDuration);

    if (initialTime > 0) {
      if (rawDur && rawDur > 0 && initialTime >= rawDur) {
        const streamSeek = initialTime % rawDur;
        virtualOffsetRef.current = initialTime - streamSeek;
        e.currentTarget.currentTime = streamSeek;
      } else {
        virtualOffsetRef.current = 0;
        e.currentTarget.currentTime = initialTime;
      }
      setCurrentTime(initialTime);
    } else {
      virtualOffsetRef.current = 0;
    }

    e.currentTarget.playbackRate = playbackSpeed;
    e.currentTarget.volume = volume;
    e.currentTarget.muted = isMuted;
    if (autoPlay) {
      e.currentTarget.play().catch(() => {});
    }
  };

  const handleVideoEnded = () => {
    if (videoRef.current && currentTime < totalDuration - 10) {
      // Loop the stream preview seamlessly while keeping track of virtual time
      const streamDur = videoRef.current.duration || 600;
      virtualOffsetRef.current += streamDur;
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else {
      setIsPlaying(false);
      if (isSeries && onNextEpisode) {
        triggerToast('Playing next episode...');
        setTimeout(() => onNextEpisode(), 1500);
      }
    }
  };

  // Playback controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
    setShowControls(true);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    const shouldMute = newVol === 0;
    setIsMuted(shouldMute);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = shouldMute;
    }
  };

  const seekRelative = (deltaSeconds: number) => {
    const nextTime = Math.max(0, Math.min(totalDuration, currentTime + deltaSeconds));
    setCurrentTime(nextTime);
    if (videoRef.current) {
      const rawDur = videoRef.current.duration;
      if (rawDur && rawDur > 0 && nextTime >= rawDur) {
        const streamSeek = nextTime % rawDur;
        virtualOffsetRef.current = nextTime - streamSeek;
        videoRef.current.currentTime = streamSeek;
      } else {
        virtualOffsetRef.current = 0;
        videoRef.current.currentTime = nextTime;
      }
    }
    if (onTimeUpdate) {
      onTimeUpdate(nextTime, totalDuration);
    }
    triggerToast(deltaSeconds > 0 ? `+${deltaSeconds}s` : `${deltaSeconds}s`);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      const rawDur = videoRef.current.duration;
      if (rawDur && rawDur > 0 && newTime >= rawDur) {
        const streamSeek = newTime % rawDur;
        virtualOffsetRef.current = newTime - streamSeek;
        videoRef.current.currentTime = streamSeek;
      } else {
        virtualOffsetRef.current = 0;
        videoRef.current.currentTime = newTime;
      }
    }
    if (onTimeUpdate) {
      onTimeUpdate(newTime, totalDuration);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleSelectSpeed = (s: number) => {
    setPlaybackSpeed(s);
    if (videoRef.current) {
      videoRef.current.playbackRate = s;
    }
    setShowSpeedMenu(false);
    triggerToast(`${s}x Speed`);
  };

  const handleSelectAudioTrack = (trackId: string) => {
    const track = availableAudioTracks.find((t) => t.id === trackId);
    if (!track) return;
    setActiveAudioTrackId(trackId);
    triggerToast(`Audio: ${track.language}`);
  };

  const handleSelectSubtitle = (subId: string) => {
    setActiveSubtitleTrackId(subId);
    const sub = availableSubtitles.find((s) => s.id === subId);
    triggerToast(subId === 'off' ? 'Subtitles: Off' : `Subtitles: ${sub?.language || subId}`);
  };

  const adjustCaptionOffset = (delta: number) => {
    setCaptionOffset((prev) => {
      const updated = Math.round((prev + delta) * 10) / 10;
      const clamped = Math.max(-2.0, Math.min(2.0, updated));
      triggerToast(`Sync Offset: ${clamped > 0 ? '+' : ''}${clamped.toFixed(1)}s`);
      return clamped;
    });
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowleft':
          e.preventDefault();
          seekRelative(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          seekRelative(10);
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case 'c':
          e.preventDefault();
          setActiveSubtitleTrackId((prev) => (prev === 'off' ? 'sub-en' : 'off'));
          break;
        case 'escape':
          setShowAudioSubtitleModal(false);
          setShowSpeedMenu(false);
          setShowEpisodesDrawer(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, isMuted, isPlaying]);

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showAudioSubtitleModal && !showSpeedMenu && !showEpisodesDrawer) {
        setShowControls(false);
      }
    }, 3500);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-screen h-screen bg-black overflow-hidden select-none cursor-default"
    >
      {/* Primary Video / Audio Element Engine */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
        {playbackMode === 'video' ? (
          <video
            ref={videoRef}
            id="cinestream-custom-video"
            src={selectedAudioTrack?.src || defaultVideoUrl}
            poster={media?.backdrop_path || undefined}
            autoPlay={autoPlay}
            playsInline
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleVideoEnded}
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
          >
            {availableSubtitles.map((track) => (
              <track
                key={track.id}
                kind="subtitles"
                src={trackBlobUrls[track.id]}
                srcLang={track.code}
                label={track.language}
                default={track.id === activeSubtitleTrackId}
              />
            ))}
          </video>
        ) : (
          <iframe
            id="cinestream-youtube-frame"
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${trailerKey}?enablejsapi=1&autoplay=1&mute=${isMuted ? '1' : '0'}&controls=0&loop=1&playlist=${trailerKey}&rel=0&playsinline=1`}
            title={displayTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-[120vw] h-[120vh] max-w-none border-0 pointer-events-none"
          />
        )}
      </div>

      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/60" />

      {/* Synchronized Subtitle Display Overlay (Positioned Safely Above Controls) */}
      {currentSubtitleText && activeSubtitleTrackId !== 'off' && (
        <div
          className={`absolute left-0 right-0 z-20 flex justify-center pointer-events-none transition-all duration-300 px-4 ${
            showControls ? 'bottom-24 sm:bottom-28' : 'bottom-16 sm:bottom-20'
          }`}
        >
          <div className="bg-black/75 text-white px-4 py-1.5 rounded-md backdrop-blur-sm shadow-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-base sm:text-lg md:text-2xl font-semibold max-w-[80%] mx-auto text-center tracking-wide leading-relaxed animate-in fade-in duration-200">
            {currentSubtitleText}
          </div>
        </div>
      )}

      {/* Action Toast Feedback */}
      {actionToast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 text-white border border-zinc-700/80 px-4 py-2 rounded-full backdrop-blur-md shadow-2xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-4 h-4 text-red-500" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Top Bar Navigation & Info */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-6 transition-opacity duration-300 bg-gradient-to-b from-black/90 to-transparent ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back"
              className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white backdrop-blur-md transition-all hover:scale-105 cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-5 h-5 -rotate-90" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-white font-bold text-lg sm:text-xl drop-shadow-md">{displayTitle}</h1>
              {media?.maturity_rating && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-800/90 border border-zinc-700 text-zinc-300">
                  {media.maturity_rating}
                </span>
              )}
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-600/90 text-white tracking-wider">
                4K ULTRA HD
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-800/90 text-zinc-300">
                {selectedAudioTrack?.language || 'English 5.1'}
              </span>
            </div>
            {isSeries && currentEpisode && (
              <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
                S{currentSeasonNumber}:E{currentEpisodeNumber} • &ldquo;{currentEpisode.name}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Source Mode Toggle (High-Bitrate Direct Stream vs Official Trailer) */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-zinc-900/80 border border-zinc-700/80 rounded-full p-1 backdrop-blur-md">
            <button
              onClick={() => {
                setPlaybackMode('video');
                triggerToast('Mode: Direct Master Stream');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                playbackMode === 'video'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Master Stream
            </button>
            <button
              onClick={() => {
                setPlaybackMode('trailer');
                triggerToast('Mode: Official Cinema Trailer');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                playbackMode === 'trailer'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Trailer
            </button>
          </div>
        </div>
      </div>

      {/* Skip Intro Button (Visible in early playback) */}
      {currentTime >= 5 && currentTime <= 95 && showControls && (
        <button
          onClick={() => seekRelative(85)}
          className="absolute right-8 bottom-32 z-30 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-white border border-zinc-700 font-semibold text-sm backdrop-blur-md shadow-2xl transition-transform hover:scale-105 cursor-pointer"
        >
          <FastForward className="w-4 h-4 text-red-500" />
          <span>Skip Intro (+85s)</span>
        </button>
      )}

      {/* Bottom Control Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 p-6 pt-12 transition-opacity duration-300 bg-gradient-to-t from-black/95 via-black/70 to-transparent ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar & Scrubbing */}
        <div className="group/progress relative flex items-center mb-4 cursor-pointer">
          <input
            type="range"
            min={0}
            max={totalDuration || 100}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Seek time"
            className="w-full h-1.5 bg-zinc-700/60 rounded-full appearance-none accent-red-600 hover:h-2.5 transition-all cursor-pointer"
            style={{
              background: `linear-gradient(to right, #dc2626 ${(currentTime / (totalDuration || 1)) * 100}%, #3f3f46 ${(currentTime / (totalDuration || 1)) * 100}%)`,
            }}
          />
        </div>

        {/* Buttons and Menu Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="p-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all hover:scale-105 cursor-pointer shadow-lg"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
            </button>

            {/* Rewind 10s */}
            <button
              onClick={() => seekRelative(-10)}
              aria-label="Rewind 10 seconds"
              className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Forward 10s */}
            <button
              onClick={() => seekRelative(10)}
              aria-label="Forward 10 seconds"
              className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                aria-label="Volume slider"
                className="w-16 sm:w-24 h-1 bg-zinc-700 rounded-full appearance-none accent-red-600 cursor-pointer hidden sm:block"
              />
            </div>

            {/* Time Stamp Display */}
            <div className="text-zinc-400 text-xs sm:text-sm font-medium tabular-nums">
              <span className="text-white font-semibold">{formatTime(currentTime)}</span> / {formatTime(totalDuration)}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            {/* TV Show Episodes Drawer Toggle */}
            {isSeries && seasonsData.length > 0 && (
              <button
                onClick={() => setShowEpisodesDrawer((prev) => !prev)}
                className="flex items-center gap-1.5 text-zinc-300 hover:text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md hover:bg-zinc-800/80 transition-colors cursor-pointer"
              >
                <Tv className="w-4 h-4" />
                <span className="hidden sm:inline">Episodes</span>
              </button>
            )}

            {/* Next Episode Button */}
            {isSeries && onNextEpisode && (
              <button
                onClick={onNextEpisode}
                aria-label="Next Episode"
                className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Next Episode"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            )}

            {/* Audio Dubbing & Subtitles Menu Trigger */}
            <button
              onClick={() => {
                setShowAudioSubtitleModal((prev) => !prev);
                setShowSpeedMenu(false);
              }}
              aria-label="Audio & Subtitles"
              className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                showAudioSubtitleModal || activeSubtitleTrackId !== 'off'
                  ? 'bg-red-600/90 text-white shadow-md'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <Languages className="w-4 h-4" />
              <span className="hidden md:inline">Audio &amp; Subtitles</span>
            </button>

            {/* Playback Speed Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSpeedMenu((prev) => !prev);
                  setShowAudioSubtitleModal(false);
                }}
                className="text-zinc-300 hover:text-white text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-md hover:bg-zinc-800/80 transition-colors cursor-pointer"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute right-0 bottom-12 w-32 bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-2xl py-1 z-40 backdrop-blur-md">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                    Speed
                  </div>
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSelectSpeed(s)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                        playbackSpeed === s ? 'text-red-500 font-bold bg-zinc-800/60' : 'text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <span>{s === 1.0 ? '1.0x (Normal)' : `${s}x`}</span>
                      {playbackSpeed === s && <Check className="w-3.5 h-3.5 text-red-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Netflix-Style Audio & Subtitles Selection Dialog */}
      {showAudioSubtitleModal && (
        <div className="absolute right-6 bottom-24 z-50 w-[92vw] max-w-lg bg-zinc-900/95 border border-zinc-700/90 rounded-xl shadow-2xl p-5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-red-500" />
              <h2 className="text-white font-bold text-base">Audio &amp; Subtitles Engine</h2>
            </div>
            <button
              onClick={() => setShowAudioSubtitleModal(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Audio Dubbing Column */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Audio Dubs</span>
                <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">Real-time</span>
              </div>
              <div className="space-y-1">
                {availableAudioTracks.map((track) => {
                  const isSelected = track.id === activeAudioTrackId;
                  return (
                    <button
                      key={track.id}
                      onClick={() => handleSelectAudioTrack(track.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-red-600/20 text-white font-semibold border border-red-500/40'
                          : 'text-zinc-300 hover:bg-zinc-800/80 border border-transparent'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{track.language}</span>
                        {track.isDefault && <span className="text-[10px] text-zinc-500">Master Track</span>}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-red-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subtitles Column */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Subtitles</span>
                <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">Synced</span>
              </div>
              <div className="space-y-1">
                {/* Off Option */}
                <button
                  onClick={() => handleSelectSubtitle('off')}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                    activeSubtitleTrackId === 'off'
                      ? 'bg-red-600/20 text-white font-semibold border border-red-500/40'
                      : 'text-zinc-300 hover:bg-zinc-800/80 border border-transparent'
                  }`}
                >
                  <span>Off</span>
                  {activeSubtitleTrackId === 'off' && <Check className="w-4 h-4 text-red-500 shrink-0" />}
                </button>

                {availableSubtitles.map((track) => {
                  const isSelected = track.id === activeSubtitleTrackId;
                  return (
                    <button
                      key={track.id}
                      onClick={() => handleSelectSubtitle(track.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-red-600/20 text-white font-semibold border border-red-500/40'
                          : 'text-zinc-300 hover:bg-zinc-800/80 border border-transparent'
                      }`}
                    >
                      <span>{track.language}</span>
                      {isSelected && <Check className="w-4 h-4 text-red-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Subtitle Audio Sync Offset Fine-Tuning */}
              {activeSubtitleTrackId !== 'off' && (
                <div className="mt-4 pt-3 border-t border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                      Sync Calibration
                    </span>
                    <span className="text-[11px] font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">
                      {captionOffset > 0 ? `+${captionOffset.toFixed(1)}s` : `${captionOffset.toFixed(1)}s`}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => adjustCaptionOffset(-0.5)}
                      className="px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-medium transition-colors cursor-pointer"
                    >
                      -0.5s Earlier
                    </button>
                    <button
                      onClick={() => {
                        setCaptionOffset(0);
                        triggerToast('Sync Offset: Reset to 0.0s');
                      }}
                      className="px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-medium transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => adjustCaptionOffset(0.5)}
                      className="px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-medium transition-colors cursor-pointer"
                    >
                      +0.5s Later
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Episodes Drawer (TV Series) */}
      {showEpisodesDrawer && isSeries && seasonsData.length > 0 && (
        <div className="absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-zinc-950/95 border-l border-zinc-800 z-50 p-6 flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-white font-bold text-lg">{displayTitle}</h3>
              <p className="text-zinc-400 text-xs mt-0.5">Seasons &amp; Episodes</p>
            </div>
            <button
              onClick={() => setShowEpisodesDrawer(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
            {seasonsData.map((season) => (
              <div key={season.id} className="space-y-2">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                  {season.name} ({season.episodes.length} Episodes)
                </div>
                <div className="space-y-1.5">
                  {season.episodes.map((ep) => {
                    const isCurrent =
                      season.season_number === currentSeasonNumber &&
                      ep.episode_number === currentEpisodeNumber;
                    return (
                      <button
                        key={ep.id}
                        onClick={() => {
                          if (onSelectEpisode) {
                            onSelectEpisode(season.season_number, ep.episode_number);
                          }
                          setShowEpisodesDrawer(false);
                          triggerToast(`Playing S${season.season_number}:E${ep.episode_number}`);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg transition-all cursor-pointer flex gap-3 items-start ${
                          isCurrent
                            ? 'bg-red-600/20 border border-red-500/50 text-white'
                            : 'hover:bg-zinc-900 border border-transparent text-zinc-300'
                        }`}
                      >
                        <div className="relative w-16 h-10 bg-zinc-800 rounded overflow-hidden shrink-0 flex items-center justify-center">
                          <Film className="w-4 h-4 text-zinc-600" />
                          {isCurrent && isPlaying && (
                            <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                              <Play className="w-3.5 h-3.5 fill-white text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {ep.episode_number}. {ep.name}
                          </p>
                          <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{ep.overview}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

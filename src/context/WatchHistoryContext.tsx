import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { MediaItem, WatchProgress } from '../types/media';
import { MOCK_MEDIA_ITEMS } from '../services/mockData';

export type { WatchProgress };

interface WatchHistoryContextType {
  watchHistory: WatchProgress[];
  history: WatchProgress[]; // alias for compatibility
  updateProgress: (
    mediaOrId: MediaItem | string | number,
    currentTime: number,
    duration: number,
    optionalMedia?: MediaItem
  ) => void;
  getMediaProgress: (mediaId: string | number) => WatchProgress | null;
  removeFromHistory: (mediaId: string | number) => void;
  clearHistory: () => void;
  getContinueWatchingItems: () => MediaItem[];
}

const STORAGE_KEY = 'cinestream_watch_history';

// Seed initial realistic demo history so "Continue Watching" is immediately active
const INITIAL_DEMO_HISTORY: WatchProgress[] = [
  {
    mediaId: '101', // Interstellar
    media: MOCK_MEDIA_ITEMS.find((m) => m.id === 101)!,
    currentTime: 3600, // 1h in
    duration: 7200, // 2h 00m
    updatedAt: Date.now() - 1000 * 60 * 45, // 45 mins ago
  },
  {
    mediaId: '102', // Cyberpunk
    media: MOCK_MEDIA_ITEMS.find((m) => m.id === 102)!,
    currentTime: 1200, // 20m in
    duration: 3000, // 50m
    updatedAt: Date.now() - 1000 * 60 * 180, // 3 hours ago
  },
  {
    mediaId: '104', // Dune Part Two
    media: MOCK_MEDIA_ITEMS.find((m) => m.id === 104)!,
    currentTime: 3000, // 50m in
    duration: 7200, // 2h 00m
    updatedAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
].filter((item) => item.media !== undefined);

const WatchHistoryContext = createContext<WatchHistoryContextType | undefined>(undefined);

export const WatchHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchHistory, setWatchHistory] = useState<WatchProgress[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('cinestream_watch_history_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize legacy shape if needed
          return parsed.map((item: any) => {
            const mId = String(item.mediaId || item.id);
            const mediaObj =
              item.media ||
              item.mediaItem ||
              MOCK_MEDIA_ITEMS.find((m) => String(m.id) === mId) || {
                id: Number(mId) || 101,
                title: 'Featured Title',
                overview: '',
                poster_path: '',
                backdrop_path: '',
                vote_average: 8.5,
                media_type: 'movie',
                genre_ids: [],
              };
            return {
              mediaId: mId,
              media: mediaObj,
              currentTime: Number(item.currentTime) || 0,
              duration: Number(item.duration) || 7200,
              updatedAt: Number(item.updatedAt || item.lastWatched) || Date.now(),
            };
          }).sort((a, b) => b.updatedAt - a.updatedAt);
        }
      }
    } catch {
      // ignore JSON errors
    }
    return INITIAL_DEMO_HISTORY;
  });

  const historyRef = useRef(watchHistory);
  historyRef.current = watchHistory;

  // Persist to localStorage key cinestream_watch_history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchHistory));
    } catch {
      // ignore storage errors
    }
  }, [watchHistory]);

  const updateProgress = useCallback(
    (
      mediaOrId: MediaItem | string | number,
      currentTime: number,
      duration: number,
      optionalMedia?: MediaItem
    ) => {
      let targetMedia: MediaItem;
      let targetId: string;

      if (typeof mediaOrId === 'object' && mediaOrId !== null) {
        targetMedia = mediaOrId;
        targetId = String(mediaOrId.id);
      } else {
        targetId = String(mediaOrId);
        targetMedia =
          optionalMedia ||
          MOCK_MEDIA_ITEMS.find((m) => String(m.id) === targetId) || {
            id: Number(targetId) || 101,
            title: 'Featured Presentation',
            overview: '',
            poster_path: '',
            backdrop_path: '',
            vote_average: 8.5,
            media_type: 'movie',
            genre_ids: [],
          };
      }

      const validDuration = Math.round(duration > 0 ? duration : targetMedia.duration ? 7200 : 7200);
      const validCurrentTime = Math.round(Math.max(0, Math.min(validDuration, currentTime)));

      setWatchHistory((prev) => {
        const existing = prev.find((item) => String(item.mediaId) === targetId);

        // Avoid excessive writes if change is < 1 second and same duration
        if (
          existing &&
          Math.abs(existing.currentTime - validCurrentTime) < 1 &&
          existing.duration === validDuration
        ) {
          return prev;
        }

        const filtered = prev.filter((item) => String(item.mediaId) !== targetId);

        const newEntry: WatchProgress = {
          mediaId: targetId,
          media: targetMedia || existing?.media,
          currentTime: validCurrentTime,
          duration: validDuration,
          updatedAt: Date.now(),
        };

        // Keep sorted by updatedAt descending
        return [newEntry, ...filtered];
      });
    },
    []
  );

  const getMediaProgress = useCallback((mediaId: string | number): WatchProgress | null => {
    const idStr = String(mediaId);
    return historyRef.current.find((h) => String(h.mediaId) === idStr) || null;
  }, []);

  const removeFromHistory = useCallback((mediaId: string | number) => {
    const idStr = String(mediaId);
    setWatchHistory((prev) => prev.filter((h) => String(h.mediaId) !== idStr));
  }, []);

  const clearHistory = useCallback(() => {
    setWatchHistory([]);
  }, []);

  const getContinueWatchingItems = useCallback((): MediaItem[] => {
    return historyRef.current
      .filter((h) => h.duration > 0 && h.currentTime < h.duration * 0.98)
      .map((h) => h.media);
  }, []);

  return (
    <WatchHistoryContext.Provider
      value={{
        watchHistory,
        history: watchHistory,
        updateProgress,
        getMediaProgress,
        removeFromHistory,
        clearHistory,
        getContinueWatchingItems,
      }}
    >
      {children}
    </WatchHistoryContext.Provider>
  );
};

export function useWatchHistory(): WatchHistoryContextType {
  const context = useContext(WatchHistoryContext);
  if (!context) {
    throw new Error('useWatchHistory must be used within a WatchHistoryProvider');
  }
  return context;
}

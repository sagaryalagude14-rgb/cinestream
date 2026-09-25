import React, { createContext, useContext, useEffect, useState } from 'react';
import { MediaItem } from '../types/media';

interface SavedMediaContextType {
  savedList: MediaItem[];
  addToSaved: (item: MediaItem) => void;
  removeFromSaved: (id: number) => void;
  toggleSaved: (item: MediaItem) => void;
  isSaved: (id: number) => boolean;
  clearList: () => void;
}

const STORAGE_KEY = 'cinestream_watchlist_v1';

const SavedMediaContext = createContext<SavedMediaContextType | undefined>(undefined);

export const SavedMediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedList, setSavedList] = useState<MediaItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedList));
    } catch {
      // ignore
    }
  }, [savedList]);

  const isSaved = (id: number) => savedList.some((item) => item.id === id);

  const addToSaved = (item: MediaItem) => {
    setSavedList((prev) => {
      if (prev.some((m) => m.id === item.id)) return prev;
      return [item, ...prev];
    });
  };

  const removeFromSaved = (id: number) => {
    setSavedList((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleSaved = (item: MediaItem) => {
    if (isSaved(item.id)) {
      removeFromSaved(item.id);
    } else {
      addToSaved(item);
    }
  };

  const clearList = () => {
    setSavedList([]);
  };

  return (
    <SavedMediaContext.Provider
      value={{
        savedList,
        addToSaved,
        removeFromSaved,
        toggleSaved,
        isSaved,
        clearList,
      }}
    >
      {children}
    </SavedMediaContext.Provider>
  );
};

export function useSavedMedia(): SavedMediaContextType {
  const context = useContext(SavedMediaContext);
  if (!context) {
    throw new Error('useSavedMedia must be used within a SavedMediaProvider');
  }
  return context;
}

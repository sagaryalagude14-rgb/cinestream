import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { MediaItem } from '../types/media';

export interface UserProfile {
  id: string;
  name: string;
  avatarColor: string; // Tailwind gradient or hex e.g. 'from-red-600 to-rose-700'
  avatarIcon?: string;
  isKidsMode: boolean;
  pinProtected?: boolean;
}

interface ProfileContextType {
  profiles: UserProfile[];
  activeProfile: UserProfile;
  selectProfile: (id: string) => void;
  addProfile: (profile: Omit<UserProfile, 'id'>) => UserProfile;
  updateProfile: (id: string, updates: Partial<UserProfile>) => void;
  deleteProfile: (id: string) => void;
  filterForActiveProfile: (items: MediaItem[]) => MediaItem[];
  isRestrictedTitle: (item: MediaItem) => boolean;
}

const STORAGE_PROFILES_KEY = 'cinestream_user_profiles_v1';
const STORAGE_ACTIVE_PROFILE_KEY = 'cinestream_active_profile_id_v1';

export const AVATAR_COLOR_PRESETS = [
  { id: 'red', name: 'Crimson Fury', gradient: 'from-red-600 via-rose-600 to-amber-600' },
  { id: 'blue', name: 'Electric Cobalt', gradient: 'from-blue-600 via-indigo-600 to-cyan-500' },
  { id: 'emerald', name: 'Aurora Emerald', gradient: 'from-emerald-500 via-teal-600 to-cyan-600' },
  { id: 'purple', name: 'Cosmic Violet', gradient: 'from-purple-600 via-fuchsia-600 to-pink-500' },
  { id: 'amber', name: 'Golden Sol', gradient: 'from-amber-500 via-orange-600 to-red-500' },
  { id: 'kids', name: 'Kids Neon Yellow', gradient: 'from-yellow-400 via-amber-500 to-emerald-400' },
];

const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'profile-main',
    name: 'Alex (Main)',
    avatarColor: 'from-red-600 via-rose-600 to-amber-600',
    isKidsMode: false,
  },
  {
    id: 'profile-scifi',
    name: 'Sci-Fi Fan',
    avatarColor: 'from-blue-600 via-indigo-600 to-cyan-500',
    isKidsMode: false,
  },
  {
    id: 'profile-kids',
    name: 'Kids Zone',
    avatarColor: 'from-yellow-400 via-amber-500 to-emerald-400',
    isKidsMode: true,
  },
];

// Mature ratings to filter out in Kids mode
const MATURE_RATINGS = new Set(['R', 'TV-MA', 'NC-17', '18+']);
// Mature genre IDs: 27 (Horror), 80 (Crime), 53 (Thriller)
const MATURE_GENRE_IDS = new Set([27, 80, 53]);

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PROFILES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ACTIVE_PROFILE_KEY);
      if (stored && profiles.some((p) => p.id === stored)) {
        return stored;
      }
    } catch {
      // ignore
    }
    return profiles[0]?.id || 'profile-main';
  });

  // Sync profiles to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
    } catch {
      // ignore
    }
  }, [profiles]);

  // Sync activeProfileId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_PROFILE_KEY, activeProfileId);
    } catch {
      // ignore
    }
  }, [activeProfileId]);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0] || DEFAULT_PROFILES[0];

  const selectProfile = useCallback((id: string) => {
    if (profiles.some((p) => p.id === id)) {
      setActiveProfileId(id);
    }
  }, [profiles]);

  const addProfile = useCallback((profileData: Omit<UserProfile, 'id'>): UserProfile => {
    const newProfile: UserProfile = {
      ...profileData,
      id: `profile-${Date.now()}`,
    };
    setProfiles((prev) => [...prev, newProfile]);
    return newProfile;
  }, []);

  const updateProfile = useCallback((id: string, updates: Partial<UserProfile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setProfiles((prev) => {
      if (prev.length <= 1) return prev; // Keep at least one profile
      const filtered = prev.filter((p) => p.id !== id);
      if (activeProfileId === id) {
        setActiveProfileId(filtered[0].id);
      }
      return filtered;
    });
  }, [activeProfileId]);

  // Determine if a title is restricted based on kids mode
  const isRestrictedTitle = useCallback((item: MediaItem): boolean => {
    if (!activeProfile.isKidsMode) return false;

    // Check age rating
    if (item.maturity_rating && MATURE_RATINGS.has(item.maturity_rating)) {
      return true;
    }

    // Check genre IDs
    if (item.genre_ids && item.genre_ids.some((gid) => MATURE_GENRE_IDS.has(gid))) {
      return true;
    }

    return false;
  }, [activeProfile.isKidsMode]);

  // Filter content array for active profile
  const filterForActiveProfile = useCallback((items: MediaItem[]): MediaItem[] => {
    if (!activeProfile.isKidsMode) return items;
    return items.filter((item) => !isRestrictedTitle(item));
  }, [activeProfile.isKidsMode, isRestrictedTitle]);

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        selectProfile,
        addProfile,
        updateProfile,
        deleteProfile,
        filterForActiveProfile,
        isRestrictedTitle,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

export type MediaType = 'movie' | 'tv';

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department?: string;
  profile_path?: string;
}

export interface Episode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string;
  runtime?: number | string;
  duration?: string;
  vote_average?: number;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  episodes: Episode[];
  overview?: string;
}

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: MediaType;
  genre_ids: number[];
  // Extended fields for rich modal & watch experiences
  trailer_key?: string;
  maturity_rating?: string;
  match_percentage?: number;
  duration?: string;
  seasons?: number;
  seasons_data?: Season[];
  cast?: string[];
  director?: string;
  genres?: string[];
  cast_members?: CastMember[];
  crew_members?: CrewMember[];
}

export interface WatchProgress {
  mediaId: string;
  media: MediaItem;
  currentTime: number;
  duration: number;
  updatedAt: number;
}

export interface MediaResponse {
  page: number;
  results: MediaItem[];
  total_pages: number;
  total_results?: number;
}

export type CategoryPillItem = {
  id: string;
  name: string;
  genreId?: number;
  type?: 'all' | 'movie' | 'tv';
};

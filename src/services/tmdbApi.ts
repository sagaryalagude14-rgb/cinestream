import { MediaItem, MediaResponse, CastMember, CrewMember } from '../types/media';
import { TMDB_BASE_URL } from '../utils/constants';
import {
  MOCK_MEDIA_ITEMS,
  getOrGenerateSeasons,
  getOrGenerateCastAndCrew,
  ITEM_VIDEO_URLS,
  DEFAULT_FALLBACK_STREAM,
  getDefaultAudioTracks,
  getDefaultSubtitles,
} from './mockData';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';

const hasApiKey = Boolean(API_KEY && API_KEY.trim() !== '' && API_KEY !== 'undefined');

/**
 * Filter mock data for simulated endpoints
 */
function getMockFiltered(filterType: string, param?: number | string): MediaItem[] {
  switch (filterType) {
    case 'movie':
      return MOCK_MEDIA_ITEMS.filter((item) => item.media_type === 'movie');
    case 'tv':
      return MOCK_MEDIA_ITEMS.filter((item) => item.media_type === 'tv');
    case 'top_rated':
      return [...MOCK_MEDIA_ITEMS].sort((a, b) => b.vote_average - a.vote_average);
    case 'trending':
      return MOCK_MEDIA_ITEMS;
    case 'genre':
      if (typeof param === 'number') {
        const matching = MOCK_MEDIA_ITEMS.filter((item) => item.genre_ids.includes(param));
        return matching.length > 0 ? matching : MOCK_MEDIA_ITEMS.slice(0, 8);
      }
      return MOCK_MEDIA_ITEMS;
    case 'search':
      if (typeof param === 'string' && param.trim()) {
        const q = param.toLowerCase().trim();
        return MOCK_MEDIA_ITEMS.filter((item) => {
          const title = (item.title || item.name || '').toLowerCase();
          const overview = item.overview.toLowerCase();
          const genres = (item.genres || []).join(' ').toLowerCase();
          return title.includes(q) || overview.includes(q) || genres.includes(q);
        });
      }
      return MOCK_MEDIA_ITEMS;
    default:
      return MOCK_MEDIA_ITEMS;
  }
}

export async function fetchFromTmdb(endpoint: string, params: Record<string, string | number> = {}): Promise<MediaResponse> {
  if (!hasApiKey) {
    // Return mock response based on endpoint pattern
    return getSimulatedResponse(endpoint, params);
  }

  try {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.set('api_key', API_KEY);
    url.searchParams.set('language', 'en-US');
    Object.entries(params).forEach(([k, v]) => {
      url.searchParams.set(k, String(v));
    });

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return {
      page: data.page || 1,
      results: data.results || [],
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0,
    };
  } catch {
    // Graceful fallback to mock data on network error or invalid key
    return getSimulatedResponse(endpoint, params);
  }
}

function getSimulatedResponse(endpoint: string, params: Record<string, string | number>): MediaResponse {
  let results: MediaItem[] = [];

  if (endpoint.includes('/search/')) {
    results = getMockFiltered('search', params.query);
  } else if (endpoint.includes('top_rated')) {
    results = getMockFiltered('top_rated');
  } else if (endpoint.includes('tv') && !endpoint.includes('movie')) {
    results = getMockFiltered('tv');
  } else if (endpoint.includes('movie') && !endpoint.includes('tv')) {
    results = getMockFiltered('movie');
  } else if (params.with_genres) {
    results = getMockFiltered('genre', Number(params.with_genres));
  } else {
    results = getMockFiltered('trending');
  }

  return {
    page: 1,
    results,
    total_pages: 1,
    total_results: results.length,
  };
}

export async function fetchMediaDetails(id: number | string, type?: 'movie' | 'tv'): Promise<MediaItem> {
  const targetIdStr = String(id);
  const numericId = Number(id);
  const found = MOCK_MEDIA_ITEMS.find((item) => String(item.id) === targetIdStr || item.id === numericId);
  const effectiveType = type || found?.media_type || 'movie';

  if (hasApiKey) {
    try {
      const url = `${TMDB_BASE_URL}/${effectiveType}/${id}?api_key=${API_KEY}&append_to_response=videos,credits`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const trailer = data.videos?.results?.find(
          (v: { type: string; site: string; key: string }) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );
        const castList = (data.credits?.cast || []).slice(0, 6).map((c: { name: string }) => c.name);
        const castMembers: CastMember[] = (data.credits?.cast || []).slice(0, 8).map((c: { id: number; name: string; character?: string; profile_path?: string }) => ({
          id: c.id,
          name: c.name,
          character: c.character || 'Leading Role',
          profile_path: c.profile_path,
        }));
        const crewMembers: CrewMember[] = (data.credits?.crew || [])
          .filter((c: { job: string }) => ['Director', 'Producer', 'Executive Producer', 'Screenplay', 'Writer', 'Original Music Composer', 'Director of Photography'].includes(c.job))
          .slice(0, 5)
          .map((c: { id: number; name: string; job: string; department?: string; profile_path?: string }) => ({
            id: c.id,
            name: c.name,
            job: c.job,
            department: c.department,
            profile_path: c.profile_path,
          }));

        return {
          id: data.id,
          title: data.title,
          name: data.name,
          overview: data.overview || (found?.overview ?? 'No overview available.'),
          poster_path: data.poster_path || found?.poster_path || '',
          backdrop_path: data.backdrop_path || found?.backdrop_path || '',
          vote_average: Number(data.vote_average?.toFixed(1)) || 8.0,
          release_date: data.release_date,
          first_air_date: data.first_air_date,
          media_type: type,
          genre_ids: (data.genres || []).map((g: { id: number }) => g.id),
          genres: (data.genres || []).map((g: { name: string }) => g.name),
          trailer_key: trailer?.key || found?.trailer_key || 'zSWdZVtXT7E',
          video_url: ITEM_VIDEO_URLS[data.id] || found?.video_url || DEFAULT_FALLBACK_STREAM,
          videoUrl: ITEM_VIDEO_URLS[data.id] || found?.videoUrl || DEFAULT_FALLBACK_STREAM,
          audio_tracks: found?.audio_tracks || getDefaultAudioTracks(data.id, ITEM_VIDEO_URLS[data.id] || DEFAULT_FALLBACK_STREAM),
          audioTracks: found?.audioTracks || getDefaultAudioTracks(data.id, ITEM_VIDEO_URLS[data.id] || DEFAULT_FALLBACK_STREAM),
          subtitles: found?.subtitles || getDefaultSubtitles(data.id, data.title || data.name || 'CineStream'),
          maturity_rating: type === 'tv' ? 'TV-MA' : 'PG-13',
          match_percentage: Math.min(99, Math.round((data.vote_average || 8) * 10) + 12),
          duration: data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : found?.duration,
          seasons: data.number_of_seasons || found?.seasons,
          seasons_data: found?.seasons_data || (type === 'tv' ? getOrGenerateSeasons(data.id, data.name || data.title, data.number_of_seasons || 2) : undefined),
          cast: castList.length > 0 ? castList : found?.cast,
          cast_members: castMembers.length > 0 ? castMembers : found?.cast_members || getOrGenerateCastAndCrew(data.id, data.title || data.name).cast_members,
          crew_members: crewMembers.length > 0 ? crewMembers : found?.crew_members || getOrGenerateCastAndCrew(data.id, data.title || data.name).crew_members,
        };
      }
    } catch {
      // Fallback
    }
  }

  if (found) {
    if (!found.cast_members || !found.crew_members) {
      const generated = getOrGenerateCastAndCrew(found.id, found.title || found.name);
      return {
        ...found,
        cast_members: found.cast_members || generated.cast_members,
        crew_members: found.crew_members || generated.crew_members,
      };
    }
    return found;
  }

  // Fallback default
  const fallbackCredits = getOrGenerateCastAndCrew(numericId || 101, 'Featured Cinema Presentation');
  const fallbackVidUrl = ITEM_VIDEO_URLS[numericId] || DEFAULT_FALLBACK_STREAM;
  return {
    id: numericId || 101,
    title: 'Featured Cinema Presentation',
    overview: 'A gripping cinematic experience exploring themes of identity, humanity, and ambition amidst stunning visual landscapes.',
    poster_path: '/gEU2QniE6EwfVDxCzsxUmcvvpm5.jpg',
    backdrop_path: '/rAiYTsqBkgnvoSO8u51RzqNdJ1U.jpg',
    vote_average: 8.8,
    release_date: '2024-01-01',
    media_type: type,
    genre_ids: [878, 28, 18],
    trailer_key: 'zSWdZVtXT7E',
    video_url: fallbackVidUrl,
    videoUrl: fallbackVidUrl,
    audio_tracks: getDefaultAudioTracks(numericId || 101, fallbackVidUrl),
    audioTracks: getDefaultAudioTracks(numericId || 101, fallbackVidUrl),
    subtitles: getDefaultSubtitles(numericId || 101, 'Featured Cinema Presentation'),
    maturity_rating: 'PG-13',
    match_percentage: 95,
    duration: '2h 15m',
    cast: ['Leading Performer', 'Co-Star', 'Supporting Actor'],
    genres: ['Sci-Fi', 'Action', 'Drama'],
    seasons_data: type === 'tv' ? getOrGenerateSeasons(numericId, 'TV Series', 2) : undefined,
    cast_members: fallbackCredits.cast_members,
    crew_members: fallbackCredits.crew_members,
  };
}

/**
 * Fetch YouTube trailer key for any movie or TV show ID with mock data fallback
 */
export const getMediaTrailerKey = async (id: string | number, type: 'movie' | 'tv' = 'movie'): Promise<string | null> => {
  const targetIdStr = String(id);
  const numericId = Number(id);
  const found = MOCK_MEDIA_ITEMS.find((item) => String(item.id) === targetIdStr || item.id === numericId);

  if (hasApiKey) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=en-US`
      );
      if (response.ok) {
        const data = await response.json();
        const trailer = data.results?.find(
          (vid: { type: string; site: string; key: string }) => vid.type === 'Trailer' && vid.site === 'YouTube'
        );
        if (trailer?.key) return trailer.key;
        if (data.results?.[0]?.key) return data.results[0].key;
      }
    } catch (error) {
      console.error('Error fetching trailer key:', error);
    }
  }

  return found?.trailer_key || 'zSWdZVtXT7E';
};

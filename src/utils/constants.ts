export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_ORIGINAL = 'https://image.tmdb.org/t/p/original';
export const TMDB_IMAGE_BASE_W500 = 'https://image.tmdb.org/t/p/w500';
export const TMDB_IMAGE_BASE_W780 = 'https://image.tmdb.org/t/p/w780';

export const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

export const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'trending', name: 'Trending Now' },
  { id: 'top_rated', name: 'Top Rated' },
  { id: 'action', name: 'Action & Adventure', genreId: 28 },
  { id: 'scifi', name: 'Sci-Fi & Fantasy', genreId: 878 },
  { id: 'thriller', name: 'Thrillers & Crime', genreId: 53 },
  { id: 'drama', name: 'Drama', genreId: 18 },
  { id: 'comedy', name: 'Comedy', genreId: 35 },
];

export const formatYear = (dateStr?: string): string => {
  if (!dateStr) return '2025';
  return dateStr.split('-')[0] || '2025';
};

export const getDisplayTitle = (item: { title?: string; name?: string }): string => {
  return item.title || item.name || 'Untitled';
};

export const getGenreNames = (genreIds?: number[], explicitGenres?: string[]): string[] => {
  if (explicitGenres && explicitGenres.length > 0) return explicitGenres;
  if (!genreIds || genreIds.length === 0) return ['Cinema'];
  return genreIds.map((id) => GENRE_MAP[id]).filter(Boolean).slice(0, 3);
};

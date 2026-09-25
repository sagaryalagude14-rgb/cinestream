import { useEffect, useState, useCallback, useRef } from 'react';
import { MediaItem, MediaResponse } from '../types/media';
import { fetchFromTmdb } from '../services/tmdbApi';

interface UseFetchMediaResult {
  data: MediaItem[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  refetch: () => Promise<void>;
}

export function useFetchMedia(
  endpoint: string,
  params: Record<string, string | number> = {}
): UseFetchMediaResult {
  const [data, setData] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);

  // Stringify params for dependency comparison
  const paramsKey = JSON.stringify(params);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: MediaResponse = await fetchFromTmdb(endpoint, paramsRef.current);
      setData(response.results);
      setTotalResults(response.total_results || response.results.length);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch media data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, paramsKey]);

  useEffect(() => {
    let isMounted = true;

    fetchData().then(() => {
      if (!isMounted) return;
    });

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    totalResults,
    refetch: fetchData,
  };
}

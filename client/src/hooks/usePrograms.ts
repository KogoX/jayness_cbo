import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosClient';
import type { Program } from '../types/program.types';

export const usePrograms = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      // This endpoint must be PUBLIC on the backend
      const { data } = await apiClient.get('/programs');
      setPrograms(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return { programs, loading, error, refetch: fetchPrograms };
};
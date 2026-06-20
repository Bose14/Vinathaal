import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';

export const useCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCredits = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const data = await api.credits.get(user.email);
      setCredits(data.credits);
    } catch (err) {
      console.error('Failed to fetch credits:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { credits, loading, refetch: fetchCredits };
};

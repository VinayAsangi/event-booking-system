import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSeats } from '../services/api';

const POLL_INTERVAL_MS = 5000;

export const useSeats = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchSeats();
      setSeats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [load]);

  return { seats, loading, error, refresh: load };
};

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'seatbook_history';

const loadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveHistory = (history) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
};

export const useBookingHistory = () => {
  const [history, setHistory] = useState(loadHistory);

  const addBooking = useCallback((seats, total) => {
    const entry = {
      id: Date.now(),
      seats,          // [{ id, price }]
      total,
      bookedAt: new Date().toISOString(),
    };
    setHistory(prev => {
      const next = [entry, ...prev].slice(0, 20); // keep last 20
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return { history, addBooking, clearHistory };
};

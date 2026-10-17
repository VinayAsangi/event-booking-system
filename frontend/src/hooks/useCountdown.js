import { useState, useEffect, useRef } from 'react';

export const useCountdown = (expiresAt, onExpire) => {
  const [secondsLeft, setSecondsLeft] = useState(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        onExpireRef.current?.();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const mm = String(Math.floor((secondsLeft ?? 0) / 60)).padStart(2, '0');
  const ss = String((secondsLeft ?? 0) % 60).padStart(2, '0');

  return { secondsLeft, formatted: `${mm}:${ss}` };
};

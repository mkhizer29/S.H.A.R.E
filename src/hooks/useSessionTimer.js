import { useState, useEffect } from 'react';

/**
 * Hook to manage session join availability and countdowns.
 * @param {string} startsAt - ISO timestamp of the session start.
 * @returns {object} { isJoinable, timeLeft, isStarted, diffMs }
 */
export function useSessionTimer(startsAt) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const startTime = new Date(startsAt);
  const diffMs = startTime - now;
  
  // Joinable 15 minutes before
  const isJoinable = diffMs <= 15 * 60 * 1000;
  const isStarted = diffMs <= 0;

  // Format countdown string [MM:SS]
  const formatTimeLeft = () => {
    if (isStarted) return 'Live Now';
    
    const absDiff = Math.abs(diffMs);
    const mins = Math.floor(absDiff / 60000);
    const secs = Math.floor((absDiff % 60000) / 1000);

    if (mins > 60) {
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return `${hours}h ${remainingMins}m`;
    }

    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isJoinable,
    isStarted,
    timeLeft: formatTimeLeft(),
    diffMs
  };
}

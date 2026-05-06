import { useCallback, useEffect, useRef, useState } from 'react';

const IDLE_MS      = 60 * 60 * 1000; // 60 minutes of inactivity → show warning
const WARNING_SECS = 5 * 60;         // 5-minute countdown before auto-logout

export const useInactivityTimer = (onTimeout: () => void) => {
  const [showWarning, setShowWarning]   = useState(false);
  const [secondsLeft, setSecondsLeft]   = useState(WARNING_SECS);

  // Refs avoid stale closures inside event listeners and intervals
  const idleTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningActiveRef = useRef(false);
  const onTimeoutRef    = useRef(onTimeout);

  useEffect(() => { onTimeoutRef.current = onTimeout; }, [onTimeout]);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    warningActiveRef.current = true;
    setShowWarning(true);

    let secs = WARNING_SECS;
    setSecondsLeft(secs);

    countdownRef.current = setInterval(() => {
      secs -= 1;
      setSecondsLeft(secs);
      if (secs <= 0) {
        clearCountdown();
        onTimeoutRef.current();
      }
    }, 1000);
  }, [clearCountdown]);

  // Called when the user clicks "Stay logged in"
  const resetTimer = useCallback(() => {
    warningActiveRef.current = false;
    setShowWarning(false);
    clearCountdown();
    setSecondsLeft(WARNING_SECS);

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(startCountdown, IDLE_MS);
  }, [clearCountdown, startCountdown]);

  useEffect(() => {
    const handleActivity = () => {
      // Ignore activity while the warning is showing — user must explicitly click the button
      if (warningActiveRef.current) return;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(startCountdown, IDLE_MS);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const;
    events.forEach(e => window.addEventListener(e, handleActivity));

    // Start the initial idle timer
    idleTimerRef.current = setTimeout(startCountdown, IDLE_MS);

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      clearCountdown();
    };
  }, [startCountdown, clearCountdown]);

  return { showWarning, secondsLeft, resetTimer };
};

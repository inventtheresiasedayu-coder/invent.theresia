import { useState, useEffect, useCallback, useRef } from 'react';
import { storageService, INACTIVITY_TIMEOUT_MS, INACTIVITY_WARNING_MS } from '../services/storageService';

interface UseAutoLogoutOptions {
  isEnabled: boolean;
  onAutoLogout: () => void;
}

export function useAutoLogout({ isEnabled, onAutoLogout }: UseAutoLogoutOptions) {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const lastThrottleRef = useRef<number>(Date.now());
  const onAutoLogoutRef = useRef(onAutoLogout);

  useEffect(() => {
    onAutoLogoutRef.current = onAutoLogout;
  }, [onAutoLogout]);

  // Reset / extend session
  const stayLoggedIn = useCallback(() => {
    storageService.updateLastActivity();
    setShowWarning(false);
    setRemainingSeconds(60);
    lastThrottleRef.current = Date.now();
  }, []);

  // Activity handler with 1.5s throttle
  const handleUserActivity = useCallback(() => {
    if (!isEnabled) return;
    const now = Date.now();
    if (now - lastThrottleRef.current >= 1500) {
      lastThrottleRef.current = now;
      storageService.updateLastActivity();
      setShowWarning(false);
    }
  }, [isEnabled]);

  // Bind interaction event listeners
  useEffect(() => {
    if (!isEnabled) {
      setShowWarning(false);
      return;
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click', 'wheel'];
    const onActivity = () => handleUserActivity();

    events.forEach((evt) => {
      window.addEventListener(evt, onActivity, { passive: true });
    });

    // Cross-tab storage synchronization
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === 'pgpm_sedayu_last_activity_v1') {
        setShowWarning(false);
      }
      if (e.key === 'pgpm_sedayu_current_user_v1' && !e.newValue) {
        onAutoLogoutRef.current();
      }
    };
    window.addEventListener('storage', onStorageChange);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, onActivity);
      });
      window.removeEventListener('storage', onStorageChange);
    };
  }, [isEnabled, handleUserActivity]);

  // Periodic ticker checking elapsed time every 1 second
  useEffect(() => {
    if (!isEnabled) {
      setShowWarning(false);
      return;
    }

    const interval = setInterval(() => {
      const lastActivity = storageService.getLastActivity();
      const elapsed = Date.now() - lastActivity;

      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        // 10 minutes exceeded
        setShowWarning(false);
        onAutoLogoutRef.current();
      } else if (elapsed >= INACTIVITY_WARNING_MS) {
        // Between 9 and 10 minutes: display warning modal
        const remaining = Math.max(0, Math.ceil((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));
        setRemainingSeconds(remaining);
        setShowWarning(true);
      } else {
        if (showWarning) {
          setShowWarning(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isEnabled, showWarning]);

  return {
    showWarning,
    remainingSeconds,
    stayLoggedIn,
  };
}

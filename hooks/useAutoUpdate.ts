import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

async function fetchBuildVersion(): Promise<string | null> {
  try {
    const response = await fetch(`/build-version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const data = (await response.json()) as { version?: string };
    return data.version ?? null;
  } catch {
    return null;
  }
}

async function clearCachesAndReload() {
  if (typeof caches !== 'undefined') {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
  window.location.reload();
}

/**
 * Polls build-version.json so web users on a stale PWA/browser tab pick up a
 * new Vercel deployment without manually hard-refreshing.
 */
export function useAutoUpdate() {
  const knownVersionRef = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let cancelled = false;
    let checking = false;

    const checkForUpdate = async () => {
      if (checking) return;
      checking = true;
      const latestVersion = await fetchBuildVersion();
      checking = false;
      if (cancelled || !latestVersion) return;

      if (knownVersionRef.current === null) {
        knownVersionRef.current = latestVersion;
        return;
      }

      if (latestVersion !== knownVersionRef.current) {
        clearCachesAndReload();
      }
    };

    checkForUpdate();
    const intervalId = setInterval(checkForUpdate, CHECK_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkForUpdate);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkForUpdate);
    };
  }, []);
}

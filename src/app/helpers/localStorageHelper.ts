export interface LocalCacheOptions {
  timeToLiveMs?: number;
}

interface LocalCachePayload<T> {
  data: T;
  timestamp: number;
  ttlMs?: number;
}

export function setLocalCache<T>(
  key: string,
  data: T,
  options?: LocalCacheOptions
): void {
  const payload: LocalCachePayload<T> = {
    data,
    timestamp: Date.now(),
    ttlMs: options?.timeToLiveMs,
  };

  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (e) {
    console.warn(`Failed to store data for key: ${key}`, e);
  }
}

export function getLocalCache<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed: LocalCachePayload<T> = JSON.parse(raw);
    const isExpired =
      parsed.ttlMs && Date.now() - parsed.timestamp > parsed.ttlMs;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (e) {
    console.warn(`Failed to parse localStorage data for key: ${key}`, e);
    return null;
  }
}

export function clearLocalCache(prefix: string = ''): void {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  });
}

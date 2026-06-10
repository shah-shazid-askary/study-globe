const store = new Map();

const DEFAULT_TTL_MS = 5 * 60 * 1000;

export const buildCacheKey = (method, url, params) =>
  `${method}:${url}:${JSON.stringify(params || {})}`;

export const getCacheEntry = (key) => store.get(key) ?? null;

export const isCacheFresh = (entry) =>
  Boolean(entry && Date.now() - entry.fetchedAt < entry.ttlMs);

export const setCacheEntry = (key, data, ttlMs = DEFAULT_TTL_MS) => {
  store.set(key, { data, fetchedAt: Date.now(), ttlMs });
};

export const invalidateCache = (matcher) => {
  for (const key of store.keys()) {
    if (typeof matcher === 'string' ? key.includes(matcher) : matcher(key)) {
      store.delete(key);
    }
  }
};

// Simple in-memory cache for Google Sheets data
interface CacheEntry {
  data: any
  timestamp: number
  ttl: number // Time to live in milliseconds
}

const cache = new Map<string, CacheEntry>()

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000

export function getCachedData(key: string): any | null {
  const entry = cache.get(key)
  
  if (!entry) {
    return null
  }
  
  const now = Date.now()
  if (now - entry.timestamp > entry.ttl) {
    // Cache expired
    cache.delete(key)
    return null
  }
  
  return entry.data
}

export function setCachedData(key: string, data: any, ttl: number = CACHE_TTL): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  })
}

export function clearCache(): void {
  cache.clear()
}

export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  }
}




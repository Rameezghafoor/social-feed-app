// Simple in-memory cache for Google Sheets data with background revalidation
interface CacheEntry {
  data: any
  timestamp: number
  ttl: number // Time to live in milliseconds
  isRevalidating?: boolean // Track if background revalidation is in progress
  staleData?: any // Store stale data for serving during revalidation
}

const cache = new Map<string, CacheEntry>()

// Cache TTL: 15 minutes
const CACHE_TTL = 15 * 60 * 1000

export function getCachedData(key: string): any | null {
  const entry = cache.get(key)
  
  if (!entry) {
    return null
  }
  
  const now = Date.now()
  const isExpired = now - entry.timestamp > entry.ttl
  
  if (isExpired && !entry.isRevalidating) {
    // Cache expired and not currently revalidating - start background revalidation
    entry.isRevalidating = true
    entry.staleData = entry.data // Store stale data for serving
    return entry.data // Return stale data immediately
  }
  
  if (isExpired && entry.isRevalidating) {
    // Cache expired but revalidation in progress - return stale data
    return entry.staleData || entry.data
  }
  
  // Cache is fresh
  return entry.data
}

export function setCachedData(key: string, data: any, ttl: number = CACHE_TTL): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
    isRevalidating: false
  })
}

// Function to update cache after background revalidation
export function updateCachedData(key: string, data: any, ttl: number = CACHE_TTL): void {
  const entry = cache.get(key)
  if (entry) {
    entry.data = data
    entry.timestamp = Date.now()
    entry.ttl = ttl
    entry.isRevalidating = false
    entry.staleData = undefined
  } else {
    setCachedData(key, data, ttl)
  }
}

// Function to check if cache entry is expired and needs revalidation
export function needsRevalidation(key: string): boolean {
  const entry = cache.get(key)
  if (!entry) return false
  
  const now = Date.now()
  const isExpired = now - entry.timestamp > entry.ttl
  
  return isExpired && !entry.isRevalidating
}

// Function to mark revalidation as complete
export function markRevalidationComplete(key: string): void {
  const entry = cache.get(key)
  if (entry) {
    entry.isRevalidating = false
    entry.staleData = undefined
  }
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






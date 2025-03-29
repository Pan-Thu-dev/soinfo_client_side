/**
 * Application constants
 */

/**
 * Cache-related constants
 */
export const CACHE = {
  // Cache expiration time (30 minutes in milliseconds)
  EXPIRATION: 30 * 60 * 1000,
  // Threshold for stale data that triggers background refresh (10 minutes)
  STALE_THRESHOLD: 10 * 60 * 1000,
  // Maximum number of history items to store
  MAX_HISTORY_ITEMS: 10,
  // LocalStorage keys
  STORAGE_KEYS: {
    history: 'discordSearchHistory',
    cachePrefix: 'discord_profile_'
  }
}; 
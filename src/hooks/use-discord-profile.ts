import { useState } from 'react';
import { toast } from 'react-hot-toast';
import discordApi from '../api/discord-api';
import { CACHE } from '../lib/constants';
import type { DiscordProfile, DiscordActivity, HistoryItem } from '../types/discord-types';

/**
 * Hook return type definition
 */
interface UseDiscordProfileResult {
  profile: DiscordProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (username: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  lastFetchFailed: boolean;
}

/**
 * Generate cache key for a username
 */
const getCacheKey = (username: string): string => {
  return `${CACHE.STORAGE_KEYS.cachePrefix}${username.toLowerCase()}`;
};

/**
 * Clear all Discord profile cache items from localStorage
 */
export const clearProfileCache = (): void => {
  try {
    let clearedCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE.STORAGE_KEYS.cachePrefix)) {
        localStorage.removeItem(key);
        clearedCount++;
      }
    }
    
    if (clearedCount > 0) {
      toast.success(`Cleared ${clearedCount} cached profile${clearedCount !== 1 ? 's' : ''}.`);
    } else {
      toast.success('No profile cache found to clear.');
    }
  } catch (err) {
    console.error('Failed to clear profile cache:', err);
    toast.error('Could not clear profile cache.');
  }
};

/**
 * Custom hook for fetching and caching Discord profile data
 */
export function useDiscordProfile(): UseDiscordProfileResult {
  const [profile, setProfile] = useState<DiscordProfile | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchFailed, setLastFetchFailed] = useState<boolean>(false);

  /**
   * Add profile to search history
   */
  const addToHistory = (username: string, profileData: DiscordProfile): void => {
    try {
      // Get existing history
      const historyString = localStorage.getItem(CACHE.STORAGE_KEYS.history);
      const history: HistoryItem[] = historyString ? JSON.parse(historyString) : [];
      
      // Check if username already exists
      const existingIndex = history.findIndex(item => item.username.toLowerCase() === username.toLowerCase());
      
      // Create new history item
      const historyItem: HistoryItem = {
        username,
        displayName: profileData.displayName || profileData.username,
        avatarUrl: profileData.avatarUrl,
        timestamp: Date.now()
      };
      
      // Update history
      if (existingIndex !== -1) {
        history.splice(existingIndex, 1);
      }
      
      // Add to beginning and limit size
      history.unshift(historyItem);
      const limitedHistory = history.slice(0, CACHE.MAX_HISTORY_ITEMS);
      
      // Save to localStorage
      localStorage.setItem(CACHE.STORAGE_KEYS.history, JSON.stringify(limitedHistory));
    } catch (err) {
      console.error('Failed to save to search history:', err);
    }
  };

  /**
   * Check cache for profile data
   */
  const checkCache = (username: string): DiscordProfile | null => {
    try {
      const cacheKey = getCacheKey(username);
      const cacheString = localStorage.getItem(cacheKey);
      if (!cacheString) return null;
      
      const cachedData = JSON.parse(cacheString) as DiscordProfile;
      const now = Date.now();
      
      // Check if cache is expired
      if (now - cachedData.timestamp > CACHE.EXPIRATION) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return cachedData;
    } catch (err) {
      console.error('Failed to retrieve from cache:', err);
      return null;
    }
  };

  /**
   * Save profile data to cache
   */
  const saveToCache = (username: string, profileData: DiscordProfile): void => {
    try {
      const cacheKey = getCacheKey(username);
      localStorage.setItem(cacheKey, JSON.stringify(profileData));
    } catch (err) {
      console.error('Failed to save to cache:', err);
    }
  };

  /**
   * Handle common error logic
   */
  const handleError = (err: unknown, action: string): void => {
    console.error(`Error ${action}:`, err);
    setLastFetchFailed(true);
    
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    setError(errorMessage);
    
    // Check for rate limiting errors
    if (err instanceof Error && err.message.includes('rate limit')) {
      toast.error('Rate limit exceeded. Please try again later.');
    } else {
      toast.error(errorMessage);
    }
  };

  /**
   * Fetch profile data for a username
   */
  const fetchProfile = async (username: string): Promise<void> => {
    // Validate input
    if (!username.trim()) {
      setError('Please enter a Discord username');
      toast.error('Please enter a Discord username');
      return;
    }
    
    // Set loading state and reset error
    setLoading(true);
    setError(null);
    setLastFetchFailed(false);
    setCurrentUsername(username);
    
    try {
      // Try to get from cache first
      const cachedProfile = checkCache(username);
      
      if (cachedProfile) {
        console.log('Using cached profile for', username);
        setProfile(cachedProfile);
        
        // If cache is more than 10 minutes old, refresh in background
        const cacheAge = Date.now() - cachedProfile.timestamp;
        if (cacheAge > CACHE.STALE_THRESHOLD) {
          console.log('Cache is stale, refreshing in background');
          // Continue showing the cached data while fetching updated data
          setTimeout(() => {
            refreshProfileSilently(username);
          }, 100);
        }
        
        setLoading(false);
        return;
      }
      
      // Fetch from API if not in cache
      console.log('Fetching profile from API for', username);
      const data = await discordApi.fetchProfile(username);
      
      // Add timestamp for cache expiration
      const profileWithTimestamp: DiscordProfile = {
        ...data,
        timestamp: Date.now()
      };
      
      // Update state and storage
      saveToCache(username, profileWithTimestamp);
      addToHistory(username, profileWithTimestamp);
      setProfile(profileWithTimestamp);
    } catch (err) {
      handleError(err, 'fetching profile');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Silently refresh profile data without showing loading state
   * Used for background refreshes
   */
  const refreshProfileSilently = async (username: string): Promise<void> => {
    try {
      const data = await discordApi.fetchProfile(username);
      
      // Add timestamp for cache expiration
      const profileWithTimestamp: DiscordProfile = {
        ...data,
        timestamp: Date.now()
      };
      
      // Update state and storage
      saveToCache(username, profileWithTimestamp);
      
      // Only update state if this is still the current profile
      if (currentUsername.toLowerCase() === username.toLowerCase()) {
        setProfile(profileWithTimestamp);
      }
    } catch (err) {
      console.error('Error in background refresh:', err);
      // Don't update error state for background refreshes
    }
  };

  /**
   * Refresh current profile data
   */
  const refreshProfile = async (): Promise<void> => {
    if (!currentUsername) {
      setError('No profile to refresh');
      toast.error('No profile to refresh');
      return;
    }
    
    setLoading(true);
    setError(null);
    setLastFetchFailed(false);
    
    try {
      // Force fetch from API
      console.log('Refreshing profile from API for', currentUsername);
      const data = await discordApi.fetchProfile(currentUsername);
      
      // Add timestamp for cache expiration
      const profileWithTimestamp: DiscordProfile = {
        ...data,
        timestamp: Date.now()
      };
      
      // Update state and storage
      saveToCache(currentUsername, profileWithTimestamp);
      addToHistory(currentUsername, profileWithTimestamp);
      setProfile(profileWithTimestamp);
      toast.success('Profile refreshed successfully');
    } catch (err) {
      handleError(err, 'refreshing profile');
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, fetchProfile, refreshProfile, lastFetchFailed };
} 
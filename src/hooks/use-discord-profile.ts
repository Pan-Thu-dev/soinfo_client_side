import { useState } from 'react';
import discordApi from '../api/discord';

// Import the type from our API module
import type { DiscordActivity } from '../api/discord';

/**
 * Profile data type definition
 */
export interface DiscordProfile {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  status: string;
  activity: DiscordActivity | null;
  timestamp: number; // Added for caching purposes
}

/**
 * Hook return type definition
 */
interface UseDiscordProfileResult {
  profile: DiscordProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (username: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * History item definition
 */
interface HistoryItem {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  timestamp: number;
}

// Cache expiration time (5 minutes in milliseconds)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Maximum number of history items to store
const MAX_HISTORY_ITEMS = 10;

// LocalStorage keys
const STORAGE_KEYS = {
  history: 'discordSearchHistory',
  cachePrefix: 'discord_profile_'
};

/**
 * Custom hook for fetching and caching Discord profile data
 */
export function useDiscordProfile(): UseDiscordProfileResult {
  const [profile, setProfile] = useState<DiscordProfile | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Add profile to search history
   */
  const addToHistory = (username: string, profileData: DiscordProfile): void => {
    try {
      // Get existing history
      const historyString = localStorage.getItem(STORAGE_KEYS.history);
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
      const limitedHistory = history.slice(0, MAX_HISTORY_ITEMS);
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(limitedHistory));
    } catch (err) {
      console.error('Failed to save to search history:', err);
    }
  };

  /**
   * Check cache for profile data
   */
  const checkCache = (username: string): DiscordProfile | null => {
    try {
      const cacheKey = `${STORAGE_KEYS.cachePrefix}${username.toLowerCase()}`;
      const cacheString = localStorage.getItem(cacheKey);
      if (!cacheString) return null;
      
      const cachedData = JSON.parse(cacheString) as DiscordProfile;
      const now = Date.now();
      
      // Check if cache is expired
      if (now - cachedData.timestamp > CACHE_EXPIRATION) {
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
      const cacheKey = `${STORAGE_KEYS.cachePrefix}${username.toLowerCase()}`;
      localStorage.setItem(cacheKey, JSON.stringify(profileData));
    } catch (err) {
      console.error('Failed to save to cache:', err);
    }
  };

  /**
   * Fetch profile data for a username
   */
  const fetchProfile = async (username: string): Promise<void> => {
    // Validate input
    if (!username.trim()) {
      setError('Please enter a Discord username');
      return;
    }
    
    // Set loading state
    setLoading(true);
    setError(null);
    setCurrentUsername(username);
    
    try {
      // Try to get from cache first
      const cachedProfile = checkCache(username);
      
      if (cachedProfile) {
        console.log('Using cached profile for', username);
        setProfile(cachedProfile);
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
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh current profile data
   */
  const refreshProfile = async (): Promise<void> => {
    if (!currentUsername) {
      setError('No profile to refresh');
      return;
    }
    
    setLoading(true);
    setError(null);
    
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
    } catch (err) {
      console.error('Error refreshing profile:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, fetchProfile, refreshProfile };
} 
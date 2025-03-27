import { useState, useEffect } from 'react';
import discordApi, { DiscordProfileResponse } from '../api/discord';

interface UseDiscordProfileResult {
  profile: DiscordProfileResponse | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (profileUrl: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

interface CachedProfile extends DiscordProfileResponse {
  timestamp: number;
}

// Cache expiration time (1 hour in milliseconds)
const CACHE_EXPIRATION = 60 * 60 * 1000;

/**
 * Custom hook for fetching and caching Discord profile data
 */
export function useDiscordProfile(): UseDiscordProfileResult {
  const [profile, setProfile] = useState<DiscordProfileResponse | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to add profile to search history
  const addToHistory = (url: string, profileData: DiscordProfileResponse) => {
    try {
      // Get existing history from localStorage
      const historyString = localStorage.getItem('discordSearchHistory');
      const history = historyString ? JSON.parse(historyString) : [];
      
      // Check if this URL already exists in history
      const existingIndex = history.findIndex((item: { url: string }) => item.url === url);
      
      // Create new history item
      const historyItem = {
        url,
        username: profileData.username,
        avatarUrl: profileData.avatarUrl,
        timestamp: Date.now()
      };
      
      // If URL exists, replace it; otherwise add new item
      if (existingIndex !== -1) {
        history.splice(existingIndex, 1);
      }
      
      // Add new item to the beginning of the array
      history.unshift(historyItem);
      
      // Limit history to 10 items
      const limitedHistory = history.slice(0, 10);
      
      // Store updated history
      localStorage.setItem('discordSearchHistory', JSON.stringify(limitedHistory));
    } catch (err) {
      console.error('Failed to save to search history:', err);
    }
  };

  // Function to check cache for the profile
  const checkCache = (url: string): CachedProfile | null => {
    try {
      const cacheString = localStorage.getItem(`discord_profile_${url}`);
      if (!cacheString) return null;
      
      const cachedData = JSON.parse(cacheString) as CachedProfile;
      const now = Date.now();
      
      // Check if cache is expired
      if (now - cachedData.timestamp > CACHE_EXPIRATION) {
        // Remove expired cache
        localStorage.removeItem(`discord_profile_${url}`);
        return null;
      }
      
      return cachedData;
    } catch (err) {
      console.error('Failed to retrieve from cache:', err);
      return null;
    }
  };

  // Function to save profile to cache
  const saveToCache = (url: string, profileData: DiscordProfileResponse) => {
    try {
      const cacheData: CachedProfile = {
        ...profileData,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`discord_profile_${url}`, JSON.stringify(cacheData));
    } catch (err) {
      console.error('Failed to save to cache:', err);
    }
  };

  // Function to fetch profile from API
  const fetchProfile = async (profileUrl: string) => {
    if (!profileUrl.trim()) {
      setError('Please enter a Discord profile URL');
      return;
    }
    
    setLoading(true);
    setError(null);
    setCurrentUrl(profileUrl);
    
    try {
      // Check if profile is in cache
      const cachedProfile = checkCache(profileUrl);
      
      if (cachedProfile) {
        setProfile(cachedProfile);
        setLoading(false);
        return;
      }
      
      // Fetch from API if not in cache
      const data = await discordApi.fetchProfile(profileUrl);
      
      // Save to cache and history
      saveToCache(profileUrl, data);
      addToHistory(profileUrl, data);
      
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh current profile
  const refreshProfile = async () => {
    if (!currentUrl) {
      setError('No profile to refresh');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Force fetch from API
      const data = await discordApi.fetchProfile(currentUrl);
      
      // Update cache and history
      saveToCache(currentUrl, data);
      addToHistory(currentUrl, data);
      
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, fetchProfile, refreshProfile };
} 
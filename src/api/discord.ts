import axios, { AxiosError } from 'axios';

// Define types for API requests and responses
export interface DiscordProfileRequest {
  username: string;
}

export interface DiscordActivity {
  type: string;
  name: string;
}

export interface DiscordProfileResponse {
  username: string;
  avatarUrl: string | null;
  aboutMe: string | null;
  status: string;
  activity: DiscordActivity | null;
  timestamp: number;
}

// API base URL - use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * API client for Discord profile data
 */
const discordApi = {
  /**
   * Fetch Discord profile data from the backend
   * @param username The Discord username to fetch data for
   * @returns Promise with the profile data
   * @throws Error if the request fails
   */
  fetchProfile: async (username: string): Promise<DiscordProfileResponse> => {
    try {
      const response = await axios.post<DiscordProfileResponse>(
        `${API_BASE_URL}/profile`,
        { username }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>;
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        } else if (axiosError.response?.status === 404) {
          throw new Error(`User "${username}" not found`);
        } else if (axiosError.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`Request failed: ${axiosError.message}`);
      }
      throw new Error('Network error occurred');
    }
  },
};

export default discordApi; 
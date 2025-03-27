import axios from 'axios';

// Define types for API requests and responses
export interface DiscordProfileRequest {
  profileUrl: string;
}

export interface DiscordProfileResponse {
  username: string;
  avatarUrl: string | null;
  aboutMe: string | null;
  status: string;
  activity: {
    type: string;
    name: string;
  } | null;
  timestamp: number;
}

// API base URL - replace with actual API URL in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// API client for Discord profile data
const discordApi = {
  /**
   * Fetch Discord profile data from the backend
   * @param profileUrl The Discord profile URL to fetch data for
   * @returns Promise with the profile data
   */
  fetchProfile: async (profileUrl: string): Promise<DiscordProfileResponse> => {
    try {
      const response = await axios.post<DiscordProfileResponse>(
        `${API_BASE_URL}/profile`,
        { profileUrl }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch profile data');
      }
      throw new Error('Network error occurred');
    }
  },
};

export default discordApi; 
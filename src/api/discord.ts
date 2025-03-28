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
  status: string;
  data: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    status: string;
    activity: DiscordActivity | null;
  };
}

export interface DiscordUserData {
  id: string;
  username: string;
  displayName: string;
  nickname: string | null;
  guildName: string;
  avatarUrl: string | null;
}

export interface DiscordUserListResponse {
  status: string;
  data: {
    count: number;
    users: DiscordUserData[];
  };
}

export interface DiscordGuildData {
  id: string;
  name: string;
  memberCount: number;
  permissions?: string[];
  error?: string;
}

export interface DiscordGuildListResponse {
  status: string;
  data: {
    guildsCount: number;
    guilds: DiscordGuildData[];
  };
}

// API base URL - use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * API client for Discord data
 */
const discordApi = {
  /**
   * Fetch Discord profile data from the backend
   * @param username The Discord username to fetch data for
   * @returns Promise with the profile data
   * @throws Error if the request fails
   */
  fetchProfile: async (username: string): Promise<DiscordProfileResponse['data']> => {
    try {
      console.log(`Fetching Discord profile for ${username} from ${API_BASE_URL}/profile/discord`);
      
      const response = await axios.get<DiscordProfileResponse>(
        `${API_BASE_URL}/profile/discord`,
        { 
          params: { username },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );
      
      console.log('API response:', response.data);
      
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.status);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string, status: string }>;
        console.error('Axios error:', axiosError.response?.data);
        
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        } else if (axiosError.response?.status === 404) {
          throw new Error(`User "${username}" not found`);
        } else if (axiosError.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`Request failed: ${axiosError.message}`);
      }
      console.error('Unknown error:', error);
      throw new Error('Network error occurred');
    }
  },
  
  /**
   * List available users the Discord bot can see
   * @returns Promise with the list of users
   */
  listUsers: async () => {
    try {
      console.log(`Fetching Discord users from ${API_BASE_URL}/user/list`);
      const response = await axios.get<DiscordUserListResponse>(`${API_BASE_URL}/user/list`);
      
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.status);
      }
    } catch (error) {
      console.error('Error listing users:', error);
      throw new Error('Failed to list users');
    }
  },
  
  /**
   * List guilds the Discord bot has access to
   * @returns Promise with the list of guilds
   */
  listGuilds: async () => {
    try {
      console.log(`Fetching Discord guilds from ${API_BASE_URL}/guild/list`);
      const response = await axios.get<DiscordGuildListResponse>(`${API_BASE_URL}/guild/list`);
      
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.status);
      }
    } catch (error) {
      console.error('Error listing guilds:', error);
      throw new Error('Failed to list guilds');
    }
  },
  
  /**
   * Check API status
   * @returns Promise with API status information
   */
  checkStatus: async () => {
    try {
      const profileStatus = await axios.get(`${API_BASE_URL}/profile/test`);
      const guildStatus = await axios.get(`${API_BASE_URL}/guild/test`);
      const userStatus = await axios.get(`${API_BASE_URL}/user/test`);
      
      return {
        profile: profileStatus.data,
        guild: guildStatus.data,
        user: userStatus.data
      };
    } catch (error) {
      console.error('Error checking API status:', error);
      throw new Error('Failed to check API status');
    }
  }
};

export default discordApi; 
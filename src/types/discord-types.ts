/**
 * Discord profile data type definitions
 */

export interface DiscordActivity {
  type: string;
  name: string;
}

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
 * History item definition
 */
export interface HistoryItem {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  timestamp: number;
} 

/**
 * API request and response types
 */
export interface DiscordProfileRequest {
  username: string;
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
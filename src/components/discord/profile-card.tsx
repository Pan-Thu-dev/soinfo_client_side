import { useRef, useState, useEffect } from 'react';
import { RefreshCcw, User, Calendar, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

// Import our updated profile type
import { DiscordProfile } from '../../hooks/use-discord-profile';

// Map status to color
const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  idle: 'bg-yellow-500',
  dnd: 'bg-red-500',
  offline: 'bg-gray-500',
  unknown: 'bg-gray-500'
};

// Map activity types to readable labels
const activityTypeLabels: Record<string, string> = {
  '0': 'Playing',
  '1': 'Streaming',
  '2': 'Listening to',
  '3': 'Watching',
  '4': 'Custom',
  '5': 'Competing in'
};

interface ProfileCardProps {
  profile: DiscordProfile;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
}

/**
 * Component to display Discord profile information
 */
export function ProfileCard({ profile, onRefresh, isRefreshing }: ProfileCardProps) {
  const [age, setAge] = useState<string>('');
  const timerId = useRef<number | null>(null);
  
  // Calculate how long ago the profile was fetched
  const updateAge = () => {
    if (!profile.timestamp) return;
    
    const msAgo = Date.now() - profile.timestamp;
    const secondsAgo = Math.floor(msAgo / 1000);
    
    if (secondsAgo < 60) {
      setAge(`${secondsAgo} second${secondsAgo === 1 ? '' : 's'} ago`);
    } else if (secondsAgo < 3600) {
      const minutesAgo = Math.floor(secondsAgo / 60);
      setAge(`${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`);
    } else {
      const hoursAgo = Math.floor(secondsAgo / 3600);
      setAge(`${hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`);
    }
  };
  
  // Update the age display every second
  useEffect(() => {
    updateAge();
    
    timerId.current = window.setInterval(updateAge, 1000);
    
    return () => {
      if (timerId.current) window.clearInterval(timerId.current);
    };
  }, [profile.timestamp]);
  
  // Format activity display
  const formatActivity = () => {
    if (!profile.activity) return null;
    
    const { type, name } = profile.activity;
    const label = activityTypeLabels[type] || 'Activity';
    
    return `${label}: ${name}`;
  };
  
  // Status indicator color class
  const statusColor = statusColors[profile.status] || statusColors.unknown;
  
  return (
    <Card className="w-full max-w-3xl mx-auto shadow-md border border-slate-200 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Image */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="relative mb-2">
              <div className={`w-32 h-32 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center border-2 border-slate-300`}>
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={`${profile.displayName}'s avatar`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-slate-400" />
                )}
              </div>
              <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full ${statusColor} border-2 border-white`} title={`Status: ${profile.status}`} />
            </div>
            <h3 className="text-xl font-bold text-center mt-2">{profile.displayName}</h3>
            {profile.displayName !== profile.username && (
              <p className="text-sm text-gray-500 text-center">{profile.username}</p>
            )}
          </div>
          
          {/* Profile Info */}
          <div className="flex-grow">
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full ${statusColor} mr-2`}></div>
                <span className="text-gray-800 capitalize">
                  {profile.status === 'dnd' ? 'Do Not Disturb' : profile.status}
                </span>
              </div>
              
              {/* Activity */}
              {profile.activity && (
                <div className="text-gray-800 font-medium">
                  {formatActivity()}
                </div>
              )}
              
              {/* Last Updated */}
              <div className="flex items-center text-sm text-gray-500 mt-4">
                <Clock className="h-4 w-4 mr-1" />
                <span>Updated: {age}</span>
                <Button 
                  onClick={onRefresh} 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 text-blue-600 hover:text-blue-800" 
                  disabled={isRefreshing}
                >
                  <RefreshCcw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
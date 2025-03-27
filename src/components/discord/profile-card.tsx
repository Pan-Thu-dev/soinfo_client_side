import { RefreshCcwIcon } from 'lucide-react';
import { DiscordProfileResponse } from '../../api/discord';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface ProfileCardProps {
  profile: DiscordProfileResponse;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
}

/**
 * Component to display Discord profile information
 */
export function ProfileCard({ profile, onRefresh, isRefreshing }: ProfileCardProps) {
  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get appropriate color for status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'dnd':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Discord Profile</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCcwIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={`${profile.username}'s avatar`}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl">{profile.username.charAt(0).toUpperCase()}</span>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              {profile.username}
              <div 
                className={`w-3 h-3 rounded-full ml-2 ${getStatusColor(profile.status)}`} 
                title={profile.status}
              />
            </h3>
            
            <Badge variant="outline" className="mt-1">
              {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
            </Badge>
          </div>
        </div>
        
        <Separator />
        
        {profile.aboutMe && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">About Me</h4>
            <p className="text-sm whitespace-pre-wrap">{profile.aboutMe}</p>
          </div>
        )}
        
        {profile.activity && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Current Activity</h4>
            <p className="text-sm">
              <span className="font-medium">{profile.activity.type}:</span> {profile.activity.name}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-gray-500">
        Last updated: {formatDate(profile.timestamp)}
      </CardFooter>
    </Card>
  );
} 
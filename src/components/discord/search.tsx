import { useState, FormEvent } from 'react';
import { SearchIcon, LoaderIcon } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface DiscordSearchProps {
  onSearch: (url: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Discord profile search component
 */
export function DiscordSearch({ onSearch, loading, error }: DiscordSearchProps) {
  const [profileUrl, setProfileUrl] = useState<string>('');

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (profileUrl.trim()) {
      await onSearch(profileUrl.trim());
    }
  };

  // Check if a string is a valid Discord profile URL
  const isValidDiscordUrl = (url: string): boolean => {
    // Basic validation - can be enhanced for more precise matching
    const discordUrlPattern = /^https:\/\/(discord\.com|discord\.gg)/i;
    return discordUrlPattern.test(url);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-md">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="profileUrl" className="text-sm font-medium text-gray-700">
              Discord Profile URL
            </label>
            <div className="flex gap-2">
              <Input
                id="profileUrl"
                type="text"
                placeholder="https://discord.com/users/123456789012345678"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                className={`flex-1 ${error ? 'border-red-500' : ''}`}
                disabled={loading}
              />
              <Button 
                type="submit" 
                disabled={loading || !profileUrl.trim() || !isValidDiscordUrl(profileUrl)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <SearchIcon className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Fetching...' : 'Fetch Profile'}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            Enter a Discord profile URL to fetch publicly available information.
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 
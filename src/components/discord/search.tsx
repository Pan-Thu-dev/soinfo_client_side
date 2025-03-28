import { useState, FormEvent, ChangeEvent } from 'react';
import { SearchIcon, LoaderIcon, MessageSquare, AlertCircleIcon } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface DiscordSearchProps {
  onSearch: (username: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Discord username validation pattern
 * - Can be 2-32 characters long
 * - Can include letters, numbers, underscores, and periods
 */
const USERNAME_PATTERN = /^[a-zA-Z0-9_\.]{2,32}$/;

/**
 * Discord profile search component
 */
export function DiscordSearch({ onSearch, loading, error }: DiscordSearchProps) {
  const [username, setUsername] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * Validate a Discord username
   */
  const isValidUsername = (value: string): boolean => {
    return USERNAME_PATTERN.test(value);
  };

  /**
   * Handle input change with validation feedback
   */
  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setUsername(value);
    
    // Clear validation error when user starts typing again
    if (validationError) {
      setValidationError(null);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      setValidationError('Please enter a Discord username');
      return;
    }
    
    if (!isValidUsername(trimmedUsername)) {
      setValidationError('Username should be 2-32 characters and may include letters, numbers, underscores, and periods');
      return;
    }
    
    setValidationError(null);
    await onSearch(trimmedUsername);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-md border border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-[hsl(var(--discord-blurple))] mr-2" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-gray-800">Discord Profile Lookup</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Enter Discord Username
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={handleUsernameChange}
                className={`flex-1 ${validationError || error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-[hsl(var(--discord-blurple))] focus:border-[hsl(var(--discord-blurple))]'}`}
                disabled={loading}
                aria-invalid={Boolean(validationError || error)}
                aria-describedby={validationError || error ? "username-error" : undefined}
                autoComplete="off"
              />
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-[hsl(var(--discord-blurple))] hover:bg-[hsl(var(--discord-blurple-dark))] text-white transition-colors"
                aria-label={loading ? "Fetching profile..." : "Fetch Discord profile"}
              >
                {loading ? (
                  <LoaderIcon className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                ) : (
                  <SearchIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                )}
                {loading ? 'Fetching...' : 'Fetch Profile'}
              </Button>
            </div>
          </div>
          
          {(validationError || error) && (
            <div id="username-error" className="text-red-500 text-sm mt-2 flex items-start" role="alert">
              <AlertCircleIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>{validationError || error}</span>
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-2">
            <p>Enter a Discord username to fetch publicly available information.</p>
            <p className="mt-1">Username should be 2-32 characters and may include letters, numbers, underscores, and periods.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 
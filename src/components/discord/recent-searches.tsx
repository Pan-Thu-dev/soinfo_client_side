import { useState, useEffect, useMemo } from 'react';
import { ClockIcon, TrashIcon, UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

/**
 * Search history item structure
 */
interface HistoryItem {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  timestamp: number;
  formattedDate?: string; // Add formatted date to store pre-calculated value
}

interface RecentSearchesProps {
  onSelectSearch: (username: string) => void;
}

// LocalStorage key for search history
const HISTORY_STORAGE_KEY = 'discordSearchHistory';

/**
 * Format date for display
 */
const formatDate = (timestamp: number): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Unknown date';
  }
};

/**
 * Component to display recent Discord profile searches
 */
export function RecentSearches({ onSelectSearch }: RecentSearchesProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load search history from localStorage on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  /**
   * Load history from local storage
   */
  const loadHistory = (): void => {
    try {
      const historyString = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (historyString) {
        const parsedHistory = JSON.parse(historyString);
        // Pre-calculate formatted dates during load
        const historyWithDates = Array.isArray(parsedHistory) 
          ? parsedHistory.map(item => ({
              ...item,
              formattedDate: formatDate(item.timestamp)
            }))
          : [];
        setHistory(historyWithDates);
      }
    } catch (err) {
      console.error('Failed to load search history:', err);
      // Reset history on error
      setHistory([]);
    }
  };

  /**
   * Clear all search history
   */
  const clearHistory = (): void => {
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear search history:', err);
    }
  };

  /**
   * Handle click on a history item
   */
  const handleHistoryItemClick = (username: string) => () => {
    onSelectSearch(username);
  };

  // If no history items, don't render the component
  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-md mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium flex items-center">
          <ClockIcon className="h-4 w-4 mr-2" aria-hidden="true" />
          Recent Searches
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="hover:bg-red-100 hover:text-red-600 transition-colors"
          aria-label="Clear search history"
        >
          <TrashIcon className="h-4 w-4 mr-1" aria-hidden="true" />
          <span>Clear History</span>
        </Button>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ul className="space-y-2" role="list">
          {history.map((item, index) => (
            <li 
              key={`${item.username}-${item.timestamp}`}
              className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={handleHistoryItemClick(item.username)}
              role="button"
              tabIndex={0}
              aria-label={`Search for ${item.displayName}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectSearch(item.username);
                }
              }}
            >
              {item.avatarUrl ? (
                <img 
                  src={item.avatarUrl}
                  alt=""
                  className="w-8 h-8 rounded-full mr-3"
                  aria-hidden="true"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3" aria-hidden="true">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.displayName}</p>
                <p className="text-xs text-gray-500 truncate">@{item.username}</p>
              </div>
              
              <time 
                dateTime={new Date(item.timestamp).toISOString()}
                className="text-xs text-gray-400 whitespace-nowrap ml-2"
              >
                {item.formattedDate || formatDate(item.timestamp)}
              </time>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
} 
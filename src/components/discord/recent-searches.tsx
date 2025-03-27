import { useState, useEffect } from 'react';
import { ClockIcon, TrashIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface HistoryItem {
  url: string;
  username: string;
  avatarUrl: string | null;
  timestamp: number;
}

interface RecentSearchesProps {
  onSelectSearch: (url: string) => void;
}

/**
 * Component to display recent Discord profile searches
 */
export function RecentSearches({ onSelectSearch }: RecentSearchesProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load search history from localStorage on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Function to load search history from localStorage
  const loadHistory = () => {
    try {
      const historyString = localStorage.getItem('discordSearchHistory');
      if (historyString) {
        setHistory(JSON.parse(historyString));
      }
    } catch (err) {
      console.error('Failed to load search history:', err);
    }
  };

  // Function to clear search history
  const clearHistory = () => {
    try {
      localStorage.removeItem('discordSearchHistory');
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear search history:', err);
    }
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // If no history items, don't render the component
  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-md mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium flex items-center">
          <ClockIcon className="h-4 w-4 mr-2" />
          Recent Searches
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="hover:bg-red-100 hover:text-red-600"
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          Clear History
        </Button>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {history.map((item, index) => (
            <li 
              key={index}
              className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => onSelectSearch(item.url)}
            >
              {item.avatarUrl ? (
                <img 
                  src={item.avatarUrl}
                  alt={item.username}
                  className="w-8 h-8 rounded-full mr-3"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  <span>{item.username.charAt(0).toUpperCase()}</span>
                </div>
              )}
              
              <div className="flex-1">
                <p className="text-sm font-medium">{item.username}</p>
                <p className="text-xs text-gray-500 truncate max-w-xs">{item.url}</p>
              </div>
              
              <span className="text-xs text-gray-400">{formatDate(item.timestamp)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
} 
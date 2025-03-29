import { useState } from 'react'
import { useDiscordProfile, clearProfileCache } from '../hooks/use-discord-profile'
import { DiscordSearch } from '../components/discord/search'
import { ProfileCard } from '../components/discord/profile-card'
import { RecentSearches } from '../components/discord/recent-searches'
import { Button } from '../components/ui/button'
import ErrorBoundary from '../components/common/error-boundary'
import { CACHE } from '../lib/constants'

/**
 * Home page component for Discord Profile Fetcher
 */
function HomePage() {
  const { profile, loading, error, fetchProfile, refreshProfile, lastFetchFailed } = useDiscordProfile()
  const [refreshing, setRefreshing] = useState<boolean>(false)

  /**
   * Handle profile refresh with loading state
   */
  const handleRefresh = async (): Promise<void> => {
    try {
      setRefreshing(true)
      await refreshProfile()
    } catch (err) {
      console.error('Error refreshing profile:', err)
    } finally {
      setRefreshing(false)
    }
  }

  /**
   * Handle retry when fetch fails
   */
  const handleRetry = async (): Promise<void> => {
    if (profile) {
      await handleRefresh()
    } else {
      // We need to re-fetch with the last username
      const historyItem = localStorage.getItem(CACHE.STORAGE_KEYS.history)
      if (historyItem) {
        try {
          const history = JSON.parse(historyItem)
          if (history.length > 0) {
            await fetchProfile(history[0].username)
          }
        } catch (e) {
          console.error('Error parsing history for retry:', e)
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[hsl(var(--discord-blurple))] mb-3">Discord Profile Fetcher</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Enter a Discord username to retrieve publicly available information
          </p>
        </header>

        <main className="space-y-8">
          <section className="search-section" aria-labelledby="search-heading">
            <h2 id="search-heading" className="sr-only">Search for a Discord profile</h2>
            <DiscordSearch 
              onSearch={fetchProfile} 
              loading={loading} 
              error={error} 
            />
          </section>

          {lastFetchFailed && !loading && !profile && (
            <div className="text-center">
              <Button 
                variant="secondary" 
                onClick={handleRetry}
                className="mt-4"
              >
                Retry Fetch
              </Button>
            </div>
          )}

          {profile && (
            <section 
              className="profile-section animate-fadeIn" 
              aria-labelledby="profile-heading"
            >
              <h2 id="profile-heading" className="sr-only">Discord Profile Information</h2>
              <ErrorBoundary>
                <ProfileCard 
                  profile={profile}
                  onRefresh={handleRefresh}
                  isRefreshing={refreshing}
                />
              </ErrorBoundary>
            </section>
          )}

          <section className="recent-searches-section" aria-labelledby="history-heading">
            <h2 id="history-heading" className="sr-only">Recent Searches</h2>
            <RecentSearches onSelectSearch={fetchProfile} />
          </section>
        </main>

        <footer className="mt-12 text-center text-gray-500 text-sm space-y-2">
          <p>Discord Profile Fetcher &copy; {new Date().getFullYear()}</p>
          <Button variant="outline" size="sm" onClick={clearProfileCache}>
            Clear Profile Cache
          </Button>
        </footer>
      </div>
    </div>
  )
}

export default HomePage 
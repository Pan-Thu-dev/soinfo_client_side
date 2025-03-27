import { useState } from 'react'
import { useDiscordProfile } from './hooks/use-discord-profile'
import { DiscordSearch } from './components/discord/search'
import { ProfileCard } from './components/discord/profile-card'
import { RecentSearches } from './components/discord/recent-searches'

function App() {
  const { profile, loading, error, fetchProfile, refreshProfile } = useDiscordProfile()
  const [refreshing, setRefreshing] = useState(false)

  // Handle profile refresh with loading state
  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshProfile()
    setRefreshing(false)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Discord Profile Fetcher</h1>
        <p className="text-gray-600">Enter a Discord profile URL to fetch public information</p>
      </header>

      <main className="space-y-6">
        <DiscordSearch 
          onSearch={fetchProfile} 
          loading={loading} 
          error={error} 
        />

        {profile && (
          <ProfileCard 
            profile={profile}
            onRefresh={handleRefresh}
            isRefreshing={refreshing}
          />
        )}

        <RecentSearches onSelectSearch={fetchProfile} />
      </main>
    </div>
  )
}

export default App

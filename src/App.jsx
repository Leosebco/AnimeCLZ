import AppRouter from '@/router/AppRouter'
import { AuthProvider } from '@/context/AuthContext'
import { ProfileProvider } from '@/context/ProfileContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { WatchLaterProvider } from '@/context/WatchLaterContext'
import ErrorBoundary from '@/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProfileProvider>
          <FavoritesProvider>
            <WatchLaterProvider>
              <AppRouter />
            </WatchLaterProvider>
          </FavoritesProvider>
        </ProfileProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

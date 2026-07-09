import AppRouter from '@/router/AppRouter'
import { FavoritesProvider } from '@/context/FavoritesContext'
import ErrorBoundary from '@/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <FavoritesProvider>
        <AppRouter />
      </FavoritesProvider>
    </ErrorBoundary>
  )
}

export default App

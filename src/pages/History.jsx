import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { History as HistoryIcon } from 'lucide-react'
import Container from '@/components/ui/Container'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { listHistory } from '@/services/historyService'
import { animeDetailPath } from '@/constants'

/**
 * "Continuar viendo". Sin un reproductor real todavía nada escribe en
 * watch_history (ver historyService), así que esta página estará vacía en
 * la práctica hasta la fase "Streaming" del ROADMAP — se deja construida
 * para no bloquear ese trabajo futuro con una página faltante. Desde v1.5
 * el historial es por PERFIL (antes por cuenta) — ver migración 0021.
 */
function History() {
  const { user } = useAuth()
  const { activeProfile } = useProfile()
  const profileId = activeProfile?.id
  const [entries, setEntries] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!user || !profileId) return
    let active = true
    listHistory(profileId)
      .then((data) => {
        if (!active) return
        setEntries(data)
        setStatus('success')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [user, profileId])

  const handleRetry = () => {
    setStatus('loading')
    listHistory(profileId)
      .then((data) => {
        setEntries(data)
        setStatus('success')
      })
      .catch(() => setStatus('error'))
  }

  return (
    <Container className="pt-28 pb-16">
      <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">Historial</h1>
      <p className="mt-1 text-sm text-text-secondary">Continúa viendo donde lo dejaste.</p>

      <div className="mt-8">
        {status === 'loading' && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        )}

        {status === 'error' && <ErrorState onRetry={handleRetry} />}

        {status === 'success' && entries.length === 0 && (
          <EmptyState
            icon={HistoryIcon}
            title="Todavía no hay nada que continuar"
            description="Cuando empieces a ver un episodio, aparecerá aquí para que sigas donde lo dejaste."
          />
        )}

        {status === 'success' && entries.length > 0 && (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <Link
                key={`${entry.id}-${entry.episodeNumber}`}
                to={animeDetailPath(entry.id)}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-colors duration-200 hover:bg-hover"
              >
                {entry.poster && (
                  <img
                    src={entry.poster}
                    alt={entry.title}
                    className="h-16 w-12 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-semibold text-text">
                    {entry.title}
                  </p>
                  <p className="text-xs text-text-secondary">Episodio {entry.episodeNumber}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export default History

import { Users2 } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DataTable from '@/components/admin/DataTable'

const COLUMNS = [
  { key: 'name', label: 'Nombre' },
  { key: 'anime', label: 'Anime' },
  { key: 'role', label: 'Rol' },
  { key: 'voiceActor', label: 'Actor de voz' },
]

/**
 * Mismo caso que Episodes.jsx: Jikan solo da personajes por anime
 * (`/anime/{id}/characters`), no un listado global — se deja la tabla
 * armada, sin datos fabricados.
 */
function Characters() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Personajes"
        description="Listado global de personajes — pendiente de una fuente de datos propia."
      />

      <DataTable
        columns={COLUMNS}
        rows={[]}
        empty={{
          icon: Users2,
          title: 'Todavía no hay una fuente global de personajes',
          description:
            'Jikan solo da personajes por anime (ver la ficha de cada anime). Un listado como este necesita una tabla propia en Supabase que los importe — no implementada todavía.',
        }}
      />
    </div>
  )
}

export default Characters

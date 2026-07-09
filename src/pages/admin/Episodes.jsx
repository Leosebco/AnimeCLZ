import { ListVideo } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DataTable from '@/components/admin/DataTable'

const COLUMNS = [
  { key: 'anime', label: 'Anime' },
  { key: 'number', label: 'Episodio' },
  { key: 'title', label: 'Título' },
  { key: 'aired', label: 'Emitido' },
]

/**
 * Jikan expone episodios solo por anime (`/anime/{id}/episodes`, ver
 * AnimeDetail.jsx), no como listado global — no hay "todos los episodios
 * de AnimeCLZ" sin una tabla local propia que los importe. Se deja la
 * tabla armada (columnas ya definidas) para cuando exista esa fuente;
 * mientras tanto no se fabrica contenido de relleno.
 */
function Episodes() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Episodios"
        description="Listado global de episodios — pendiente de una fuente de datos propia."
      />

      <DataTable
        columns={COLUMNS}
        rows={[]}
        empty={{
          icon: ListVideo,
          title: 'Todavía no hay una fuente global de episodios',
          description:
            'Jikan solo da episodios por anime (ver la ficha de cada anime). Un listado como este necesita una tabla propia en Supabase que los importe — no implementada todavía.',
        }}
      />
    </div>
  )
}

export default Episodes

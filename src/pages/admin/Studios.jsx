import { Building2 } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DataTable from '@/components/admin/DataTable'

const COLUMNS = [
  { key: 'name', label: 'Nombre' },
  { key: 'animeCount', label: 'Animes' },
  { key: 'founded', label: 'Fundado' },
]

/**
 * A diferencia de Episodes.jsx/Characters.jsx, Jikan sí tiene un endpoint
 * global de estudios (`/producers`) — a diferencia de personajes/episodios,
 * que solo existen por anime. No se integró en esta pasada (arquitectura,
 * no CRUD) para no sumar un endpoint nuevo sin probarlo a fondo; queda como
 * el candidato más directo a conectar en la próxima.
 */
function Studios() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Estudios"
        description="Estudios de animación — pendiente de conectar con Jikan."
      />

      <DataTable
        columns={COLUMNS}
        rows={[]}
        empty={{
          icon: Building2,
          title: 'Todavía no conectado',
          description:
            'Jikan expone un listado global de estudios (/producers) que no se integró en esta pasada — es el candidato más directo para la próxima.',
        }}
      />
    </div>
  )
}

export default Studios

import { Newspaper } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DataTable from '@/components/admin/DataTable'

const COLUMNS = [
  { key: 'title', label: 'Título' },
  { key: 'author', label: 'Autor' },
  { key: 'published_at', label: 'Publicado' },
]

/**
 * AnimeCLZ no tiene fuente de noticias real todavía (ni Jikan la da — ver
 * la exclusión de "Noticias" en Home, documentada en ROADMAP.md). Esta
 * sección solo tendría sentido con contenido propio (una tabla `news` en
 * Supabase + su CRUD), que no se creó en esta pasada.
 */
function News() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Noticias" description="Contenido editorial propio de AnimeCLZ." />

      <DataTable
        columns={COLUMNS}
        rows={[]}
        empty={{
          icon: Newspaper,
          title: 'Todavía no hay noticias',
          description:
            'Esta sección necesita una tabla propia (news) y su CRUD, que no se implementó en esta pasada — no hay una fuente externa de noticias de anime.',
        }}
      />
    </div>
  )
}

export default News

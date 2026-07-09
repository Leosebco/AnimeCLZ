import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

const arrowClass = cn(
  'flex h-10 w-10 items-center justify-center rounded-full border border-border text-text transition-colors hover:border-primary/60 hover:bg-hover disabled:opacity-40 disabled:pointer-events-none',
)

function Pagination({ page, hasNextPage, onChange }) {
  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <button
        type="button"
        aria-label="Página anterior"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={arrowClass}
      >
        <ChevronLeft size={18} />
      </button>
      <span className="font-display text-sm text-text-secondary">Página {page}</span>
      <button
        type="button"
        aria-label="Página siguiente"
        disabled={!hasNextPage}
        onClick={() => onChange(page + 1)}
        className={arrowClass}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

export default Pagination

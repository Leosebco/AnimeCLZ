import { useState } from 'react'
import Modal from '@/components/ui/Modal'

/**
 * Galería responsive con lightbox (v2.3) — reusa `Modal.jsx` (único
 * componente de modal del proyecto, ver CLAUDE.md) en vez de crear un
 * lightbox ad hoc. Lazy loading real (`loading="lazy"`) en cada miniatura;
 * el modal solo carga la imagen grande cuando el usuario hace clic, nunca
 * antes.
 */
function GalleryGrid({ pictures }) {
  const [selected, setSelected] = useState(null)

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {pictures.map((picture, index) => (
          <button
            key={picture.large || index}
            type="button"
            onClick={() => setSelected(picture)}
            aria-label={`Ampliar imagen ${index + 1}`}
            className="block overflow-hidden rounded-xl ring-1 ring-border transition-transform hover:scale-[1.02]"
          >
            <img
              src={picture.small}
              alt=""
              loading="lazy"
              className="aspect-video w-full object-cover"
            />
          </button>
        ))}
      </div>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} className="sm:max-w-3xl">
        {selected && (
          <img src={selected.large} alt="" className="w-full rounded-xl object-contain" />
        )}
      </Modal>
    </>
  )
}

export default GalleryGrid

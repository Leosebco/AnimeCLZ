import { cn } from '@/utils/cn'
import { AVATAR_TYPES } from '@/constants'

/**
 * Representación visual compartida de un perfil (selector, Navbar, Mi
 * Perfil, formularios de crear/editar). `tipoAvatar` decide si se muestra
 * una imagen (subida propia o personaje de Jikan) o un círculo de color
 * con la inicial del nombre — el mismo patrón que ya usaba AccountMenu
 * para el avatar de cuenta, ahora reutilizado a nivel de perfil.
 */
function ProfileAvatar({ avatar, tipoAvatar, color = '#4F8CFF', nombre, size = 40, className }) {
  const initial = (nombre || '?').trim().charAt(0).toUpperCase()
  const hasImage = (tipoAvatar === AVATAR_TYPES.UPLOAD || tipoAvatar === AVATAR_TYPES.CHARACTER) && avatar

  if (hasImage) {
    return (
      <img
        src={avatar}
        alt={nombre}
        style={{ width: size, height: size }}
        className={cn('shrink-0 rounded-full object-cover', className)}
      />
    )
  }

  return (
    <span
      style={{ width: size, height: size, backgroundColor: color, fontSize: Math.round(size * 0.42) }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white',
        className,
      )}
      aria-hidden
    >
      {initial}
    </span>
  )
}

export default ProfileAvatar

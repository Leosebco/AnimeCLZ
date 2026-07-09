import { Navigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants'

/**
 * v1.3: el contenido institucional que vivía aquí se convirtió en la
 * Landing (`/`, ver Landing.jsx) — este archivo se conserva (no se borra
 * ningún archivo sin preguntar) como un redirect para no romper enlaces
 * viejos a /acerca. Preserva el hash (#tecnologias, #contacto...) para
 * que esas anclas sigan funcionando en la nueva ubicación.
 */
function About() {
  const location = useLocation()
  return <Navigate to={`${ROUTES.LANDING}${location.hash}`} replace />
}

export default About

import { createStubProvider } from '../../stubProvider'

// Sin implementar A PROPÓSITO, permanentemente (v2.1). AnimePahe es un
// sitio de streaming sin licencia (no un proveedor legal) — mismo criterio
// que `ConsumetProvider.js`, ver ese archivo y CLAUDE.md ("Sistema de
// reproducción") para el detalle completo. Arquitectura preparada, no
// implementada.
const METHODS = ['getEpisodes', 'getSources']

const AnimePaheProvider = createStubProvider('AnimePaheProvider', METHODS)

export const { getEpisodes, getSources } = AnimePaheProvider

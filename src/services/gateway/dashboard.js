import { getAllProvidersHealth } from './healthMonitor'
import { getCacheMetricsSnapshot } from './cacheMetrics'

/**
 * Provider Dashboard (v3.2), FASE 5 — **solo infraestructura, sin
 * pantalla**. Prepara un objeto serializable (JSON-safe: sin funciones,
 * sin `undefined`, sin referencias circulares) para que un futuro Panel
 * de Administración pueda mostrar proveedor activo/porcentaje de éxito/
 * latencia/errores sin tener que diseñar de nuevo la forma de los datos —
 * ningún componente ni ruta nueva se creó este sprint (pedido explícito:
 * "No crear aún la pantalla").
 *
 * `activeProviders`: los proveedores con al menos una llamada registrada
 * en esta sesión de desarrollo — "proveedor activo" tal como lo pide la
 * FASE 5, derivado de `healthMonitor` en vez de inventar un concepto
 * nuevo de "activo".
 */
export function getGatewayDashboardSnapshot() {
  const providers = getAllProvidersHealth()
  return {
    generatedAt: Date.now(),
    activeProviders: providers.filter((provider) => provider.callCount > 0).map((provider) => provider.providerId),
    providers,
    cache: getCacheMetricsSnapshot(),
  }
}

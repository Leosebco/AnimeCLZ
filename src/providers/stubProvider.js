/**
 * Genera un objeto {métodoA: fn, métodoB: fn, ...} donde cada función es
 * un stub que lanza un error claro al invocarse — usado por proveedores
 * todavía no implementados (AniList, TMDB) para declarar su contrato sin
 * fingir que funcionan. Evita repetir la misma función "no implementado"
 * a mano por cada uno de los ~20 métodos de AnimeProvider.
 */
export function createStubProvider(providerName, methodNames) {
  return Object.fromEntries(
    methodNames.map((methodName) => [
      methodName,
      async function stub() {
        throw new Error(
          `${providerName}.${methodName} no está implementado todavía (arquitectura de proveedores preparada, ver CLAUDE.md).`,
        )
      },
    ]),
  )
}

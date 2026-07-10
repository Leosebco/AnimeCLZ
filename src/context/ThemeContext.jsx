import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { THEMES } from '@/constants'
import { devError } from '@/utils/logger'

const DEFAULT_THEME = 'original'
const VALID_THEME_IDS = new Set(THEMES.map((theme) => theme.id))

function guestThemeKey() {
  return 'animeclz:theme:guest'
}

// El contexto vive aquí (no colocado con un hook useTheme() como
// FavoritesContext) por el mismo motivo que AuthContext/ProfileContext.
// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext(null)

/**
 * Sistema de temas (v1.0). La preferencia real vive en
 * `profiles_account.tema` (por perfil, ver migración 0014) — este
 * contexto solo aplica el `data-theme` en <html> y persiste el cambio.
 * Sin sesión/perfil activo (Landing, Login...) usa un tema recordado en
 * localStorage para no dejar el sitio siempre en "original" para un
 * visitante que ya eligió otra paleta antes de loguearse.
 */
export function ThemeProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const { activeProfile, updateProfile: updateProfileInContext } = useProfile()

  const [guestTheme, setGuestThemeState] = useState(
    () => localStorage.getItem(guestThemeKey()) || DEFAULT_THEME,
  )

  const activeThemeId =
    isAuthenticated && activeProfile
      ? activeProfile.tema || DEFAULT_THEME
      : guestTheme

  useEffect(() => {
    const themeId = VALID_THEME_IDS.has(activeThemeId) ? activeThemeId : DEFAULT_THEME
    if (themeId === DEFAULT_THEME) {
      delete document.documentElement.dataset.theme
    } else {
      document.documentElement.dataset.theme = themeId
    }
  }, [activeThemeId])

  const setTheme = useCallback(
    async (themeId) => {
      if (!VALID_THEME_IDS.has(themeId)) return

      if (!isAuthenticated || !activeProfile) {
        setGuestThemeState(themeId)
        localStorage.setItem(guestThemeKey(), themeId)
        return
      }

      try {
        await updateProfileInContext(activeProfile.id, { tema: themeId })
      } catch (err) {
        devError('[ThemeContext] no se pudo guardar el tema:', err)
        throw err
      }
    },
    [isAuthenticated, activeProfile, updateProfileInContext],
  )

  const value = useMemo(
    () => ({ themeId: activeThemeId, themes: THEMES, setTheme }),
    [activeThemeId, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

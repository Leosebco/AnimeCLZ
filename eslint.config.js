import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

// Flat config for ESLint 9 — the project had no config at all before this,
// so `npm run lint` silently failed. Mirrors the standard Vite + React
// setup (react / react-hooks / react-refresh) so JSX component usage is
// tracked correctly (no false "unused import" on a component only used
// as a JSX tag) and hook rules actually run.
export default [
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['vite.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.es2021 },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // `useFetch`'s cache short-circuit calls setState synchronously inside
      // its effect on a cache hit — a deliberate pattern that would need a
      // proper "derive state during render" rewrite to satisfy this newer
      // rule without risking the shared data hook every page depends on.
      // Downgraded to warn until that rewrite happens (see ROADMAP.md).
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // Config files run under Node, not the browser.
    files: ['vite.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: js.configs.recommended.rules,
  },
]

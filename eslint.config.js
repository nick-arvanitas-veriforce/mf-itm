import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// Single lint config for every workspace (apps/* and remotes/*). Previously this
// lived under apps/host and so covered only the host.
export default defineConfig([
  globalIgnores(['**/dist', '**/.wrangler', '**/worker-configuration.d.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  // The shared component library. react-refresh/only-export-components targets
  // app code, where mixing components and helpers in one file breaks HMR. A
  // component library legitimately ships hooks, formatters, and grouping objects
  // beside its components (useSidebar, formatDate, the TableCells catalog), and
  // it is never itself the HMR boundary — the consuming app is.
  {
    files: ['packages/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // The host's Worker runs on workerd, not in the browser.
  {
    files: ['apps/host/worker/**/*.ts'],
    languageOptions: {
      globals: {},
    },
  },
])

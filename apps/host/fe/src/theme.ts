import { createTheme } from '@mui/material/styles'
import { mui7ThemeOptions } from '@alcumus/design-tokens/theme/mui-7'

// The single MUI theme for the whole federation. Only the host creates and
// provides it (see bootstrap.tsx); remotes inherit it through the shared
// @mui/material + @emotion/react singletons declared in every vite.config.ts.
//
// The options come from @alcumus/design-tokens — the Veriforce design system.
// Its palette/typography values are `var(--ds-*)` references, so the token CSS
// (imported in index.css) must be loaded for them to resolve.
//
// A remote rendered standalone (its own dev server) has no host ThemeProvider
// above it, so each remote's bootstrap builds this same theme itself — see
// remotes/*/src/theme.ts. Never add custom keys here that a remote relies on.
export const theme = createTheme(mui7ThemeOptions)

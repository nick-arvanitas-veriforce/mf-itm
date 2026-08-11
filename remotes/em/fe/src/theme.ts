import { createTheme } from '@mui/material/styles'
import { mui7ThemeOptions } from '@alcumus/design-tokens/theme/mui-7'

// STANDALONE ONLY. When the host loads this remote over federation, the host's
// ThemeProvider supplies the theme through the shared @mui/material +
// @emotion/react singletons and this file is never touched.
//
// It builds from the same @alcumus/design-tokens options as the host, so
// standalone dev looks like production instead of falling back to MUI defaults.
// Nothing custom belongs here — Widget.tsx must not depend on a key the host
// doesn't also have.
export const theme = createTheme(mui7ThemeOptions)

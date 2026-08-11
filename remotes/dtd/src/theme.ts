import { createTheme } from '@mui/material/styles'
import { mui7ThemeOptions } from '@alcumus/design-tokens/theme/mui-7'

// STANDALONE ONLY. Under the host, the host's ThemeProvider supplies the theme
// through the shared @mui/material + @emotion/react singletons and this file is
// never touched. Built from the same @alcumus/design-tokens options as the host
// so standalone dev matches production.
export const theme = createTheme(mui7ThemeOptions)

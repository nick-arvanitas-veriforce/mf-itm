// Design tokens must load on the federated path too — see tokens.css.
import './tokens.css'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

// This is the component EXPOSED to the host over Module Federation
// (see vite.config.ts -> exposes['./Widget']).
//
// It uses NO ThemeProvider of its own — the host provides the Veriforce theme,
// and this picks it up through the shared @mui/material + @emotion/react
// singletons. It renders into the host AppLayout's content area, so it brings no
// sidebar and no app bar of its own — the shell owns those.
//
// A placeholder page until Digital Training Delivery is built out. It follows
// the header rules: the title is the page h1, the description lives in the
// header block, and the body sits in a Card — never loose Typography on the
// canvas, which has nothing to align to and reads as unfinished.
export default function Widget() {
  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, py: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h1" component="h1">
              Digital Training
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Assign and track training courses across your workforce.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} fontSize={12} />}>
            Create Course
          </Button>
        </Stack>
      </Box>

      {/* A page of discrete cards sits on GRAY so the white panels separate from
          what's behind them (foundations/colors.md). Container'd because this is
          reading-width content, not a dense table. */}
      <Box sx={{ bgcolor: 'var(--ds-surface-default)', minHeight: '100%', py: 2 }}>
        <Container maxWidth="md">
          <Card variant="outlined">
            <CardContent>
              <Stack sx={{ gap: 0.5 }}>
                <Typography variant="subtitle1">Course catalog</Typography>
                <Typography variant="body2" color="text.secondary">
                  Rendered by the <strong>dtd</strong> micro-frontend, loaded into the host shell
                  at runtime over Module Federation.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  )
}

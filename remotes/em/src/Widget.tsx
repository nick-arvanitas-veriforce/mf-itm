// Design tokens must load on the federated path too — see tokens.css.
import './tokens.css'
import WorkersPage from './WorkersPage'

// This is the component EXPOSED to the host over Module Federation
// (see vite.config.ts -> exposes['./Widget']).
//
// It uses NO ThemeProvider of its own — the host provides the Veriforce theme,
// and this picks it up through the shared @mui/material + @emotion/react
// singletons. It renders into the host AppLayout's content area, so it brings
// no app frame of its own: no sidebar and no app bar, which the shell owns.
export default function Widget() {
  return <WorkersPage />
}

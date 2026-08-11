import {
  Component,
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { loadRemoteComponent } from './moduleFederationRuntime'

// Remotes render full pages into the shell's content area, so the federation
// contract carries no props — each remote owns its own page state.
type WidgetProps = Record<string, never>

// Memoize the lazy component per remoteId so each `remote/Widget` is created
// (and loaded over Module Federation) exactly once.
const lazyByRemoteId = new Map<string, LazyExoticComponent<ComponentType<WidgetProps>>>()

const getRemoteWidget = (remoteId: string) => {
  let component = lazyByRemoteId.get(remoteId)
  if (!component) {
    component = lazy(() => loadRemoteComponent<WidgetProps>(remoteId))
    lazyByRemoteId.set(remoteId, component)
  }
  return component
}

class RemoteErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <Alert severity="error" variant="outlined">
          <AlertTitle>Failed to load remote MFE</AlertTitle>
          <Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>
            {this.state.error.message}
          </Box>
        </Alert>
      )
    }
    return this.props.children
  }
}

const RemoteFallback = () => (
  <Box sx={{ p: 1 }}>
    <Skeleton variant="text" width="40%" height={32} />
    <Skeleton variant="text" width="80%" />
    <Skeleton variant="rounded" width={140} height={36} sx={{ mt: 1 }} />
  </Box>
)

export function RemoteWidget({ remoteId }: { remoteId: string }) {
  // Not actually created during render: getRemoteWidget memoizes on remoteId via
  // the module-level map above, so identity is stable across renders. That
  // stability is required — a fresh lazy() each render would re-fetch the remote
  // container and remount the widget.
  const Widget = getRemoteWidget(remoteId)
  return (
    <RemoteErrorBoundary>
      <Suspense fallback={<RemoteFallback />}>
        {/* eslint-disable-next-line react-hooks/static-components -- see above */}
        <Widget />
      </Suspense>
    </RemoteErrorBoundary>
  )
}

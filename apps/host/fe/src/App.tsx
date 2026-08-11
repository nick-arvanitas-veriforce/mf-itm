import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {
  faUsers,
  faGraduationCap,
  faClipboardCheck,
  faChartLine,
  faGear,
} from '@fortawesome/free-solid-svg-icons'

import { AppLayout, AppBar, Sidebar, SidebarSection, SidebarItem } from '@mf-itm/ui'
import { RemoteWidget } from './moduleFederation/RemoteWidget'

// The HOST is the app shell: it owns the frame (sidebar + app bar) and the
// navigation, and remotes render into its content area.
//
// Navigation lives here, not in a remote MFE — nav has to know every route in
// the app, which makes it the most coupled part of the shell, the opposite of
// what makes a good independently-deployable remote.
//
// Level 1 of the Navigation Hierarchy: each SidebarItem is a top-level
// destination with its own route. Sections WITHIN a destination are the
// PageHeader's tabs, owned by the remote that renders that page — the two levels
// never share state.

const destinations = [
  { id: 'em', label: 'Employee Management', icon: faUsers, remoteId: 'em/Widget' },
  { id: 'dtd', label: 'Digital Training', icon: faGraduationCap, remoteId: 'dtd/Widget' },
] as const

function App() {
  // Stands in for the router: real routing derives selection from the URL so the
  // sidebar highlights from the route's first segment and the two can't disagree.
  const [destinationId, setDestinationId] = useState<string>('em')
  const active = destinations.find((destination) => destination.id === destinationId)

  return (
    <AppLayout
      sidebar={
        // The brand wordmark lives in the Sidebar, not the AppBar. `appName` is
        // the plain-text form for an internal tool with no brand artwork; drop it
        // to get the default Veriforce logo.
        <Sidebar appName="Veriforce ITM">
          <SidebarSection>
            {destinations.map((destination) => (
              <SidebarItem
                key={destination.id}
                label={destination.label}
                icon={destination.icon}
                selected={destinationId === destination.id}
                onClick={() => setDestinationId(destination.id)}
              />
            ))}
            <SidebarItem label="Compliance" icon={faClipboardCheck} badge={6} />
            <SidebarItem label="Reports" icon={faChartLine}>
              {/* Nested rows are text-only by design. */}
              <SidebarItem label="Monthly" />
              <SidebarItem label="Quarterly" />
            </SidebarItem>
          </SidebarSection>

          <SidebarSection divider={false}>
            <SidebarItem label="Settings" icon={faGear} />
          </SidebarSection>
        </Sidebar>
      }
      appBar={
        <AppBar
          productName="Insurance & Training Management"
          languages={['en', 'fr', 'es']}
          onSettings={() => {}}
          onHelp={() => {}}
          onNotifications={() => {}}
          organization={{
            name: 'Priya Raghunathan',
            organization: 'Northwind Industrial',
            organizations: ['Northwind Industrial', 'Cascade Energy', 'Meridian Utilities'],
            onEditProfile: () => {},
            onSignOut: () => {},
          }}
        />
      }
    >
      {active ? (
        <RemoteWidget key={active.id} remoteId={active.remoteId} />
      ) : (
        <Box sx={{ p: 3 }}>
          <Typography color="text.secondary">Select a destination.</Typography>
        </Box>
      )}
    </AppLayout>
  )
}

export default App

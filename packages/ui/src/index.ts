// Shared UI for every ITM front-end — the host shell and each remote MFE.
//
// The THEME is not here: @alcumus/design-tokens ships it, and each app builds it
// from that package's mui-7 options. These components only consume it, reading
// the theme through the shared @mui/material singleton the host federates.
//
// Pulls in the design system's MUI module augmentation so the props it adds
// (IconButton size="xs", Table gutter, Avatar size, Drawer size, …) type-check
// for every consumer without each app re-importing it.
import '@alcumus/design-tokens/theme/mui-augmentation'

// The Veriforce component set, re-exported wholesale from its own barrel:
// AppLayout, Sidebar, PageHeader, TableToolbar, TablePage, FilterChip,
// OrganizationPicker, the TableCells catalog, EmptyState, Drawer bits, Keycap,
// VeriforceLogo, and useUnsavedChanges.
export * from './components'

// The app bar is the one frame piece the set above doesn't ship. It's local, and
// composes OrganizationPicker from that set.
export { AppBar, type AppBarProps } from './AppBar'

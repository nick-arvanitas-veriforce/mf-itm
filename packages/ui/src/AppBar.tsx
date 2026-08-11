import MuiAppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass,
  faGear,
  faCircleQuestion,
  faBell,
} from '@fortawesome/free-solid-svg-icons'

import Keycap from './components/Keycap/Keycap'
import { OrganizationPicker, type OrganizationPickerProps } from './components/OrganizationPicker/OrganizationPicker'

export interface AppBarProps {
  /**
   * The product's name, in the brand slot at the left edge as plain text — no
   * logo (that's the Sidebar's) and no divider. Omit to leave the slot blank.
   */
  productName?: string
  /** The account affordance. Rendered last, at the right edge. */
  organization: OrganizationPickerProps
  searchPlaceholder?: string
  search?: string
  onSearchChange?: (value: string) => void
  /** Language codes for the language Select. Omit to hide it. */
  languages?: string[]
  language?: string
  onLanguageChange?: (language: string) => void
  onSettings?: () => void
  onHelp?: () => void
  onNotifications?: () => void
}

/**
 * The top bar of the app frame: names the current product and holds global
 * actions. Pair it with `AppLayout`'s `appBar` slot, which places it across the
 * content column only — never above the Sidebar.
 *
 * The Sidebar owns navigation; this owns global context and actions. Page-level
 * actions belong to `PageHeader` and table actions to `TableToolbar` — a
 * page-specific button here is in the wrong place. Keep it identical on every
 * page; only the content below changes.
 *
 * Composition, left to right: product name, then a right-aligned group of global
 * search (220px, magnifier adornment, ⌘/Ctrl-K hint), the language `Select`, up
 * to 3–4 global `IconButton`s, and `OrganizationPicker` last. More icon actions
 * than that belong in a Menu.
 *
 * Two theme gotchas this encodes: `color="primary"` renders a *light* surface in
 * this theme (MUI's default white text goes invisible), so the default light
 * surface is kept; and the bar stays flat inside the frame — a bottom border,
 * never a shadow. `position` is `static` only; the other values are disabled by
 * the design system.
 */
export function AppBar({
  productName,
  organization,
  searchPlaceholder = 'Search',
  search,
  onSearchChange,
  languages,
  language,
  onLanguageChange,
  onSettings,
  onHelp,
  onNotifications,
}: AppBarProps) {
  return (
    <MuiAppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: '1px solid var(--ds-border-subtle)' }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {productName && (
          <Typography variant="subtitle2" noWrap>
            {productName}
          </Typography>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            aria-label="Global search"
            value={search}
            onChange={onSearchChange ? (e) => onSearchChange(e.target.value) : undefined}
            sx={{ width: 220, display: { xs: 'none', sm: 'block' } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      style={{ color: 'var(--ds-text-secondary)', fontSize: 14 }}
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                      <Keycap>⌘</Keycap>
                      <Keycap>K</Keycap>
                    </Stack>
                  </InputAdornment>
                ),
              },
            }}
          />

          {languages && languages.length > 0 && (
            <Select
              size="small"
              value={language ?? languages[0]}
              aria-label="Language"
              onChange={(event) => onLanguageChange?.(String(event.target.value))}
              sx={{ display: { xs: 'none', lg: 'block' } }}
            >
              {languages.map((code) => (
                <MenuItem key={code} value={code}>
                  {code.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          )}

          {/* Icon-only actions each carry a Tooltip and an aria-label naming the action. */}
          {onSettings && (
            <Tooltip title="Settings">
              <IconButton aria-label="Settings" onClick={onSettings}>
                <FontAwesomeIcon icon={faGear} fontSize={16} />
              </IconButton>
            </Tooltip>
          )}
          {onHelp && (
            <Tooltip title="Help">
              <IconButton aria-label="Help" onClick={onHelp}>
                <FontAwesomeIcon icon={faCircleQuestion} fontSize={16} />
              </IconButton>
            </Tooltip>
          )}
          {onNotifications && (
            <Tooltip title="Notifications">
              <IconButton aria-label="Notifications" onClick={onNotifications}>
                <FontAwesomeIcon icon={faBell} fontSize={16} />
              </IconButton>
            </Tooltip>
          )}

          {/* Account/profile is only ever this — never a separate profile
              IconButton or a bare Avatar. Always last. */}
          <OrganizationPicker {...organization} />
        </Stack>
      </Toolbar>
    </MuiAppBar>
  )
}

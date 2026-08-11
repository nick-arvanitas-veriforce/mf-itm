import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileImport,
  faFileExport,
  faTableColumns,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

import {
  PageHeader,
  TableToolbar,
  ActionsCell,
  AvatarCell,
  CheckboxCell,
  ChipCell,
  DateCell,
  ProgressCell,
  TextCell,
} from '@cf-mfe/ui'

import {
  workers,
  statusLabels,
  statusColors,
  complianceLabels,
  complianceColors,
  type Worker,
} from './workers'

// The Employee Management workers list — the Table Page layout from
// guidelines/layouts/table-page.md, minus the sidebar and top bar (the HOST
// shell owns those; this remote renders into its content area).
//
// Regions, in order: page header, table toolbar, table, and the pagination
// footer.

type SortKey = 'name' | 'status' | 'compliance' | 'role' | 'site' | 'training' | 'lastActive'

// Columns run identity -> status -> attributes -> timestamps -> actions. The
// overflow column is always last and its header stays blank.
const columns: { key: SortKey | 'actions'; label: string; sortable?: boolean }[] = [
  { key: 'name', label: 'Worker', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'compliance', label: 'Compliance', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'site', label: 'Site', sortable: true },
  { key: 'training', label: 'Training', sortable: true },
  { key: 'lastActive', label: 'Last active', sortable: true },
  { key: 'actions', label: '' },
]

// Sections of this destination, per the Navigation Hierarchy. Real routing makes
// each its own URL; the index here stands in for that.
const tabs = ['Roster', 'Invitations', 'Training', 'Documents']

// The views Select — labelled plainly by the set they show, "All" first.
const views = ['All', 'Active', 'Inactive'] as const

export function WorkersPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [view, setView] = useState<(typeof views)[number]>('All')
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState<string | null>('Houston, TX')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // The row overflow menu is owned by the page — ActionsCell is just the trigger.
  const [rowMenu, setRowMenu] = useState<{ anchorEl: HTMLElement; worker: Worker } | null>(null)

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()

    const filtered = workers.filter((worker) => {
      if (view === 'Active' && worker.status !== 'active') return false
      if (view === 'Inactive' && worker.status !== 'inactive') return false
      if (siteFilter && worker.site !== siteFilter) return false
      if (!query) return true
      return (
        worker.name.toLowerCase().includes(query) ||
        worker.email.toLowerCase().includes(query) ||
        worker.role.toLowerCase().includes(query) ||
        worker.employeeId.toLowerCase().includes(query)
      )
    })

    // Single-column sort only — sorting a new column clears the previous one.
    const direction = sortDirection === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const left = a[sortKey]
      const right = b[sortKey]
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction
      return String(left).localeCompare(String(right)) * direction
    })
  }, [view, search, siteFilter, sortKey, sortDirection])

  const paged = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // Selection is per page: the header checkbox covers the visible rows only.
  const pageIds = paged.map((row) => row.id)
  const selectedOnPage = pageIds.filter((id) => selected.has(id))
  const allOnPageSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length

  const toggleRow = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const togglePage = () =>
    setSelected((current) => {
      const next = new Set(current)
      if (allOnPageSelected) pageIds.forEach((id) => next.delete(id))
      else pageIds.forEach((id) => next.add(id))
      return next
    })

  const sortBy = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
    setPage(0)
  }

  return (
    // A list/index screen sits on WHITE so the full-bleed table reads as one
    // continuous surface (foundations/colors.md).
    <Box sx={{ bgcolor: 'var(--ds-surface-elevated)', minHeight: '100%' }}>
      {/* Full-width — PageHeader owns its own padding. */}
      <PageHeader
        title="Workers"
        primaryActionLabel="Add Worker"
        onPrimaryAction={() => {}}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(_, index) => setActiveTab(index)}
      />

      {/* The toolbar ships with no outer padding — the parent aligns it to the
          table gutter. */}
      <Box sx={{ px: 3, py: 2 }}>
        <TableToolbar
          searchPlaceholder="Search workers"
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(0)
          }}
          views={
            <Select
              size="small"
              value={view}
              aria-label="View"
              onChange={(event) => {
                setView(event.target.value as (typeof views)[number])
                setPage(0)
              }}
              sx={{ minWidth: 120 }}
            >
              {views.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          }
          secondaryActions={
            <>
              <Tooltip title="Import">
                <IconButton variant="outlined" size="small" aria-label="Import">
                  <FontAwesomeIcon icon={faFileImport} fontSize={14} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export">
                <IconButton variant="outlined" size="small" aria-label="Export">
                  <FontAwesomeIcon icon={faFileExport} fontSize={14} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit columns">
                <IconButton variant="outlined" size="small" aria-label="Edit columns">
                  <FontAwesomeIcon icon={faTableColumns} fontSize={14} />
                </IconButton>
              </Tooltip>
            </>
          }
          filters={
            siteFilter && (
              // Stands in until the real FilterChip lands: Label: Value, 28px,
              // X-to-clear. Clearing re-runs the query immediately — no Apply step.
              <Chip
                size="small"
                variant="outlined"
                label={`Site: ${siteFilter}`}
                onDelete={() => {
                  setSiteFilter(null)
                  setPage(0)
                }}
                deleteIcon={<FontAwesomeIcon icon={faXmark} fontSize={12} />}
                sx={{ height: 28 }}
              />
            )
          }
        />

        {/* Bulk actions appear once rows are selected, scoped to the selection —
            "Export" here exports the selection, the toolbar's exports everything. */}
        {selected.size > 0 && (
          <Stack direction="row" sx={{ alignItems: 'center', gap: 2, pt: 2 }}>
            <Typography variant="body2">{selected.size} selected</Typography>
            <Button size="small" variant="outlined" color="secondary">
              Export
            </Button>
            <Button size="small" variant="outlined" color="secondary">
              Assign Training
            </Button>
            <Button
              size="small"
              variant="text"
              color="secondary"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
          </Stack>
        )}
      </Box>

      {/* The table spans the full content width — no padded wrapper. Horizontal
          breathing room comes from the table's own `gutter`. */}
      <TableContainer>
        <Table gutter="lg">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <CheckboxCell
                  checked={allOnPageSelected}
                  indeterminate={selectedOnPage.length > 0 && !allOnPageSelected}
                  onChange={togglePage}
                  aria-label="Select all workers on this page"
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.key === 'actions' ? 'right' : 'left'}
                  sortDirection={sortKey === column.key ? sortDirection : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortKey === column.key}
                      direction={sortKey === column.key ? sortDirection : 'asc'}
                      onClick={() => sortBy(column.key as SortKey)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paged.map((worker) => (
              // Clicking the row triggers its primary action — View.
              <TableRow key={worker.id} hover selected={selected.has(worker.id)} sx={{ cursor: 'pointer' }}>
                <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
                  <CheckboxCell
                    checked={selected.has(worker.id)}
                    onChange={() => toggleRow(worker.id)}
                    aria-label={`Select ${worker.name}`}
                  />
                </TableCell>

                {/* Identity */}
                <TableCell>
                  <AvatarCell name={worker.name} secondary={worker.email} />
                </TableCell>

                {/* Status — one semantic color per column. */}
                <TableCell>
                  <ChipCell label={statusLabels[worker.status]} color={statusColors[worker.status]} />
                </TableCell>
                <TableCell>
                  <ChipCell
                    label={complianceLabels[worker.compliance]}
                    color={complianceColors[worker.compliance]}
                  />
                </TableCell>

                {/* Attributes */}
                <TableCell>
                  <TextCell primary={worker.role} secondary={worker.employeeId} />
                </TableCell>
                <TableCell>
                  <TextCell primary={worker.site} truncate />
                </TableCell>
                <TableCell>
                  <ProgressCell value={worker.training} />
                </TableCell>

                {/* Timestamps */}
                <TableCell>
                  <DateCell value={worker.lastActive} />
                </TableCell>

                {/* Actions — always last, right-aligned, blank header. */}
                <TableCell align="right">
                  <ActionsCell
                    aria-label={`Actions for ${worker.name}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      setRowMenu({ anchorEl: event.currentTarget, worker })
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* A sibling of <Table> inside <TableContainer>, with component="div" —
            both halves load-bearing (see the Table guidance). Bottom, never above. */}
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, next) => setPage(next)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value))
            setPage(0)
          }}
        />
      </TableContainer>

      {/* Menu order is View, Edit, domain actions, divider, Remove — Remove last
          and destructive, and the verb is never "Delete". */}
      <Menu
        anchorEl={rowMenu?.anchorEl ?? null}
        open={Boolean(rowMenu)}
        onClose={() => setRowMenu(null)}
      >
        <MenuItem onClick={() => setRowMenu(null)}>View</MenuItem>
        <MenuItem onClick={() => setRowMenu(null)}>Edit</MenuItem>
        <MenuItem onClick={() => setRowMenu(null)}>Assign Training</MenuItem>
        <Divider />
        <MenuItem sx={{ color: 'error.main' }} onClick={() => setRowMenu(null)}>
          Remove
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default WorkersPage

import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

export interface TableToolbarProps {
  /** Placeholder for the primary search field. */
  searchPlaceholder?: string;
  /** Current search text (controlled). */
  search?: string;
  onSearchChange?: (value: string) => void;
  /**
   * Slot rendered inline *before* the search field — for the saved-views /
   * scope `Select` ("All employees", "Field crew", …). Per the design system,
   * view switching is a `Select` here, never a `Tabs` row.
   */
  views?: React.ReactNode;
  /**
   * Secondary actions — outlined `IconButton`s only (Import, Export, Edit
   * columns), `size="small"`. Rendered inline after the search field and
   * *before* the primary action. A labeled action belongs in `primaryAction`
   * or `overflowAction`.
   */
  secondaryActions?: React.ReactNode;
  /**
   * The single primary action — one contained `Button` (e.g. "Add …"). Sits at
   * the end of the inline row. A toolbar has at most one primary action.
   */
  primaryAction?: React.ReactNode;
  /**
   * Optional ellipsis `IconButton` opening a menu of table-scoped operations.
   * Use it once the toolbar needs more than three secondary icon buttons — the
   * standard three (Import, Export, Edit columns) stay inline and the rest move
   * here. Never row actions: those live in the row's own last-column menu.
   */
  overflowAction?: React.ReactNode;
  /**
   * @deprecated Use `secondaryActions`, `primaryAction`, and `overflowAction`
   * instead — the named slots encode the correct order and button treatment.
   * When set, renders inline after the search field for backwards
   * compatibility.
   */
  actions?: React.ReactNode;
  /** The filter chips row — pass `FilterChip`s here. */
  filters?: React.ReactNode;
}

/**
 * The toolbar between a `PageHeader` and a data table: an inline row with a
 * views slot, a search field, and the action slots, and a row of filter chips
 * underneath.
 *
 * Actions have three named slots so every toolbar keeps the same order and
 * treatment: `secondaryActions` (outlined icon buttons — Import, Export, Edit
 * columns), then a single `primaryAction` (the contained "Add …" button), then
 * an optional `overflowAction` (ellipsis menu of table-scoped operations, never
 * row actions). The legacy `actions` slot is deprecated — prefer the named
 * slots.
 *
 * Presentational — it owns layout only. Pass real `FilterChip`s (from
 * `components/FilterChip`) into `filters` and drive their state from the page,
 * so type-to-search, multiselect, date, and number chips all work.
 */
export function TableToolbar({
  searchPlaceholder = "Search by name…",
  search,
  onSearchChange,
  views,
  secondaryActions,
  primaryAction,
  overflowAction,
  actions,
  filters,
}: TableToolbarProps) {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
        {views}
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={search}
          onChange={
            onSearchChange ? (e) => onSearchChange(e.target.value) : undefined
          }
          sx={{ flex: 1 }}
          // MUI v9: InputProps was removed in favour of slotProps.input.
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    style={{ color: "var(--ds-text-secondary)", fontSize: 14 }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />
        {secondaryActions}
        {actions}
        {overflowAction}
        {primaryAction}
      </Stack>
      {filters && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", flexWrap: "wrap" }}
        >
          {filters}
        </Stack>
      )}
    </Stack>
  );
}

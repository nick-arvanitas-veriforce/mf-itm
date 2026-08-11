import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

export interface DrawerToolbarProps {
  /** Placeholder for the search field. */
  searchPlaceholder?: string;
  /** Current search text (controlled). */
  search?: string;
  onSearchChange?: (value: string) => void;
  /**
   * The row under the search field — an `exclusive` `ToggleButtonGroup` at
   * `variant="pill"` that switches what the list shows (`All` / `Documents` /
   * `Access`). One dimension, always exactly one selected, so `All` is a real
   * option rather than the absence of a choice.
   *
   * Pass `FilterChip`s here only when the panel genuinely needs several
   * independent dimensions that stack and clear back to unset. If a row of
   * chips would spend most of its life with nothing selected, it wanted a
   * toggle group.
   */
  filters?: React.ReactNode;
}

/**
 * The filter bar between a `DrawerHeader` and a scrollable list inside a
 * drawer: a full-width search field, and a row of filter pills underneath.
 *
 * It carries no action slots. A drawer's actions live in its sticky footer, so
 * unlike `TableToolbar` there is no primary, secondary, or overflow slot here.
 *
 * Presentational — it owns layout only. Drive the filter state from the panel.
 */
export function DrawerToolbar({
  searchPlaceholder = "Search…",
  search,
  onSearchChange,
  filters,
}: DrawerToolbarProps) {
  return (
    <Stack
      spacing={1}
      sx={{
        px: 2,
        py: 1.5,
      }}
    >
      <TextField
        size="small"
        fullWidth
        placeholder={searchPlaceholder}
        value={search}
        onChange={
          onSearchChange ? (e) => onSearchChange(e.target.value) : undefined
        }
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
      {filters && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", flexWrap: "wrap", flex: 1, minWidth: 0 }}>
          {filters}
        </Stack>
      )}
    </Stack>
  );
}

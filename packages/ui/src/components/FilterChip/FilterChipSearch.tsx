import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import {
  ChipShell,
  FilterPopover,
  POPOVER_PADDING,
  usePopoverAnchor,
} from "./shared";

/* ------------------------------------------------------------------ */
/* SEARCH — chip opens a small popover with a text field. The value    */
/* commits live (each keystroke filters); Enter or Escape closes.      */
/* ------------------------------------------------------------------ */

interface FilterChipSearchProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function FilterChipSearch({
  label,
  value,
  onChange,
  placeholder = "Search…",
}: FilterChipSearchProps) {
  const popover = usePopoverAnchor();

  return (
    <>
      <ChipShell
        label={label}
        display={value || null}
        onClick={popover.open}
        onClear={() => onChange("")}
      />
      <FilterPopover anchorEl={popover.anchorEl} onClose={popover.close}>
        <Box sx={{ p: POPOVER_PADDING }}>
          <TextField
            autoFocus
            size="small"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") popover.close();
            }}
            sx={{ width: 200 }}
            slotProps={{
              htmlInput: { "aria-label": `${label} search text` },
            }}
          />
        </Box>
      </FilterPopover>
    </>
  );
}

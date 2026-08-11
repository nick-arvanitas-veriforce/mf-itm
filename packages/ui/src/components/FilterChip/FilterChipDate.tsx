import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { ChipShell, FilterPopover, usePopoverAnchor } from "./shared";

/** ISO date string (YYYY-MM-DD) in / out; formatted for display. */
const fmt = (iso: string) => dayjs(iso).format("MMM D YYYY");

/* ------------------------------------------------------------------ */
/* DATE — chip opens a calendar; picking a day commits and closes.     */
/* ------------------------------------------------------------------ */

interface FilterChipDateProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}

export function FilterChipDate({
  label,
  value,
  onChange,
}: Readonly<FilterChipDateProps>) {
  const popover = usePopoverAnchor();

  return (
    <>
      <ChipShell
        label={label}
        display={value ? fmt(value) : null}
        onClick={popover.open}
        onClear={() => onChange(null)}
      />
      <FilterPopover anchorEl={popover.anchorEl} onClose={popover.close}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={value ? dayjs(value) : null}
            onChange={(next) => {
              onChange(next ? next.format("YYYY-MM-DD") : null);
              popover.close();
            }}
          />
        </LocalizationProvider>
      </FilterPopover>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* DATE_RANGE — presets + From/To date fields (composed from free      */
/* parts; MUI's DateRangePicker is a paid component).                  */
/* ------------------------------------------------------------------ */

export interface DateRange {
  from: string | null;
  to: string | null;
}

interface FilterChipDateRangeProps {
  label: string;
  value: DateRange | null;
  onChange: (value: DateRange | null) => void;
}

const PRESETS: { label: string; range: () => DateRange }[] = [
  { label: "Last week", range: () => rolling(7, "day") },
  { label: "Last month", range: () => rolling(1, "month") },
  { label: "Last quarter", range: () => rolling(3, "month") },
  { label: "Last year", range: () => rolling(1, "year") },
];

function rolling(n: number, unit: "day" | "month" | "year"): DateRange {
  return {
    from: dayjs().subtract(n, unit).format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
  };
}

function formatRange({ from, to }: DateRange): string {
  if (from && to) {
    // Same-year ranges only carry the year once: "Jun 1 – Jun 25 2026"
    const sameYear = dayjs(from).year() === dayjs(to).year();
    const fromText = dayjs(from).format(sameYear ? "MMM D" : "MMM D YYYY");
    return `${fromText} – ${fmt(to)}`;
  }
  if (from) return `after ${fmt(from)}`;
  if (to) return `before ${fmt(to)}`;
  return "";
}

export function FilterChipDateRange({
  label,
  value,
  onChange,
}: Readonly<FilterChipDateRangeProps>) {
  const popover = usePopoverAnchor();
  const hasValue = Boolean(value && (value.from || value.to));

  const setPart = (part: keyof DateRange, next: string) => {
    const current = value ?? { from: null, to: null };
    const merged = { ...current, [part]: next || null };
    onChange(merged.from || merged.to ? merged : null);
  };

  return (
    <>
      <ChipShell
        label={label}
        display={hasValue && value ? formatRange(value) : null}
        onClick={popover.open}
        onClear={() => onChange(null)}
      />
      <FilterPopover
        anchorEl={popover.anchorEl}
        onClose={popover.close}
        paperSx={{ minWidth: 350 }}
      >
        <MenuList sx={{ p: "4px" }}>
          {PRESETS.map((preset) => (
            <MenuItem
              key={preset.label}
              onClick={() => {
                onChange(preset.range());
                popover.close();
              }}
            >
              {preset.label}
            </MenuItem>
          ))}
        </MenuList>
        <Divider />
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", p: "8px" }}>
          <TextField
            type="date"
            size="small"
            value={value?.from ?? ""}
            onChange={(e) => setPart("from", e.target.value)}
            sx={{ flex: 1 }}
            slotProps={{ htmlInput: { "aria-label": `${label} from` } }}
          />
          <Typography variant="body2" color="text.secondary">
            –
          </Typography>
          <TextField
            type="date"
            size="small"
            value={value?.to ?? ""}
            onChange={(e) => setPart("to", e.target.value)}
            sx={{ flex: 1 }}
            slotProps={{ htmlInput: { "aria-label": `${label} to` } }}
          />
        </Stack>
      </FilterPopover>
    </>
  );
}

/* Re-exported so the table demo can format consistently. */
export { fmt as formatDate };

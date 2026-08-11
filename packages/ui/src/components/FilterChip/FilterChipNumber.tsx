import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  ChipShell,
  FilterPopover,
  POPOVER_PADDING,
  usePopoverAnchor,
} from "./shared";

/* ------------------------------------------------------------------ */
/* NUMBER — operator select + amount field. Commits live.              */
/* ------------------------------------------------------------------ */

export type NumberOperator = "is" | "gt" | "lt";

export interface NumberFilter {
  operator: NumberOperator;
  amount: number;
}

const OPERATOR_LABELS: Record<NumberOperator, string> = {
  is: "Is",
  gt: "Greater than",
  lt: "Less than",
};

const OPERATOR_SYMBOLS: Record<NumberOperator, string> = {
  is: "",
  gt: "> ",
  lt: "< ",
};

interface FilterChipNumberProps {
  label: string;
  value: NumberFilter | null;
  onChange: (value: NumberFilter | null) => void;
}

export function FilterChipNumber({
  label,
  value,
  onChange,
}: Readonly<FilterChipNumberProps>) {
  const popover = usePopoverAnchor();
  const operator = value?.operator ?? "is";

  return (
    <>
      <ChipShell
        label={label}
        display={
          value ? `${OPERATOR_SYMBOLS[value.operator]}${value.amount}` : null
        }
        onClick={popover.open}
        onClear={() => onChange(null)}
      />
      <FilterPopover anchorEl={popover.anchorEl} onClose={popover.close}>
        <Stack spacing={1} sx={{ p: POPOVER_PADDING, width: 200 }}>
          <Select
            size="small"
            value={operator}
            onChange={(e) => {
              const next = e.target.value as NumberOperator;
              if (value) onChange({ ...value, operator: next });
            }}
            slotProps={{ input: { "aria-label": `${label} operator` } }}
          >
            {(Object.keys(OPERATOR_LABELS) as NumberOperator[]).map((op) => (
              <MenuItem key={op} value={op}>
                {OPERATOR_LABELS[op]}
              </MenuItem>
            ))}
          </Select>
          <TextField
            autoFocus
            type="number"
            size="small"
            placeholder="Value"
            value={value?.amount ?? ""}
            onChange={(e) => {
              const amount = e.target.value;
              onChange(
                amount === "" ? null : { operator, amount: Number(amount) },
              );
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") popover.close();
            }}
            slotProps={{ htmlInput: { "aria-label": `${label} amount` } }}
          />
        </Stack>
      </FilterPopover>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* NUMBER_RANGE — Min/Max fields. Either side may be left open.        */
/* ------------------------------------------------------------------ */

export interface NumberRange {
  min: number | null;
  max: number | null;
}

interface FilterChipNumberRangeProps {
  label: string;
  value: NumberRange | null;
  onChange: (value: NumberRange | null) => void;
}

function formatNumberRange({ min, max }: NumberRange): string {
  if (min != null && max != null) return `${min} – ${max}`;
  if (min != null) return `≥ ${min}`;
  if (max != null) return `≤ ${max}`;
  return "";
}

export function FilterChipNumberRange({
  label,
  value,
  onChange,
}: Readonly<FilterChipNumberRangeProps>) {
  const popover = usePopoverAnchor();
  const hasValue = Boolean(value && (value.min != null || value.max != null));

  const setPart = (part: keyof NumberRange, raw: string) => {
    const current = value ?? { min: null, max: null };
    const merged = { ...current, [part]: raw === "" ? null : Number(raw) };
    onChange(merged.min != null || merged.max != null ? merged : null);
  };

  return (
    <>
      <ChipShell
        label={label}
        display={hasValue && value ? formatNumberRange(value) : null}
        onClick={popover.open}
        onClear={() => onChange(null)}
      />
      <FilterPopover anchorEl={popover.anchorEl} onClose={popover.close}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ p: POPOVER_PADDING, width: 250 }}
        >
          {(["min", "max"] as const).map((part) => (
            <Stack key={part} spacing={0.5} sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {part === "min" ? "Min" : "Max"}
              </Typography>
              <TextField
                autoFocus={part === "min"}
                type="number"
                size="small"
                value={value?.[part] ?? ""}
                onChange={(e) => setPart(part, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Escape") popover.close();
                }}
                slotProps={{
                  htmlInput: { "aria-label": `${label} ${part}` },
                }}
              />
            </Stack>
          ))}
        </Stack>
      </FilterPopover>
    </>
  );
}

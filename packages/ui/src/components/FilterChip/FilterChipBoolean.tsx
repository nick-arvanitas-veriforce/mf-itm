import { ChipShell } from "./shared";

/* ------------------------------------------------------------------ */
/* BOOLEAN — a toggle chip with no popover. Clicking turns the filter  */
/* on (active style + X); the X turns it back off.                     */
/* ------------------------------------------------------------------ */

interface FilterChipBooleanProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function FilterChipBoolean({
  label,
  value,
  onChange,
}: Readonly<FilterChipBooleanProps>) {
  return (
    <ChipShell
      label={label}
      labelOnly
      showChevron={false}
      display={value ? label : null}
      onClick={() => onChange(!value)}
      onClear={() => onChange(false)}
    />
  );
}

import { FilterChipBoolean } from "./FilterChipBoolean";
import {
  type DateRange,
  FilterChipDate,
  FilterChipDateRange,
} from "./FilterChipDate";
import {
  FilterChipNumber,
  FilterChipNumberRange,
  type NumberFilter,
  type NumberRange,
} from "./FilterChipNumber";
import { FilterChipOptions } from "./FilterChipOptions";
import { FilterChipSearch } from "./FilterChipSearch";

export type { DateRange, NumberFilter, NumberRange };
export { formatDate } from "./FilterChipDate";

/* ------------------------------------------------------------------ */
/* FilterChip — one component, eight variants. The `variant` prop      */
/* narrows the value/onChange pair, so each usage is fully typed.      */
/* ------------------------------------------------------------------ */

export type FilterChipProps = { label: string } & (
  | {
      variant: "SELECT";
      options: string[];
      value: string | null;
      onChange: (value: string | null) => void;
    }
  | {
      variant: "MULTISELECT";
      options: string[];
      value: string[];
      onChange: (value: string[]) => void;
    }
  | {
      variant: "SEARCH";
      value: string;
      onChange: (value: string) => void;
      placeholder?: string;
    }
  | {
      variant: "BOOLEAN";
      value: boolean;
      onChange: (value: boolean) => void;
    }
  | {
      variant: "DATE";
      value: string | null;
      onChange: (value: string | null) => void;
    }
  | {
      variant: "DATE_RANGE";
      value: DateRange | null;
      onChange: (value: DateRange | null) => void;
    }
  | {
      variant: "NUMBER";
      value: NumberFilter | null;
      onChange: (value: NumberFilter | null) => void;
    }
  | {
      variant: "NUMBER_RANGE";
      value: NumberRange | null;
      onChange: (value: NumberRange | null) => void;
    }
);

export function FilterChip(props: FilterChipProps) {
  switch (props.variant) {
    case "SELECT":
      return (
        <FilterChipOptions
          label={props.label}
          options={props.options}
          multiple={false}
          value={props.value}
          onChange={(v) => props.onChange(v as string | null)}
        />
      );
    case "MULTISELECT":
      return (
        <FilterChipOptions
          label={props.label}
          options={props.options}
          multiple
          value={props.value}
          onChange={(v) => props.onChange((v as string[]) ?? [])}
        />
      );
    case "SEARCH":
      return (
        <FilterChipSearch
          label={props.label}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
        />
      );
    case "BOOLEAN":
      return (
        <FilterChipBoolean
          label={props.label}
          value={props.value}
          onChange={props.onChange}
        />
      );
    case "DATE":
      return (
        <FilterChipDate
          label={props.label}
          value={props.value}
          onChange={props.onChange}
        />
      );
    case "DATE_RANGE":
      return (
        <FilterChipDateRange
          label={props.label}
          value={props.value}
          onChange={props.onChange}
        />
      );
    case "NUMBER":
      return (
        <FilterChipNumber
          label={props.label}
          value={props.value}
          onChange={props.onChange}
        />
      );
    case "NUMBER_RANGE":
      return (
        <FilterChipNumberRange
          label={props.label}
          value={props.value}
          onChange={props.onChange}
        />
      );
  }
}

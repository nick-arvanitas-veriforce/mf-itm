import type { MouseEvent, ReactNode } from "react";
import {
  faChevronDown,
  faChevronRight,
  faEllipsis,
  faFile,
  faFileExcel,
  faFileImage,
  faFilePdf,
  faFileWord,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Link from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

/**
 * The catalog of cell content components for the data `Table`. Each renders the
 * canonical treatment of one cell type from Figma; drop it inside a
 * `<TableCell>` so the table keeps its padding, alignment, and hover. They keep
 * table rows consistent and the markup tiny — `<TableCell><TextCell … /></TableCell>`
 * instead of hand-composing `Stack`/`Typography` in every row.
 */

const MUTED = "text.secondary";

function initialsFrom(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Format a date as `DD MMM YYYY` (e.g. `05 Mar 2025`). */
function formatCellDate(value: Date | string | number): string | null {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/* ------------------------------------------------------------------ */
/*  Null                                                               */
/* ------------------------------------------------------------------ */

/**
 * The empty value — a muted em dash. Render this instead of leaving a cell
 * blank so "no value" reads as intentional rather than as missing data. The
 * value cells (`DateCell`, `NumberCell`, `TagsCell`) fall back to it on their own.
 */
export function NullCell() {
  return (
    <Typography component="span" color="text.disabled" aria-label="Not set">
      —
    </Typography>
  );
}

/* ------------------------------------------------------------------ */
/*  Text / string                                                     */
/* ------------------------------------------------------------------ */

export interface TextCellProps {
  /** The primary line — the cell's main value. */
  primary: ReactNode;
  /** An optional muted second line for a supporting identifier (code, email). */
  secondary?: ReactNode;
  /**
   * Clamp to a single line with an ellipsis for values that can run long.
   * `true` clamps at the column width; a number caps `maxWidth` in px. Pair
   * with a tooltip when the full text matters.
   */
  truncate?: boolean | number;
}

/**
 * String cell — the default. A primary line in body text with an optional muted
 * second line. Set `truncate` for a value that can run long. This is the
 * baseline every other text-based cell varies from.
 */
export function TextCell({ primary, secondary, truncate }: TextCellProps) {
  const noWrap = truncate !== undefined && truncate !== false;
  const maxWidth = typeof truncate === "number" ? truncate : undefined;
  const title = noWrap && typeof primary === "string" ? primary : undefined;
  return (
    <Stack sx={{ minWidth: 0 }}>
      <Typography
        noWrap={noWrap}
        title={title}
        sx={maxWidth ? { maxWidth } : undefined}
      >
        {primary}
      </Typography>
      {secondary != null && secondary !== "" && (
        <Typography color={MUTED} noWrap={noWrap}>
          {secondary}
        </Typography>
      )}
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Number                                                             */
/* ------------------------------------------------------------------ */

export interface NumberCellProps {
  /** The numeric value (already formatted, e.g. `"1,240"` or `"$4,500.00"`). */
  value?: ReactNode;
}

/**
 * Number cell — tabular figures so digits line up down the column. Place it in
 * a right-aligned `<TableCell align="right">` and align the column header right
 * to match. Empty values fall back to `NullCell`.
 */
export function NumberCell({ value }: NumberCellProps) {
  if (value == null || value === "") return <NullCell />;
  return (
    <Box component="span" sx={{ fontVariantNumeric: "tabular-nums" }}>
      {value}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Date                                                               */
/* ------------------------------------------------------------------ */

export interface DateCellProps {
  /** A `Date`, ISO string, or timestamp. Rendered as `DD MMM YYYY`. */
  value?: Date | string | number | null;
}

/**
 * Date cell — a `Date`/ISO string/timestamp formatted as `DD MMM YYYY` that
 * never wraps. Formatting only; the value is still a string in the cell. Empty
 * or unparseable values fall back to `NullCell`.
 */
export function DateCell({ value }: DateCellProps) {
  if (value == null || value === "") return <NullCell />;
  const formatted = formatCellDate(value);
  if (!formatted) return <NullCell />;
  return (
    <Typography component="span" sx={{ whiteSpace: "nowrap" }}>
      {formatted}
    </Typography>
  );
}

/* ------------------------------------------------------------------ */
/*  Link                                                               */
/* ------------------------------------------------------------------ */

export interface LinkCellProps {
  children: ReactNode;
  href?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Link cell — a single `Link` when the cell's whole value navigates (open a
 * record, a contract, a file). Don't wrap plain text in a link "just in case".
 */
export function LinkCell({ children, href = "#", onClick }: LinkCellProps) {
  return (
    <Link href={href} onClick={onClick} sx={{ whiteSpace: "nowrap" }}>
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon + text                                                        */
/* ------------------------------------------------------------------ */

export interface IconTextCellProps {
  /** A FontAwesome icon rendered before the text, in muted color by default. */
  icon: IconDefinition;
  children: ReactNode;
  /** Override the icon color (e.g. a semantic status color). */
  iconColor?: string;
}

/**
 * Icon + text cell — a leading FontAwesome glyph beside a label, for a value
 * that reads better with a type/category hint (a channel, a location, a flag).
 * The icon is muted `text.secondary` unless you set `iconColor`.
 */
export function IconTextCell({
  icon,
  children,
  iconColor = "var(--ds-text-secondary)",
}: IconTextCellProps) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{ alignItems: "center", minWidth: 0 }}>
      <FontAwesomeIcon icon={icon} size="sm" style={{ color: iconColor }} />
      <Typography noWrap>{children}</Typography>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Chip                                                               */
/* ------------------------------------------------------------------ */

export interface ChipCellProps {
  label: ReactNode;
  /** Map the row's state to a semantic color. */
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info";
}

/**
 * Chip cell — a single `size="small"` `Chip` mapping the row's state to a
 * semantic color (success / default / warning). One chip per cell; never a row
 * of chips for a single status.
 */
export function ChipCell({ label, color = "default" }: ChipCellProps) {
  return <Chip label={label} color={color} size="small" />;
}

/* ------------------------------------------------------------------ */
/*  Avatar                                                             */
/* ------------------------------------------------------------------ */

export interface AvatarCellProps {
  /** The person/entity name — the primary line. */
  name: string;
  /** An optional muted second line (email, role). */
  secondary?: ReactNode;
  /** Photo URL; falls back to initials when absent. */
  src?: string;
  /** Initials override; otherwise derived from `name`. */
  initials?: string;
}

/**
 * Avatar cell — a `size="sm"` `Avatar` beside a name and optional muted second
 * line, for the row's primary person or entity. The identity column of most
 * tables.
 */
export function AvatarCell({
  name,
  secondary,
  src,
  initials,
}: AvatarCellProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
      <Avatar size="sm" src={src}>
        {!src && (initials ?? initialsFrom(name))}
      </Avatar>
      <Stack sx={{ minWidth: 0 }}>
        <Typography noWrap>{name}</Typography>
        {secondary != null && secondary !== "" && (
          <Typography color={MUTED} noWrap>
            {secondary}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Avatar group                                                       */
/* ------------------------------------------------------------------ */

export interface AvatarGroupPerson {
  name?: string;
  initials?: string;
  src?: string;
}

export interface AvatarGroupCellProps {
  /** The set of people (a team, assignees). */
  people: AvatarGroupPerson[];
  /** An optional label naming the group. */
  label?: ReactNode;
  /** Max avatars shown before a `+N` surplus. */
  max?: number;
}

/**
 * Avatar-group cell — an `AvatarGroup` of `size="xs"` avatars for a set of
 * people, with an optional label naming the group.
 */
export function AvatarGroupCell({
  people,
  label,
  max = 4,
}: AvatarGroupCellProps) {
  if (!people.length) return <NullCell />;
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
      <AvatarGroup max={max}>
        {people.map((person, index) => (
          <Avatar
            key={person.name ?? person.initials ?? index}
            size="xs"
            src={person.src}
          >
            {!person.src &&
              (person.initials ??
                (person.name ? initialsFrom(person.name) : undefined))}
          </Avatar>
        ))}
      </AvatarGroup>
      {label != null && label !== "" && <Typography noWrap>{label}</Typography>}
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  File + text                                                        */
/* ------------------------------------------------------------------ */

export type FileKind = "pdf" | "word" | "excel" | "image" | "generic";

const FILE_ICONS: Record<FileKind, { icon: IconDefinition; color: string }> = {
  pdf: { icon: faFilePdf, color: "var(--ds-color-red-600, #d32f2f)" },
  word: { icon: faFileWord, color: "var(--ds-color-blue-600, #1565c0)" },
  excel: { icon: faFileExcel, color: "var(--ds-color-green-600, #2e7d32)" },
  image: { icon: faFileImage, color: "var(--ds-text-secondary)" },
  generic: { icon: faFile, color: "var(--ds-text-secondary)" },
};

export interface FileCellProps {
  /** The file name — the primary line. */
  name: ReactNode;
  /** A muted metadata line (size · updated). */
  meta?: ReactNode;
  /** The file type, which picks the colored glyph. */
  kind?: FileKind;
}

/**
 * File + text cell — a file-type glyph (colored by type) beside a name and an
 * optional muted metadata line (size · updated). For an attachment or document
 * reference.
 */
export function FileCell({ name, meta, kind = "generic" }: FileCellProps) {
  const { icon, color } = FILE_ICONS[kind];
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
      <Box
        sx={{
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          color,
          flexShrink: 0,
        }}
      >
        <FontAwesomeIcon icon={icon} />
      </Box>
      <Stack sx={{ minWidth: 0 }}>
        <Typography noWrap>{name}</Typography>
        {meta != null && meta !== "" && (
          <Typography color={MUTED} noWrap>
            {meta}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Image (large)                                                      */
/* ------------------------------------------------------------------ */

export interface ImageCellProps {
  src?: string;
  alt?: string;
  /** Square size in px. Defaults to a 40px large thumbnail. */
  size?: number;
}

/**
 * Image cell — a large square thumbnail (rounded) for a preview of the row's
 * subject (a product shot, a document page). Falls back to a placeholder glyph
 * when there's no `src`.
 */
export function ImageCell({ src, alt = "", size = 40 }: ImageCellProps) {
  return (
    <Avatar
      variant="rounded"
      src={src}
      alt={alt}
      sx={{ width: size, height: size }}
    >
      {!src && <FontAwesomeIcon icon={faFileImage} />}
    </Avatar>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton (loading)                                                 */
/* ------------------------------------------------------------------ */

export interface SkeletonCellProps {
  /** Width of the placeholder. */
  width?: number | string;
  variant?: "text" | "rectangular" | "rounded" | "circular";
}

/**
 * Skeleton cell — a loading placeholder shaped like the column's real content.
 * Use it to build skeleton rows while data loads; no spinner.
 */
export function SkeletonCell({
  width = "80%",
  variant = "text",
}: SkeletonCellProps) {
  return <Skeleton variant={variant} width={width} />;
}

/* ------------------------------------------------------------------ */
/*  Tags / list                                                        */
/* ------------------------------------------------------------------ */

export interface TagsCellProps {
  /** The list values. */
  items: string[];
  /** How many to show inline before collapsing the rest into a `+N` chip. */
  max?: number;
}

/**
 * List cell — a short inline list of the first values with a `size="xsmall"`
 * `+N` overflow chip, so a multi-value attribute stays to one line. Empty lists
 * fall back to `NullCell`.
 */
export function TagsCell({ items, max = 2 }: TagsCellProps) {
  if (!items.length) return <NullCell />;
  const shown = items.slice(0, max);
  const overflow = items.length - shown.length;
  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{ alignItems: "center", minWidth: 0 }}>
      <Typography noWrap>{shown.join(", ")}</Typography>
      {overflow > 0 && <Chip label={`+${overflow}`} size="xsmall" />}
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress bar                                                       */
/* ------------------------------------------------------------------ */

export interface ProgressCellProps {
  /** Completion, 0–100. */
  value: number;
  /** Show the trailing percentage caption. */
  showValue?: boolean;
}

/**
 * Progress cell — an inline `LinearProgress` that flexes to fill the column with
 * a trailing caption percentage. For a completion or utilization metric.
 */
export function ProgressCell({ value, showValue = true }: ProgressCellProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: "center", minWidth: 120 }}>
      <LinearProgress variant="determinate" value={value} sx={{ flex: 1 }} />
      {showValue && (
        <Typography variant="caption" color={MUTED}>
          {Math.round(value)}%
        </Typography>
      )}
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Button                                                             */
/* ------------------------------------------------------------------ */

export interface ButtonCellProps {
  children: ReactNode;
  onClick?: () => void;
  /** Button emphasis; defaults to `outlined` so it doesn't shout down the row. */
  variant?: "text" | "outlined" | "contained";
}

/**
 * Button cell — a single `size="small"` action button inside the row (Review,
 * Renew). Keep it `outlined` or `text` so no single row dominates; reserve a
 * `contained` button for the one real primary in the whole table, not per row.
 */
export function ButtonCell({
  children,
  onClick,
  variant = "outlined",
}: ButtonCellProps) {
  return (
    <Button size="small" variant={variant} onClick={onClick}>
      {children}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon buttons                                                       */
/* ------------------------------------------------------------------ */

export interface IconButtonAction {
  icon: IconDefinition;
  /** Accessible label — also the tooltip text. */
  label: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export interface IconButtonsCellProps {
  /** The inline icon actions, right-aligned. */
  actions: IconButtonAction[];
}

/**
 * Icon buttons cell — a small row of `size="xs"` `IconButton`s for one or two
 * frequent inline actions. Beyond two, collapse them into an `ActionsCell`
 * overflow menu instead of a long row of glyphs. Right-align the column.
 */
export function IconButtonsCell({ actions }: IconButtonsCellProps) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
      {actions.map((action) => (
        <IconButton
          key={action.label}
          size="xs"
          aria-label={action.label}
          onClick={action.onClick}
        >
          <FontAwesomeIcon icon={action.icon} />
        </IconButton>
      ))}
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  More actions (overflow menu)                                       */
/* ------------------------------------------------------------------ */

export interface ActionsCellProps {
  /** Opens the row's action menu — set the menu `anchorEl` from `currentTarget`. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  "aria-label"?: string;
}

/**
 * More-actions cell — a right-aligned `size="xs"` (24×24) horizontal-ellipsis
 * `IconButton` (`faEllipsis`, never the vertical one) that opens the row's
 * action menu. Always the last column, always right-aligned, with a blank
 * column header.
 */
export function ActionsCell({
  onClick,
  "aria-label": ariaLabel = "Row actions",
}: ActionsCellProps) {
  return (
    <IconButton size="xs" aria-label={ariaLabel} onClick={onClick}>
      <FontAwesomeIcon icon={faEllipsis} />
    </IconButton>
  );
}

/* ------------------------------------------------------------------ */
/*  Expander                                                           */
/* ------------------------------------------------------------------ */

export interface ExpanderCellProps {
  expanded: boolean;
  onToggle: () => void;
  "aria-label"?: string;
}

/**
 * Expander cell — a `size="xs"` chevron `IconButton` that toggles a row's detail
 * region: chevron-right when collapsed, chevron-down when expanded. Sits in the
 * first column, before the identity cell.
 */
export function ExpanderCell({
  expanded,
  onToggle,
  "aria-label": ariaLabel = "Expand row",
}: ExpanderCellProps) {
  return (
    <IconButton
      size="xs"
      aria-label={ariaLabel}
      aria-expanded={expanded}
      onClick={onToggle}
    >
      <FontAwesomeIcon icon={expanded ? faChevronDown : faChevronRight} />
    </IconButton>
  );
}

/* ------------------------------------------------------------------ */
/*  Checkbox                                                           */
/* ------------------------------------------------------------------ */

export interface CheckboxCellProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Names the row for assistive tech — "Select [row identifier]". */
  "aria-label": string;
  indeterminate?: boolean;
}

/**
 * Checkbox cell — the row-selection control, always the first column. The header
 * checkbox selects all visible rows; use `indeterminate` for a partial page
 * selection. Centres the control itself.
 */
export function CheckboxCell({
  checked,
  onChange,
  indeterminate,
  "aria-label": ariaLabel,
}: CheckboxCellProps) {
  return (
    <Stack sx={{ alignItems: "center", justifyContent: "center" }}>
      <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        onChange={(event) => onChange(event.target.checked)}
        slotProps={{ input: { "aria-label": ariaLabel } }}
      />
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Catalog                                                            */
/* ------------------------------------------------------------------ */

/**
 * The full table-cell catalog as a single object, so the set can be imported
 * and referenced as a group (`TableCells.ChipCell`). Prefer importing the
 * individual named cells directly in app code; this grouping exists mainly for
 * discovery and for the design-system showcase.
 */
export const TableCells = {
  TextCell,
  NumberCell,
  DateCell,
  LinkCell,
  IconTextCell,
  ChipCell,
  AvatarCell,
  AvatarGroupCell,
  FileCell,
  NullCell,
  ImageCell,
  SkeletonCell,
  TagsCell,
  ProgressCell,
  ButtonCell,
  IconButtonsCell,
  ActionsCell,
  ExpanderCell,
  CheckboxCell,
};

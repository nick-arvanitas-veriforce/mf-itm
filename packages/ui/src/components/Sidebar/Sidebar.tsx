import {
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  faChevronDown,
  faChevronRight,
  faTableColumns,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { VeriforceLogo } from "../VeriforceLogo";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

/* ------------------------------------------------------------------ *
 * Sidebar — the Veriforce application navigation sidebar.
 *
 * A dependency-free implementation (MUI layout primitives + FontAwesome +
 * the `--ds-sidebar-*` design tokens — no tailwind, radix-ui, cva, or lucide),
 * matching the Figma "DS / Web" sidebar: a bordered header with the app name
 * and a collapse toggle, then bordered sections of `SidebarItem` rows. Items
 * carry an icon + label, an optional numeric badge, and can nest child rows.
 * The sidebar is always on the left and collapses to an icon rail.
 *
 * Expanded, a parent item's children render inline as an indented, left-
 * bordered submenu (an expander). Collapsed to the icon rail, that same parent
 * opens its children in an MUI popover menu instead. Collapse state is owned by
 * `Sidebar` itself (uncontrolled by default, or controlled via `collapsed` /
 * `onCollapsedChange`); ⌘/Ctrl-B toggles it. The component owns its styling —
 * there is intentionally no `sx`/`className` escape hatch.
 * ------------------------------------------------------------------ */

const SIDEBAR_WIDTH = 240;
const SIDEBAR_WIDTH_COLLAPSED = 56;
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

/* --- tokens ------------------------------------------------------- */
const T = {
  bg: "var(--ds-sidebar-bg)",
  border: "var(--ds-sidebar-border)",
  itemText: "var(--ds-sidebar-item-text)",
  itemTextSelected: "var(--ds-sidebar-item-text-selected)",
  itemIcon: "var(--ds-sidebar-item-icon)",
  itemIconSelected: "var(--ds-sidebar-item-icon-selected)",
  itemBgHover: "var(--ds-sidebar-item-bg-hover)",
  itemBgSelected: "var(--ds-sidebar-item-bg-selected)",
  groupLabel: "var(--ds-sidebar-group-label)",
} as const;

/** A click handler that works for either a `<button>` or `<a>` row surface. */
type RowClick = (event: ReactMouseEvent<HTMLElement>) => void;

/* ------------------------------------------------------------------ */
/* Context — collapse state + rendering mode, shared with descendants  */
/* ------------------------------------------------------------------ */

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  /** Nesting depth of the current item (0 = top level). */
  depth: number;
  /** True when rendering inside a collapsed item's popover menu. */
  inPopover: boolean;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/** Read the sidebar's collapsed state and toggle. Must be used under a `Sidebar`. */
export function useSidebar(): Pick<
  SidebarContextValue,
  "collapsed" | "toggle"
> {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a <Sidebar>.");
  return { collapsed: ctx.collapsed, toggle: ctx.toggle };
}

function useSidebarInternal(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx)
    throw new Error("Sidebar sub-components must be used within a <Sidebar>.");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Sidebar shell                                                       */
/* ------------------------------------------------------------------ */

export interface SidebarProps {
  /** Header wordmark; defaults to the Veriforce logo. Hidden when collapsed. */
  logo?: ReactNode;
  /** Plain-text branding instead of a wordmark. Takes precedence over `logo`. */
  appName?: string;
  /** Controlled collapsed state. Omit for uncontrolled. */
  collapsed?: boolean;
  /** Initial collapsed state when uncontrolled. */
  defaultCollapsed?: boolean;
  /** Fires whenever the collapsed state changes (either mode). */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Section groups — compose `SidebarSection` / `SidebarItem`. */
  children?: ReactNode;
}

export function Sidebar({
  logo,
  appName,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  children,
}: SidebarProps) {
  const [internal, setInternal] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? internal;

  const toggle = useCallback(() => {
    const next = !(collapsedProp ?? internal);
    if (collapsedProp === undefined) setInternal(next);
    onCollapsedChange?.(next);
  }, [collapsedProp, internal, onCollapsedChange]);

  // ⌘/Ctrl-B toggles the sidebar.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const ctx = useMemo<SidebarContextValue>(
    () => ({ collapsed, toggle, depth: 0, inPopover: false }),
    [collapsed, toggle],
  );

  return (
    <SidebarContext.Provider value={ctx}>
      <Stack
        component="nav"
        data-collapsed={collapsed}
        sx={{
          height: "100%",
          width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH,
          flexShrink: 0,
          bgcolor: T.bg,
          borderRight: `1px solid ${T.border}`,
          overflowX: "hidden",
          transition: "width 200ms ease",
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", minHeight: 48,
            px: 1,
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0 }}>
          {!collapsed &&
            (appName ? (
              <Typography
                variant="subtitle2"
                noWrap
                sx={{ flex: 1, minWidth: 0, px: 1, color: T.itemTextSelected }}
              >
                {appName}
              </Typography>
            ) : (
              <Stack sx={{ flex: 1, minWidth: 0, px: 1, alignItems: "start" }}>
                {logo ?? <VeriforceLogo height={20} />}
              </Stack>
            ))}
          <Tooltip
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            placement="right"
          >
            <IconButton
              variant="text"
              size="xs"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={toggle}
              sx={{ mx: collapsed ? "auto" : 0 }}
            >
              <FontAwesomeIcon icon={faTableColumns} fontSize={14} />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Content — scrollable stack of sections. `scrollbar-gutter: stable`
            reserves the scrollbar's track even when no scrollbar is showing, so
            expanding a long section doesn't shift the rows sideways. The bottom
            padding lets the last row scroll clear of the viewport edge instead
            of ending flush against it. */}
        <Stack
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarGutter: "stable both-edges",
            pb: 3,
          }}
        >
          {children}
        </Stack>
      </Stack>
    </SidebarContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Section — a bordered group of items                                 */
/* ------------------------------------------------------------------ */

export interface SidebarSectionProps {
  /** Optional group label shown above the items (hidden when collapsed). */
  label?: string;
  /** Draw a bottom divider under the section. Defaults to true. */
  divider?: boolean;
  children?: ReactNode;
}

export function SidebarSection({
  label,
  divider = true,
  children,
}: SidebarSectionProps) {
  const { collapsed } = useSidebarInternal();
  return (
    <Stack
      spacing={0.5}
      sx={{ py: 1, ...(divider && { borderBottom: `1px solid ${T.border}` }) }}
    >
      {label && !collapsed && (
        <Typography
          variant="overline"
          sx={{ px: 1, py: 0.5, color: T.groupLabel, lineHeight: 1 }}
        >
          {label}
        </Typography>
      )}
      {children}
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/* Item — icon + label (+ badge / nesting)                             */
/* ------------------------------------------------------------------ */

export interface SidebarItemProps {
  /** Row label. */
  label: string;
  /** Leading FontAwesome icon. Top-level rows show one; nested rows omit it. */
  icon?: IconDefinition;
  /** Highlight as the current page. */
  selected?: boolean;
  /** Numeric / short badge shown at the trailing edge. */
  badge?: ReactNode;
  /** Nested rows (`SidebarItem`s) — makes this an expandable parent. */
  children?: ReactNode;
  /** Whether a parent row starts expanded (uncontrolled). Defaults to true. */
  defaultExpanded?: boolean;
  /** Controlled expanded state for a parent row. Pass alongside `onExpandedChange`
   *  when something outside the row must drive it — e.g. auto-opening the group
   *  that owns the current route after a search jump. Omit for uncontrolled. */
  expanded?: boolean;
  /** Fires whenever the expanded state changes (either mode). */
  onExpandedChange?: (expanded: boolean) => void;
  /** Render the row as a link (e.g. for client-side routing, pass the route). */
  href?: string;
  onClick?: RowClick;
}

export function SidebarItem(props: SidebarItemProps) {
  const ctx = useSidebarInternal();
  // Inside a collapsed item's popover, rows render as MUI menu items.
  if (ctx.inPopover) return <SidebarPopoverItem {...props} />;
  // Collapsed rail + has children → open the children in a popover menu.
  if (ctx.collapsed && ctx.depth === 0 && props.children)
    return <SidebarCollapsedParent {...props} />;
  return <SidebarInlineItem {...props} />;
}

/* --- the standard inline row (expanded, or a leaf on the rail) ---- */
function SidebarInlineItem({
  label,
  icon,
  selected = false,
  badge,
  children,
  defaultExpanded = true,
  expanded: expandedProp,
  onExpandedChange,
  href,
  onClick,
}: SidebarItemProps) {
  const parent = useSidebarInternal();
  const { collapsed, depth } = parent;
  const hasChildren = Boolean(children);
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = expandedProp ?? internalExpanded;
  const nested = depth > 0;
  const rowRef = useRef<HTMLElement>(null);

  // A row can become selected while it sits outside the scrolled viewport — the
  // page was reached by search or a link rather than by clicking the row itself,
  // and its parent group only just expanded. Pull it into view so the sidebar
  // actually shows where the user is. `nearest` scrolls the minimum distance, so
  // an already-visible row doesn't move.
  useEffect(() => {
    if (selected) rowRef.current?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const childCtx = useMemo<SidebarContextValue>(
    () => ({ ...parent, depth: depth + 1 }),
    [parent, depth],
  );

  const handleClick: RowClick = (e) => {
    if (hasChildren) {
      if (expandedProp === undefined) setInternalExpanded(!expanded);
      onExpandedChange?.(!expanded);
    }
    onClick?.(e);
  };

  const row = (
    <RowSurface
      ref={rowRef}
      href={href}
      onClick={handleClick}
      selected={selected}
      collapsed={collapsed}
    >
      <RowIcon icon={icon} nested={nested} selected={selected} />
      {!collapsed && <RowLabel label={label} selected={selected} />}
      {!collapsed && badge != null && <SidebarBadge>{badge}</SidebarBadge>}
      {!collapsed && hasChildren && <RowChevron open={expanded} />}
    </RowSurface>
  );

  // On the collapsed rail, every leaf gets a tooltip for identification.
  const rendered =
    collapsed && !nested ? (
      <Tooltip title={label} placement="right">
        <span>{row}</span>
      </Tooltip>
    ) : (
      row
    );

  if (!hasChildren) return rendered;

  return (
    <Box>
      {rendered}
      {!collapsed && expanded && (
        <Box sx={{ pl: 2, py: 0.25 }}>
          <Stack
            spacing={0.5}
            sx={{ pl: 1, borderLeft: `1px solid ${T.border}` }}
          >
            <SidebarContext.Provider value={childCtx}>
              {children}
            </SidebarContext.Provider>
          </Stack>
        </Box>
      )}
    </Box>
  );
}

/* --- collapsed parent: icon button that opens a popover menu ------- */
function SidebarCollapsedParent({
  label,
  icon,
  selected = false,
  children,
}: SidebarItemProps) {
  const parent = useSidebarInternal();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);

  const popoverCtx = useMemo<SidebarContextValue>(
    () => ({ ...parent, depth: parent.depth + 1, inPopover: true }),
    [parent],
  );

  return (
    <Box>
      <Tooltip title={label} placement="right" disableHoverListener={open}>
        <span>
          <RowSurface
            selected={selected}
            collapsed
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={(e) => setAnchor(e.currentTarget)}
          >
            <RowIcon icon={icon} nested={false} selected={selected} />
          </RowSurface>
        </span>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ list: { dense: true, sx: { minWidth: 180 } } }}
      >
        <Typography
          variant="overline"
          sx={{ display: "block", px: 2, py: 0.5, color: T.groupLabel }}
        >
          {label}
        </Typography>
        <SidebarContext.Provider value={popoverCtx}>
          {children}
        </SidebarContext.Provider>
      </Menu>
    </Box>
  );
}

/* --- a row rendered inside a popover menu (MUI MenuItem) ----------- */
function SidebarPopoverItem({
  label,
  selected = false,
  badge,
  children,
  href,
  onClick,
}: SidebarItemProps) {
  const parent = useSidebarInternal();
  const hasChildren = Boolean(children);
  const [subAnchor, setSubAnchor] = useState<HTMLElement | null>(null);
  const subOpen = Boolean(subAnchor);

  const subCtx = useMemo<SidebarContextValue>(
    () => ({ ...parent, depth: parent.depth + 1, inPopover: true }),
    [parent],
  );

  const handleClick: RowClick = (e) => {
    if (hasChildren) setSubAnchor((a) => (a ? null : e.currentTarget));
    onClick?.(e);
  };

  return (
    <>
      <MenuItem
        component={href ? "a" : "li"}
        href={href}
        selected={selected}
        onClick={handleClick}
        sx={{ gap: 1, borderRadius: "6px", mx: 0.5 }}
      >
        <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
          {label}
        </Typography>
        {badge != null && <SidebarBadge>{badge}</SidebarBadge>}
        {hasChildren && (
          <FontAwesomeIcon
            icon={faChevronRight}
            fontSize={12}
            style={{ color: T.itemIcon }}
          />
        )}
      </MenuItem>
      {hasChildren && (
        <Menu
          anchorEl={subAnchor}
          open={subOpen}
          onClose={() => setSubAnchor(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{ list: { dense: true, sx: { minWidth: 160 } } }}
        >
          <SidebarContext.Provider value={subCtx}>
            {children}
          </SidebarContext.Provider>
        </Menu>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Row building blocks                                                 */
/* ------------------------------------------------------------------ */

function RowIcon({
  icon,
  nested,
  selected,
}: {
  icon?: IconDefinition;
  nested: boolean;
  selected: boolean;
}) {
  if (!icon || nested) return null;
  return (
    <Box
      sx={{
        width: 18,
        minWidth: 18,
        display: "flex",
        justifyContent: "center",
        color: selected ? T.itemIconSelected : T.itemIcon,
      }}
    >
      <FontAwesomeIcon icon={icon} fontSize={14} />
    </Box>
  );
}

function RowLabel({ label, selected }: { label: string; selected: boolean }) {
  return (
    <Typography
      variant="body2"
      noWrap
      sx={{
        flex: 1,
        minWidth: 0,
        color: selected ? T.itemTextSelected : T.itemText,
        // Nested rows carry no icon, so weight is what makes the selected row
        // read as current — the white background alone is too subtle.
        fontWeight: selected ? 500 : 400,
      }}
    >
      {label}
    </Typography>
  );
}

function RowChevron({ open }: { open: boolean }) {
  return (
    <Box
      sx={{
        width: 16,
        display: "flex",
        justifyContent: "center",
        color: T.itemIcon,
        transform: open ? "rotate(0deg)" : "rotate(-90deg)",
        transition: "transform 150ms ease",
      }}
    >
      <FontAwesomeIcon icon={faChevronDown} fontSize={12} />
    </Box>
  );
}

/* --- row surface (button or link), styled per selected state ------ */
interface RowSurfaceProps {
  href?: string;
  onClick?: RowClick;
  selected: boolean;
  collapsed: boolean;
  children: ReactNode;
  "aria-haspopup"?: "menu";
  "aria-expanded"?: boolean;
}

const RowSurface = function RowSurface({
  ref,
  href,
  onClick,
  selected,
  collapsed,
  children,
  ...aria
}: RowSurfaceProps & { ref?: React.RefObject<HTMLElement | null> }) {
  const rowSx = {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    width: "100%",
    minHeight: 32,
    px: "7px",
    py: "6px",
    borderRadius: "6px",
    border: 0,
    // Longhand, not the `background` shorthand: the `&:hover` rule below sets
    // `background-color`, and a shorthand here can override it depending on the
    // order the styles are serialized.
    backgroundColor: selected ? T.itemBgSelected : "transparent",
    color: "inherit",
    font: "inherit",
    textAlign: "left" as const,
    textDecoration: "none",
    cursor: "pointer",
    boxSizing: "border-box" as const,
    "&:hover": { bgcolor: selected ? T.itemBgSelected : T.itemBgHover },
    "&:focus-visible": {
      outline: "2px solid var(--ds-focus-ring)",
      outlineOffset: -2,
    },
    ...(collapsed && { justifyContent: "center", px: "6px" }),
  };

  if (href) {
    return (
      <Box
        component="a"
        ref={ref}
        href={href}
        onClick={onClick}
        sx={rowSx}
        {...aria}
      >
        {children}
      </Box>
    );
  }
  return (
    <Box
      component="button"
      ref={ref}
      type="button"
      onClick={onClick}
      sx={rowSx}
      {...aria}
    >
      {children}
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* Badge — the trailing numeric pill (Figma Custom/NavBadge)           */
/* ------------------------------------------------------------------ */

export function SidebarBadge({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 12,
        px: 0.5,
        borderRadius: "3px",
        bgcolor: "var(--ds-primary-bg, #eff6ff)",
        color: "var(--ds-primary-text, #215bea)",
        fontFamily: "var(--ds-font-family-sans)",
        fontSize: "var(--ds-text-xs-font-size, 12px)",
        lineHeight: "16px",
        fontWeight: 400,
      }}
    >
      {children}
    </Box>
  );
}

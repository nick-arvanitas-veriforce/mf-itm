import { type ReactNode, useState } from "react";
import { faChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

/* ------------------------------------------------------------------ */
/* Shared filter-chip anatomy                                          */
/*   height 28 = 20px line + 4px vertical padding (chip small)         */
/*   text · 4px gap · 16px icon · 10px right padding                   */
/*   active = --ds-primary-bg fill, primary.main text, no border       */
/* ------------------------------------------------------------------ */

export const CHIP_TEXT = { fontSize: "14px", lineHeight: "20px" } as const;

export const ACTIVE_BG = "var(--ds-primary-bg)";
export const ACTIVE_BG_HOVER = "var(--ds-primary-hover)";
export const IDLE_BG_HOVER = "var(--ds-neutral-hover)";

/** Content padding for popovers that hold fields (not menu lists). */
export const POPOVER_PADDING = "12px";

/* ------------------------------------------------------------------ */
/* ChipShell — the pill used by popover-based variants (date, number,  */
/* search, boolean). Autocomplete-based variants render their own pill */
/* through the TextField but share the same tokens above.              */
/* ------------------------------------------------------------------ */

export interface ChipShellProps {
  label: string;
  /** Formatted value text; null renders the chip inactive. */
  display: string | null;
  /** Hide the "Label:" colon+value structure (BOOLEAN chips). */
  labelOnly?: boolean;
  /** Chevron on the inactive chip; the active chip always swaps to X. */
  showChevron?: boolean;
  onClick: (anchor: HTMLElement) => void;
  onClear: () => void;
}

export function ChipShell({
  label,
  display,
  labelOnly = false,
  showChevron = true,
  onClick,
  onClear,
}: ChipShellProps) {
  const active = display !== null;
  const showIcon = active || showChevron;

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`${label} filter`}
      onClick={(e) => onClick(e.currentTarget as HTMLElement)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(e.currentTarget as HTMLElement);
        }
      }}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        height: "28px",
        borderRadius: "999px",
        pl: "12px",
        pr: showIcon ? "10px" : "12px",
        gap: "4px",
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        border: "1px solid",
        borderColor: active ? "transparent" : "divider",
        backgroundColor: active ? ACTIVE_BG : "transparent",
        transition: "background-color 120ms",
        "&:hover": {
          backgroundColor: active ? ACTIVE_BG_HOVER : IDLE_BG_HOVER,
          borderColor: active ? "transparent" : "text.secondary",
        },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: "1px",
        },
      }}
    >
      <Typography
        component="span"
        sx={{
          ...CHIP_TEXT,
          fontWeight: active ? 500 : 400,
          color: active ? "primary.main" : undefined,
        }}
      >
        {label}
        {active && !labelOnly && ":"}
      </Typography>
      {display && !labelOnly && (
        <Typography
          component="span"
          sx={{ ...CHIP_TEXT, color: "primary.main" }}
        >
          {display}
        </Typography>
      )}
      {active ? (
        <Box
          component="span"
          role="button"
          aria-label={`Clear ${label} filter`}
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          sx={{
            width: "16px",
            height: "16px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.main",
            borderRadius: "999px",
            "&:hover": { backgroundColor: "var(--ds-primary-selected)" },
          }}
        >
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 12 }} />
        </Box>
      ) : (
        showChevron && (
          <Box
            component="span"
            sx={{
              width: "16px",
              height: "16px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
            }}
          >
            <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 12 }} />
          </Box>
        )
      )}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* FilterPopover — shared dropdown surface for popover-based variants. */
/* Pinned to the chip's bottom-left, styled to match the Menu paper.   */
/* ------------------------------------------------------------------ */

export function FilterPopover({
  anchorEl,
  onClose,
  children,
  paperSx,
}: {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  children: ReactNode;
  paperSx?: SxProps<Theme>;
}) {
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        paper: {
          elevation: 1,
          sx: { borderRadius: "6px", minWidth: 200, ...paperSx },
        },
      }}
    >
      {children}
    </Popover>
  );
}

/** Anchor-state helper shared by the popover variants. */
export function usePopoverAnchor() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  return {
    anchorEl,
    open: (el: HTMLElement) => setAnchorEl(el),
    close: () => setAnchorEl(null),
  };
}

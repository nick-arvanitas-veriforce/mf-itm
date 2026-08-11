import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";

export interface AppLayoutProps {
  /**
   * The navigation rail — a `Sidebar`. It occupies the full height on the left
   * and owns its own width (including its collapsed/expanded state), so nothing
   * extra is needed here for collapse to work.
   */
  sidebar?: ReactNode;
  /**
   * The top bar — an `AppBar`. It spans the width to the right of the sidebar
   * only, never above it, and stays fixed while the content scrolls.
   */
  appBar?: ReactNode;
  /**
   * Show an indeterminate progress bar pinned directly beneath the `AppBar`
   * while the screen loads or a background fetch is in flight. It overlays the
   * top edge of the content without shifting layout, so the frame stays put.
   */
  loading?: boolean;
  /** The page content. This is the only region that scrolls. */
  children?: ReactNode;
  /** Escape hatch for the root element (e.g. constrain height in a preview). */
  sx?: SxProps<Theme>;
}

/**
 * The canonical app shell. Establishes the one correct arrangement of the three
 * frame pieces so screens don't reinvent it:
 *
 * - the `Sidebar` runs the full viewport height down the left,
 * - the `AppBar` spans the remaining width across the top — above the content
 *   region only, never above the sidebar,
 * - the content fills the area below the app bar and right of the sidebar and
 *   is the only part that scrolls; the app bar and sidebar stay put.
 *
 * Start every full-page screen from this component and pass the three slots —
 * a screen composed with `AppLayout` needs no layout CSS of its own. The root
 * fills the viewport (`100vh`); override via `sx` only to embed it inside a
 * bounded container (a preview, a split view). Pass `loading` to show an
 * indeterminate progress bar pinned under the app bar while data is in flight.
 */
export function AppLayout({
  sidebar,
  appBar,
  loading = false,
  children,
  sx,
}: AppLayoutProps) {
  return (
    <Stack
      direction="row"
      sx={[
        { height: "100vh", width: "100%", overflow: "hidden" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {sidebar}

      {/* Main column — the app bar pinned above an independently scrolling
          content region, filling the width to the right of the sidebar. */}
      <Stack sx={{ flex: 1, minWidth: 0, height: "100%" }}>
        {appBar && (
          <Box sx={{ flexShrink: 0, position: "relative" }}>
            {appBar}
            {loading && (
              <LinearProgress
                aria-label="Loading"
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1,
                }}
              />
            )}
          </Box>
        )}
        <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>{children}</Box>
      </Stack>
    </Stack>
  );
}

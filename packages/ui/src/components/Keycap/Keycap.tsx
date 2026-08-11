import Typography from "@mui/material/Typography";

/**
 * A small inline `<kbd>`-style label for a single keyboard key or key token —
 * bordered, subtle-surface, secondary text. Use it to render keyboard-shortcut
 * hints inline with other UI (e.g. the ⌘/Ctrl-K search hint on the AppBar and
 * TablePage). One Keycap per key: compose several with a separator for a chord
 * (`<Keycap>⌘</Keycap> + <Keycap>K</Keycap>`). Presentational — pass the key
 * glyph or short token as its children.
 */
export default function Keycap({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      component="span"
      sx={{
        px: "4px",
        fontSize: 12,
        lineHeight: "16px",
        color: "var(--ds-text-secondary)",
        bgcolor: "var(--ds-surface-default)",
        border: "1px solid var(--ds-border-subtle)",
        borderRadius: "4px",
      }}
    >
      {children}
    </Typography>
  );
}

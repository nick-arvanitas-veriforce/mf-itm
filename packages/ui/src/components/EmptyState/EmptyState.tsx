import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface EmptyStateProps {
  icon: IconDefinition;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <Stack
      sx={{ alignItems: "center", justifyContent: "center", p: 1,
        borderRadius: "var(--ds-border-radius-150)",
        backgroundColor: "var(--ds-surface-elevated)" }}>
      <Stack
        spacing={1}
        sx={{ alignItems: "center", justifyContent: "center", width: "100%",
          p: 3,
          borderRadius: "var(--ds-border-radius-150)",
          backgroundColor: "var(--ds-surface-default)" }}>
        <Stack spacing={2} aria-live="polite" sx={{ alignItems: "center" }}>
          {/* Icon chip */}
          <Stack
            sx={{ alignItems: "center", justifyContent: "center", width: 44,
              height: 44,
              borderRadius: "var(--ds-border-radius-150)",
              border: "1px solid var(--ds-border-subtle)" }}>
            <FontAwesomeIcon
              icon={icon}
              style={{ fontSize: 24, color: "var(--ds-text-tertiary)" }}
            />
          </Stack>

          {/* Text */}
          <Stack spacing={0.5} sx={{ alignItems: "center", textAlign: "center" }}>
            <Typography variant="subtitle2">{title}</Typography>
            {message && (
              <Typography variant="body2" color="text.secondary">
                {message}
              </Typography>
            )}
          </Stack>
        </Stack>

        {action && <Box sx={{ mt: 1 }}>{action}</Box>}
      </Stack>
    </Stack>
  );
}

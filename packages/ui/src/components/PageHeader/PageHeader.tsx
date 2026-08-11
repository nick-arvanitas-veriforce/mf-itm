import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip, { type ChipProps } from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface PageHeaderProps {
  /** Page title, rendered as an h5. */
  title: string;
  /** When supplied, renders the back IconButton wired to this handler. */
  onBack?: () => void;
  /** Label for the primary contained Button; omit to render no action. */
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  /** FontAwesome icon leading the primary action (defaults to a plus). */
  primaryActionIcon?: IconDefinition;
  /** Status chips rendered next to the title. */
  chips?: Pick<ChipProps, "label" | "color">[];
  /** Section tab labels rendered under the title (text only, no icons). */
  tabs?: string[];
  /** Index of the active tab. */
  activeTab?: number;
  onTabChange?: (event: React.SyntheticEvent, index: number) => void;
}

/**
 * The standard page header block: an optional back button, a title, one primary
 * action on the right, and (optionally) the page's section tabs underneath.
 * Owns its own padding — place it full-width at the top of the page; the tabs'
 * bottom border runs edge to edge while the content stays on the 24px gutter.
 */
export function PageHeader({
  title,
  onBack,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionIcon = faPlus,
  tabs,
  chips,
  activeTab = 0,
  onTabChange,
}: PageHeaderProps) {
  return (
    <Box sx={{ px: 2, borderBottom: "1px solid var(--ds-border-subtle)" }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", px: 1, py: 0.75 }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", width: "100%" }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {onBack && (
              <IconButton
                size="xs"
                aria-label="Back"
                onClick={onBack}
                sx={{ bgcolor: "var(--ds-neutral-hover)" }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </IconButton>
            )}
            <Typography
              variant="h3"
              sx={{ display: "flex", alignItems: "center", height: 32 }}
            >
              {title}
            </Typography>
          </Stack>
          {chips?.map((chip) => (
            <Chip
              key={String(chip.label)}
              label={chip.label}
              size="small"
              color={chip.color ?? "info"}
            />
          ))}
        </Stack>
        {primaryActionLabel && (
          <Button
            variant="contained"
            size="small"
            startIcon={<FontAwesomeIcon icon={primaryActionIcon} />}
            onClick={onPrimaryAction}
          >
            {primaryActionLabel}
          </Button>
        )}
      </Stack>
      {tabs && tabs.length > 0 && (
        <Tabs value={activeTab} onChange={onTabChange}>
          {tabs.map((t) => (
            <Tab key={t} label={t} />
          ))}
        </Tabs>
      )}
    </Box>
  );
}

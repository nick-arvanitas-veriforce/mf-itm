import type { ReactNode } from "react";
import { faCamera, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export interface DrawerHeaderProps {
  /** The record or task the drawer is about. */
  title?: ReactNode;
  /** One supporting line under the title. */
  subtitle?: ReactNode;
  /** Renders inline, to the right of the title — a status `Chip`. */
  chip?: ReactNode;
  /** Image src for the identity avatar. */
  avatarSrc?: string;
  /** Show an avatar without a src, falling back to the default. */
  avatar?: boolean;
  /** Adds a camera affordance over the avatar and fires this on click. */
  onEditAvatar?: () => void;
  /** Shows the close (X) button and fires this on click. */
  onClose?: () => void;
  /** Divider below the header. On by default. */
  hasDivider?: boolean;
  /**
   * A `Tabs` row for a record with more than one section. Rendered inside the
   * header, above its single divider, so the header and tabs read as one band
   * — a drawer that draws its own rule under the tabs stacks two lines a few
   * pixels apart. Pass the bare `Tabs`; the header owns the inset.
   */
  tabs?: ReactNode;
}

function HeaderAvatar({
  src,
  onEdit,
}: {
  src?: string;
  onEdit?: DrawerHeaderProps["onEditAvatar"];
}) {
  const avatar = <Avatar src={src} size="lg" />;

  if (!onEdit) return avatar;

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      badgeContent={
        <IconButton
          variant="outlined"
          sx={{ borderRadius: 999 }}
          size="xs"
          onClick={onEdit}
          aria-label="Edit avatar"
        >
          <FontAwesomeIcon icon={faCamera} />
        </IconButton>
      }
    >
      {avatar}
    </Badge>
  );
}

/**
 * The top band of a `Drawer`: an optional identity avatar, the title with an
 * optional status chip and subtitle, and the close button.
 *
 * Owns its padding and its bottom divider — place it as the first child of a
 * `Drawer`, above the scrolling body. Don't wrap it in another padded `Box`.
 */
export function DrawerHeader({
  title = "Drawer Header",
  subtitle,
  chip,
  avatarSrc,
  avatar,
  hasDivider = true,
  onEditAvatar,
  onClose,
  tabs,
}: DrawerHeaderProps) {
  const showAvatar = avatar || Boolean(avatarSrc) || Boolean(onEditAvatar);

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          px: 3,
          pt: 2,
          pb: tabs ? 1 : 2,
          alignItems: "flex-start",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ flex: 1, minWidth: 0, alignItems: "center" }}
        >
          {showAvatar && <HeaderAvatar src={avatarSrc} onEdit={onEditAvatar} />}

          <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.25}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", flexWrap: "wrap" }}
            >
              <Typography variant="h3">{title}</Typography>
              {chip}
            </Stack>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Stack>
        </Stack>

        {onClose && (
          <IconButton
            variant="text"
            size="xs"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        )}
      </Stack>
      {tabs && <Box sx={{ px: 3 }}>{tabs}</Box>}
      {hasDivider && <Divider />}
    </Box>
  );
}

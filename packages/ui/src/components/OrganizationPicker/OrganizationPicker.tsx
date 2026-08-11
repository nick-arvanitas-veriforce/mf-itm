import { useCallback, useRef, useState } from "react";
import {
  faArrowRightFromBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export interface OrganizationPickerLink {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface OrganizationPickerProps {
  /** Signed-in user's full name — the trigger's first line. */
  name: string;
  /** Active organization — the trigger's second line, highlighted in the menu. */
  organization: string;
  /** Avatar initials; derived from `name` when omitted. */
  initials?: string;
  /** Product links at the top of the menu (e.g. VeriforceOne Profile, eLearning). */
  links?: OrganizationPickerLink[];
  /** Organizations the user can switch between; the active one is highlighted. */
  organizations?: string[];
  /** Fires with the chosen organization; the menu closes after. */
  onOrganizationChange?: (organization: string) => void;
  /** Renders the "View All" link under the organization list. */
  onViewAll?: () => void;
  /** Renders the Edit Profile item in the bottom section. */
  onEditProfile?: () => void;
  /** Renders the Sign Out item in the bottom section. */
  onSignOut?: () => void;
  /** Open the menu on mount (previews and demos). */
  defaultOpen?: boolean;
}

const initialsFrom = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const itemSx = {
  px: "8px",
  py: "6px",
  borderRadius: "6px",
  fontSize: "var(--ds-list-item-text-font-size)",
  lineHeight: "var(--ds-list-item-text-line-height)",
} as const;

/**
 * The AppBar profile control: a 24px avatar with the user's name over the
 * active organization, opening a menu of product links, an organization
 * switcher (active org highlighted), and Edit Profile / Sign Out. Place it as
 * the last item on the AppBar's right side; every section is optional and
 * renders only when its prop is provided.
 */
export function OrganizationPicker({
  name,
  organization,
  initials,
  links,
  organizations,
  onOrganizationChange,
  onViewAll,
  onEditProfile,
  onSignOut,
  defaultOpen = false,
}: OrganizationPickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const openedByDefault = useRef(false);
  const triggerRef = useCallback(
    (node: HTMLButtonElement | null) => {
      if (defaultOpen && node && !openedByDefault.current) {
        openedByDefault.current = true;
        setAnchorEl(node);
      }
    },
    [defaultOpen],
  );
  const close = () => setAnchorEl(null);

  const hasLinks = !!links?.length;
  const hasOrgs = !!organizations?.length;
  const hasFooter = !!(onEditProfile || onSignOut);

  return (
    <>
      <ButtonBase
        ref={triggerRef}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={anchorEl ? "true" : undefined}
        sx={{
          width: 240,
          flexShrink: 0,
          px: "6px",
          py: "2px",
          borderRadius: "6px",
          justifyContent: "flex-start",
          textAlign: "left",
          "&:hover": { bgcolor: "var(--ds-neutral-hover)" },
        }}
      >
        <Stack
          direction="row"
          spacing="6px"
          sx={{ alignItems: "center", width: "100%", minWidth: 0 }}>
          <Avatar
            sx={{
              width: "var(--ds-avatar-xs-size)",
              height: "var(--ds-avatar-xs-size)",
              fontSize: "var(--ds-avatar-xs-text-font-size)",
              bgcolor: "var(--ds-avatar-bg)",
              color: "var(--ds-avatar-text)",
            }}
          >
            {initials ?? initialsFrom(name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              noWrap
              sx={{
                fontSize: 12,
                lineHeight: "14px",
                color: "var(--ds-text-primary)",
              }}
            >
              {name}
            </Typography>
            <Typography
              noWrap
              sx={{
                fontSize: 12,
                lineHeight: "14px",
                color: "var(--ds-text-secondary)",
              }}
            >
              {organization}
            </Typography>
          </Box>
        </Stack>
      </ButtonBase>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              width: 300,
              mt: "2px",
              borderRadius: "var(--ds-popover-border-radius)",
              boxShadow: "var(--ds-shadow-md)",
              bgcolor: "var(--ds-popover-bg)",
            },
          },
        }}
      >
        {hasLinks && (
          <List disablePadding sx={{ p: "4px" }}>
            {links.map((link) => (
              <ListItemButton
                key={link.label}
                component={link.href ? "a" : "div"}
                href={link.href}
                onClick={() => {
                  link.onClick?.();
                  close();
                }}
                sx={itemSx}
              >
                {link.label}
              </ListItemButton>
            ))}
          </List>
        )}

        {hasOrgs && (
          <>
            {hasLinks && <Divider color="subtle" />}
            <Box sx={{ p: "8px" }}>
              <Typography
                sx={{
                  px: "8px",
                  pb: "4px",
                  fontSize: 12,
                  lineHeight: "16px",
                  color: "var(--ds-text-tertiary)",
                }}
              >
                Organizations
              </Typography>
              <List disablePadding>
                {organizations.map((org) => {
                  const selected = org === organization;
                  return (
                    <ListItemButton
                      key={org}
                      onClick={() => {
                        onOrganizationChange?.(org);
                        close();
                      }}
                      sx={{
                        ...itemSx,
                        ...(selected && {
                          bgcolor: "var(--ds-primary-bg)",
                          color: "var(--ds-primary-text)",
                          "&:hover": { bgcolor: "var(--ds-primary-bg)" },
                        }),
                      }}
                    >
                      {org}
                    </ListItemButton>
                  );
                })}
              </List>
              {onViewAll && (
                <Link
                  component="button"
                  underline="hover"
                  onClick={() => {
                    onViewAll();
                    close();
                  }}
                  sx={{
                    px: "8px",
                    pt: "4px",
                    fontSize: 14,
                    lineHeight: "20px",
                  }}
                >
                  View All
                </Link>
              )}
            </Box>
          </>
        )}

        {hasFooter && (
          <>
            {(hasLinks || hasOrgs) && <Divider color="subtle" />}
            <List disablePadding sx={{ p: "4px" }}>
              {onEditProfile && (
                <ListItemButton
                  onClick={() => {
                    onEditProfile();
                    close();
                  }}
                  sx={{ ...itemSx, gap: "8px" }}
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    fontSize={14}
                    color="var(--ds-text-tertiary)"
                  />
                  Edit Profile
                </ListItemButton>
              )}
              {onSignOut && (
                <ListItemButton
                  onClick={() => {
                    onSignOut();
                    close();
                  }}
                  sx={{ ...itemSx, gap: "8px" }}
                >
                  <FontAwesomeIcon
                    icon={faArrowRightFromBracket}
                    fontSize={14}
                    color="var(--ds-text-tertiary)"
                  />
                  Sign Out
                </ListItemButton>
              )}
            </List>
          </>
        )}
      </Popover>
    </>
  );
}

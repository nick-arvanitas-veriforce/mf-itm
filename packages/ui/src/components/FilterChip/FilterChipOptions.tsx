import { useLayoutEffect, useRef, useState } from "react";
import { faChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ACTIVE_BG, ACTIVE_BG_HOVER, CHIP_TEXT, IDLE_BG_HOVER } from "./shared";

const MAX_SHOWN = 1;

/* ------------------------------------------------------------------ */
/* SELECT / MULTISELECT — an Autocomplete restyled as a chip.           */
/*  - Click to open; type to filter; Enter selects the highlighted      */
/*    option. Multi keeps the dropdown open with checkbox options;      */
/*    single closes on pick.                                            */
/*  - While open, the value moves into the input's placeholder so       */
/*    typing visually replaces it; a hidden mirror of the text drives   */
/*    the input min-width so the chip resizes with the selection.       */
/* ------------------------------------------------------------------ */

interface FilterChipOptionsProps {
  label: string;
  options: string[];
  multiple: boolean;
  value: string[] | string | null;
  onChange: (value: string[] | string | null) => void;
}

export function FilterChipOptions({
  label,
  options,
  multiple,
  value,
  onChange,
}: Readonly<FilterChipOptionsProps>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [lockedWidth, setLockedWidth] = useState<number | null>(null);
  const [valueTextWidth, setValueTextWidth] = useState<number | null>(null);

  const selected = multiple
    ? (value as string[])
    : value
      ? [value as string]
      : [];
  const hasSelection = selected.length > 0;

  const display = hasSelection
    ? multiple
      ? selected.slice(0, MAX_SHOWN).join(", ") +
        (selected.length > MAX_SHOWN ? ` +${selected.length - MAX_SHOWN}` : "")
      : selected[0]
    : null;

  useLayoutEffect(() => {
    setValueTextWidth(measureRef.current?.offsetWidth ?? null);
  }, [display, open]);

  // Lock the chip's pre-open width as a floor so it never collapses into
  // a stub around the bare search input.
  const handleOpen = () => {
    setLockedWidth(rootRef.current?.getBoundingClientRect().width ?? null);
    setOpen(true);
  };

  const clear = () => {
    onChange(multiple ? [] : null);
    setInputValue("");
    setOpen(false);
    setTimeout(() => rootRef.current?.querySelector("input")?.blur(), 0);
  };

  return (
    <Autocomplete<string, boolean, false, false>
      ref={rootRef}
      multiple={multiple}
      disableCloseOnSelect={multiple}
      autoHighlight
      open={open}
      onOpen={handleOpen}
      onClose={() => {
        setOpen(false);
        setInputValue("");
      }}
      inputValue={inputValue}
      onInputChange={(_e, next) => setInputValue(next)}
      options={options}
      value={multiple ? selected : ((value as string | null) ?? null)}
      onChange={(_e, next) => onChange(next)}
      // The "Label: Value" adornment stands in for tags inside the chip
      renderValue={() => null}
      popupIcon={
        <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 12 }} />
      }
      clearIcon={<FontAwesomeIcon icon={faXmark} style={{ fontSize: 12 }} />}
      forcePopupIcon
      renderOption={(props, option, { selected: isSelected }) => {
        const { key, ...rest } = props as { key: string } & typeof props;
        return (
          <li key={key} {...rest}>
            {multiple && <Checkbox checked={isSelected} />}
            {option}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          size="small"
          // While open, the search's placeholder is the current value so
          // typing visually replaces it; on an empty chip it's the label.
          placeholder={open ? (display ?? label) : undefined}
          // Reopen on click even when the input already has focus. Ignore
          // clicks on the end adornment so the clear X doesn't reopen it.
          onClick={(e) => {
            if (
              (e.target as HTMLElement).closest(".MuiAutocomplete-endAdornment")
            )
              return;
            if (!open) handleOpen();
          }}
          slotProps={{
            input: {
              // MUI v9 moved these off params.InputProps onto params.slotProps.
              ...params.slotProps.input,
              // "Label" (+ ": Value" when selected) lives in the adornment.
              // Only the open-and-empty chip drops it (the label becomes
              // the search placeholder instead).
              startAdornment: (!open || hasSelection) && (
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      ...CHIP_TEXT,
                      fontWeight: hasSelection ? 500 : 400,
                      color: hasSelection ? "primary.main" : undefined,
                    }}
                  >
                    {label}
                    {hasSelection && ":"}
                  </Typography>
                  {/* Closed: the value is real chip text. Open: it moves
                      into the input's placeholder, so only the hidden
                      measurer remains here. */}
                  {display && !open && (
                    <Typography
                      component="span"
                      sx={{ ...CHIP_TEXT, ml: 0.5, color: "primary.main" }}
                    >
                      {display}
                    </Typography>
                  )}
                  {display && (
                    <Box
                      component="span"
                      ref={measureRef}
                      aria-hidden
                      sx={{
                        position: "absolute",
                        visibility: "hidden",
                        whiteSpace: "pre",
                        ...CHIP_TEXT,
                      }}
                    >
                      {display}
                    </Box>
                  )}
                </Box>
              ),
            },
            htmlInput: {
              ...params.slotProps.htmlInput,
              "aria-label": `${label} filter`,
            },
          }}
        />
      )}
      slotProps={{
        // Chip is narrow; give the dropdown its own sane width and pin it
        // to the chip's bottom-left corner
        paper: { sx: { minWidth: 220 } },
        popper: { style: { width: "auto" }, placement: "bottom-start" },
        // The X clears the selection AND closes/unfocuses the chip
        // (replaces MUI's default clear, which keeps focus and stays open)
        clearIndicator: { onClick: clear },
      }}
      sx={{
        display: "inline-flex",
        width: "auto",
        // While open, the pre-open width is a floor, not a lock: the chip
        // can grow as selections are checked but never collapses into a
        // stub around the bare search input.
        minWidth: open && lockedWidth ? `${lockedWidth}px` : undefined,

        // Chip shell: 20px line-height + 4px vertical padding = 28px,
        // matching chip small.
        "& .MuiOutlinedInput-root": {
          borderRadius: "999px",
          height: "28px",
          // Right side reserves 10px padding + 16px icon + 4px gap to text
          padding: "4px 30px 4px 12px !important",
          cursor: "pointer",
          width: "100%",
          overflow: "hidden",
          flexWrap: "nowrap",
          // The theme's 4px inputRoot gap also applies before the collapsed
          // zero-width input, padding the text→icon gap to 8px. Zero it;
          // the input carries its own margin when it's actually in use.
          gap: 0,
          backgroundColor: hasSelection ? ACTIVE_BG : "transparent",
          transition: "background-color 120ms",
          "&:hover": {
            backgroundColor: hasSelection ? ACTIVE_BG_HOVER : IDLE_BG_HOVER,
          },
        },
        // Active chip is borderless — the --ds-primary-bg fill carries the
        // state. Covers rest, hover, and focus (MUI's focused outline would
        // otherwise paint a 2px primary border).
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: hasSelection ? "transparent" : "divider",
        },
        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: hasSelection ? "transparent" : "text.secondary",
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          hasSelection
            ? { borderColor: "transparent", borderWidth: "1px" }
            : undefined,

        // Collapse the input while closed; when open it flex-grows to
        // accept search text.
        "& .MuiAutocomplete-input": {
          ...CHIP_TEXT,
          height: "20px",
          padding: "0 !important",
          width: open ? undefined : "0 !important",
          // While open with a selection, the input must be at least as wide
          // as its placeholder (the measured value text) so the chip
          // resizes with the selection; +2px keeps the last glyph clear.
          minWidth: open
            ? hasSelection && valueTextWidth
              ? `${valueTextWidth + 2}px !important`
              : undefined
            : "0 !important",
          cursor: open ? "text" : "pointer",
          // Replaces the zeroed inputRoot gap: space between "Label:" and
          // the search text, only when the input is visible after it
          marginLeft: open && hasSelection ? "4px" : 0,
          // Match the value-as-placeholder adornment styling
          "&::placeholder": {
            color: "var(--ds-text-secondary)",
            opacity: 1,
          },
        },

        // Swap the chevron for the clear X when there's a selection.
        // Both indicators are 16x16 buttons with 12px glyphs; the svg
        // rule overrides the IconButton theme's forced 24px md icon size.
        "& .MuiAutocomplete-popupIndicator": {
          display: hasSelection ? "none" : "inline-flex",
          width: "16px",
          height: "16px",
          padding: 0,
          marginRight: 0,
          "& svg:not(.MuiSvgIcon-root)": {
            fontSize: "12px",
            width: "auto",
            height: "1em",
          },
        },
        "& .MuiAutocomplete-clearIndicator": {
          visibility: hasSelection ? "visible" : "hidden",
          width: "16px",
          height: "16px",
          padding: 0,
          marginRight: 0,
          color: "primary.main",
          "& svg:not(.MuiSvgIcon-root)": {
            fontSize: "12px",
            width: "auto",
            height: "1em",
          },
        },
        "& .MuiAutocomplete-inputRoot .MuiAutocomplete-endAdornment": {
          right: "10px",
        },
      }}
    />
  );
}

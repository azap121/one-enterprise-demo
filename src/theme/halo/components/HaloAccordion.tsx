/**
 * HaloAccordion / HaloAccordionGroup
 *
 * Halo-spec wrappers around MUI Accordion.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Accordion> (node 7270:41460)
 * Tokens (refreshed May 2026):
 *   width:              600px (default; use fullWidth for fluid)
 *   border collapsed:   1px solid secondary/_states/outlinedBorder = alpha(secondary.main, 0.3)
 *   border expanded:    1px solid primary/_states/outlinedBorder = alpha(primary.dark, 0.5)
 *   border-radius:      shape.borderRadius (8px)
 *   summary padding:    px 16px py 12px
 *   heading:            subtitle1, fontWeightMedium (500), text/primary, flex: 1
 *   subtitle:           subtitle2, fontWeightMedium (500), text/secondary — inline right, px 8px
 *   left icon:          optional slot, pr 8px, text/secondary, fontSize 16px
 *   expand icon:        faAngleDown, 14px, text/secondary (rotates on expand)
 *   details:            pb 16px pt 8px px 16px, typography/body2, text/secondary
 *
 * Variant props (mirrors Figma component booleans):
 *   showIcon      — show/hide left icon slot independently of icon content
 *   showSubtitle  — show/hide inline subtitle independently of subtitle content
 *
 * Usage:
 *   // Basic
 *   <HaloAccordion title="Deal overview">
 *     <Typography>Content here.</Typography>
 *   </HaloAccordion>
 *
 *   // With left icon
 *   <HaloAccordion
 *     title="Documents"
 *     icon={<FontAwesomeIcon icon={faFileLines} />}
 *   >
 *     <Typography>847 files across 12 workstreams.</Typography>
 *   </HaloAccordion>
 *
 *   // With inline subtitle (right of heading)
 *   <HaloAccordion title="Due Diligence" subtitle="72% complete">
 *     <Typography>3 workstreams pending review.</Typography>
 *   </HaloAccordion>
 *
 *   // Icon + subtitle, both slots explicit via booleans
 *   <HaloAccordion
 *     title="Financials"
 *     icon={<FontAwesomeIcon icon={faChartLine} />}
 *     showIcon
 *     subtitle="Committed"
 *     showSubtitle
 *   >
 *     <Typography>$1.6B senior debt.</Typography>
 *   </HaloAccordion>
 *
 *   // Reserve icon slot space without an icon (useful for alignment in groups)
 *   <HaloAccordion title="Section" showIcon>
 *     <Typography>Content.</Typography>
 *   </HaloAccordion>
 *
 *   // Controlled
 *   <HaloAccordion title="Financial details" expanded={open} onChange={setOpen}>
 *     <Typography>Details…</Typography>
 *   </HaloAccordion>
 *
 *   // Group — one open at a time
 *   <HaloAccordionGroup
 *     items={[
 *       { title: 'Section 1', children: <Typography>…</Typography> },
 *       { title: 'Section 2', children: <Typography>…</Typography> },
 *     ]}
 *   />
 */
import { faAngleDown } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Accordion,
  type AccordionProps,
  AccordionDetails,
  AccordionSummary,
  Box,
  type SxProps,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';

export interface HaloAccordionProps extends Omit<AccordionProps, 'onChange' | 'title' | 'children'> {
  title: React.ReactNode;
  /**
   * Inline subtitle shown to the right of the heading.
   * Visible when showSubtitle is true (defaults to !!subtitle).
   */
  subtitle?: React.ReactNode;
  /**
   * Explicitly show or hide the subtitle slot.
   * Defaults to true when subtitle is provided.
   * Set to false to suppress even when subtitle content exists.
   */
  showSubtitle?: boolean;
  /**
   * Content for the left icon slot.
   * Visible when showIcon is true (defaults to !!icon).
   */
  icon?: React.ReactNode;
  /**
   * Explicitly show or hide the left icon slot.
   * Defaults to true when icon is provided.
   * Set to true with no icon to reserve the slot space for alignment.
   * Set to false to hide even when icon content exists.
   */
  showIcon?: boolean;
  onChange?: (expanded: boolean) => void;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function HaloAccordion({
  title,
  subtitle,
  showSubtitle,
  icon,
  showIcon,
  onChange,
  fullWidth = false,
  children,
  sx,
  ...props
}: HaloAccordionProps) {
  const hasIcon = showIcon ?? !!icon;
  const hasSubtitle = showSubtitle ?? !!subtitle;

  return (
    <Accordion
      disableGutters
      elevation={0}
      onChange={onChange ? (_, expanded) => onChange(expanded) : undefined}
      sx={[
        (theme) => ({
          width: fullWidth ? '100%' : 600,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: alpha(theme.palette.secondary.main, 0.3),
          borderRadius: `${theme.shape.borderRadius}px !important`,
          '&.Mui-expanded': {
            // primary/_states/outlinedBorder
            borderColor: alpha(theme.palette.primary.dark, 0.5),
          },
          '&::before': { display: 'none' },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      <AccordionSummary
        expandIcon={
          <FontAwesomeIcon icon={faAngleDown} style={{ fontSize: 14, color: 'inherit' }} />
        }
        sx={{
          px: 2,
          py: 0,
          minHeight: 48,
          '&.Mui-expanded': { minHeight: 48 },
          // Explicitly set row layout — MUI's default is row but overriding
          // ensures our flex: 1 on the heading title works correctly.
          '& .MuiAccordionSummary-content': {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            my: '12px',
            gap: 0,
            minWidth: 0,
          },
          '& .MuiAccordionSummary-expandIconWrapper': {
            color: 'text.secondary',
            flexShrink: 0,
          },
        }}
      >
        {/* Left icon slot — pr matches Figma's pr-[8px] on Left Slot container */}
        {hasIcon && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              pr: 1,
              color: 'text.secondary',
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            {icon}
          </Box>
        )}

        {/* Heading — typography/subtitle1 token via variant; color via text/primary token */}
        <Typography
          variant="subtitle1"
          color="text.primary"
          sx={{
            flex: '1 0 0',
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </Typography>

        {/* Inline subtitle — typography/subtitle2 token via variant; color via text/secondary token */}
        {hasSubtitle && (
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ px: 1, flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            {subtitle}
          </Typography>
        )}
      </AccordionSummary>

      <AccordionDetails
        sx={(theme) => ({
          px: 2,
          pt: 1,
          pb: 2,
          fontFamily: theme.typography.fontFamily,
          fontWeight: theme.typography.fontWeightLight,
          fontSize: theme.typography.body2.fontSize,
          color: theme.palette.text.secondary,
        })}
      >
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

// ── HaloAccordionGroup ────────────────────────────────────────────────────────

export interface HaloAccordionGroupItem {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  showSubtitle?: boolean;
  icon?: React.ReactNode;
  showIcon?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}

export interface HaloAccordionGroupProps {
  items: HaloAccordionGroupItem[];
  /** Allow multiple panels open simultaneously — default false (exclusive) */
  multiple?: boolean;
  fullWidth?: boolean;
  sx?: SxProps;
}

export function HaloAccordionGroup({ items, multiple = false, fullWidth = false, sx }: HaloAccordionGroupProps) {
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [expandedSet, setExpandedSet] = React.useState<Set<string>>(new Set());

  const handleChange = (panel: string) => (isExpanded: boolean) => {
    if (multiple) {
      setExpandedSet((prev) => {
        const next = new Set(prev);
        if (isExpanded) next.add(panel); else next.delete(panel);
        return next;
      });
    } else {
      setExpanded(isExpanded ? panel : false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...(sx as React.CSSProperties) }}>
      {items.map((item, i) => {
        const panel = `panel-${i}`;
        const isExpanded = multiple ? expandedSet.has(panel) : expanded === panel;
        return (
          <HaloAccordion
            key={i}
            title={item.title}
            subtitle={item.subtitle}
            showSubtitle={item.showSubtitle}
            icon={item.icon}
            showIcon={item.showIcon}
            disabled={item.disabled}
            expanded={isExpanded}
            onChange={handleChange(panel)}
            fullWidth={fullWidth}
          >
            {item.children}
          </HaloAccordion>
        );
      })}
    </div>
  );
}

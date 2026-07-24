/**
 * HaloLeftDrawerTree
 *
 * Left-drawer tree panel used by Search and Documents tabs (Index + Sandbox).
 * Composes HaloTree + HaloTreeItem inside a sectioned container with a
 * collapsible ListSubheader row.
 *
 * Visual reference: PROD MUI Library (Fo6hsjtXuJCH4XiwkhErC4 · branch I3UOUDpkOIyi3rto3ZY1E7)
 *   index variant:    25895:9169
 *   sandbox variant:  26006:45805
 * HALO Design System library has no dedicated LeftDrawerTree — same inheritance
 * pattern as HaloTree and HaloDialog (PROD MUI canonical, Halo tokens applied).
 *
 * Tokens (from get_variable_defs, May 2026):
 *   container width:  260px
 *   container radius: 8px (borderRadiusM)
 *   container pad:    px:8 py:4
 *   index bg:         background.defaultAlt (paper/alt #FAFAF7 light / moondust[900] dark)
 *   sandbox bg:       background.sandbox (NEW — alpha(amber[500], 0.1) = #FF8818 @ 10%)
 *                     Pitched to Halo Team (Irene + Annie) — matches Figma `background/sandbox` variable
 *   subheader text:   text.secondary (#6A6A69 light)
 *   subheader font:   Figtree, 14px, weight 500, lh 1.57, letter-spacing 0.1px
 *                     (Figma uses TT Hoves; Halo wrappers swap to Figtree per convention)
 *
 * Subheader chevron toggles the tree body. Optional ellipsis-vertical action
 * (Index variant only by default; Sandbox suppresses unless caller passes onMenuClick).
 *
 * Folder-only surface — render HaloTreeItem folders, never files.
 * Files belong in the main grid/table to the right of the drawer.
 * Selection emits the folder id; builders wire it to the right-side
 * folder path / contents display.
 *
 * Usage:
 *   <HaloLeftDrawerTree variant="index" onMenuClick={() => {}}>
 *     <HaloTreeItem
 *       label="Fileroom"
 *       icon={<FontAwesomeIcon icon={faBoxArchive} />}
 *       defaultExpanded
 *     >
 *       <HaloTreeItem
 *         label="01 Financials"
 *         icon={<FontAwesomeIcon icon={faFolder} />}
 *         iconOpen={<FontAwesomeIcon icon={faFolderOpen} />}
 *       >
 *         <HaloTreeItem label="FY2025.xlsx" isLeaf />
 *       </HaloTreeItem>
 *     </HaloTreeItem>
 *   </HaloLeftDrawerTree>
 *
 *   // Sandbox variant (no menu by default):
 *   <HaloLeftDrawerTree variant="sandbox">
 *     <HaloTreeItem label="Staging Folder" icon={<FontAwesomeIcon icon={faBoxArchive} />} defaultExpanded>
 *       ...
 *     </HaloTreeItem>
 *   </HaloLeftDrawerTree>
 */
import { faAngleDown, faAngleRight, faEllipsisVertical } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Collapse, Typography } from '@mui/material';
import React, { useState } from 'react';
import { HaloIconButton } from './HaloIconButton';
import { HaloTooltip } from './HaloTooltip';
import { HaloTree } from './HaloTree';

export type HaloLeftDrawerTreeVariant = 'index' | 'sandbox';

export interface HaloLeftDrawerTreeProps {
  /** Drives container bg + default subheader label/menu */
  variant: HaloLeftDrawerTreeVariant;
  /** Override subheader label. Default = capitalised variant ("Index" | "Sandbox"). */
  title?: string;
  /**
   * Subheader label click — navigate to the root view. When provided, the label
   * becomes its own click target separate from the chevron toggle. Typically
   * supplied for variant="index" so the user can jump to root-level docs without
   * collapsing the tree.
   */
  onLabelClick?: () => void;
  /**
   * Subheader ellipsis-vertical action handler. When omitted, Sandbox hides the menu;
   * Index still shows it as a no-op (matches Figma — menu is intrinsic to Index header).
   */
  onMenuClick?: () => void;
  /** Subheader chevron starts collapsed (tree body hidden) */
  defaultCollapsed?: boolean;
  /** Controlled selected tree item id. Forwarded to inner HaloTree. */
  selectedId?: string;
  /** Uncontrolled initial selection. Forwarded to inner HaloTree. Ignored when `selectedId` is set. */
  defaultSelectedId?: string;
  /** Selection callback — fires when a tree item with `id` is clicked. */
  onSelect?: (id: string) => void;
  /** HaloTreeItem subtree */
  children: React.ReactNode;
  sx?: object;
}

const VARIANT_DEFAULTS: Record<HaloLeftDrawerTreeVariant, { title: string; bg: string; menuByDefault: boolean }> = {
  index: { title: 'Index', bg: 'background.defaultAlt', menuByDefault: true },
  sandbox: { title: 'Sandbox', bg: 'background.sandbox', menuByDefault: false },
};

export function HaloLeftDrawerTree({
  variant,
  title,
  onLabelClick,
  onMenuClick,
  defaultCollapsed = false,
  selectedId,
  defaultSelectedId,
  onSelect,
  children,
  sx,
}: HaloLeftDrawerTreeProps) {
  const [open, setOpen] = useState(!defaultCollapsed);
  const v = VARIANT_DEFAULTS[variant];
  const label = title ?? v.title;
  const showMenu = v.menuByDefault || !!onMenuClick;
  const labelClickable = !!onLabelClick;
  const toggle = () => setOpen((o) => !o);

  return (
    <Box
      role="navigation"
      aria-label={`${label} folder navigation`}
      sx={{
        width: 260,
        bgcolor: v.bg,
        borderRadius: '8px',
        // Figma container: px:8 py:4 → MUI px:1 py:0.5
        px: 1,
        py: 0.5,
        ...sx,
      }}>
      {/* Subheader row.
          When onLabelClick is provided (Index pattern), the chevron and label are
          independent click targets — chevron toggles, label navigates to root.
          Otherwise the whole row toggles (Sandbox pattern). */}
      <Box
        onClick={labelClickable ? undefined : toggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          // Subheader sits flush with tree rows below; matches Figma 32px row height
          minHeight: 32,
          py: '4px',
          cursor: labelClickable ? 'default' : 'pointer',
          userSelect: 'none',
        }}>
        {/* Chevron — outer 28px box mirrors HaloTreeItem leftSlot for column alignment.
            Inner 20×20 hit/hover target matches HaloIconButton size="small" (theme.ts
            MuiIconButton.sizeSmall: height 20, radius 4). */}
        <Box
          sx={{
            width: 28,
            height: 20,
            mr: 1,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Box
            onClick={labelClickable ? (e) => { e.stopPropagation(); toggle(); } : undefined}
            aria-label={open ? 'Collapse' : 'Expand'}
            role={labelClickable ? 'button' : undefined}
            sx={{
              width: 20,
              height: 20,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              fontSize: 12,
              cursor: 'pointer',
              // Chevron hover bg shown in both variants for consistent click affordance
              // (Sandbox: whole row toggles, but the chevron still telegraphs the action visually).
              '&:hover': { bgcolor: 'action.hover' },
            }}>
            <FontAwesomeIcon icon={open ? faAngleDown : faAngleRight} />
          </Box>
        </Box>

        {/* Label — Figtree Medium 14/1.57/0.1px per Figma list/subheader token.
            When onLabelClick set, label is its own click target (root view nav). */}
        <Typography
          onClick={labelClickable ? (e) => { e.stopPropagation(); onLabelClick?.(); } : undefined}
          role={labelClickable ? 'button' : undefined}
          sx={{
            flex: 1,
            fontFamily: 'Figtree, system-ui, sans-serif',
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.57,
            letterSpacing: '0.1px',
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: labelClickable ? 'pointer' : 'inherit',
            borderRadius: '4px',
            px: labelClickable ? 0.5 : 0,
            mx: labelClickable ? -0.5 : 0,
            '&:hover': labelClickable ? { bgcolor: 'action.hover' } : undefined,
          }}>
          {label}
        </Typography>

        {/* Optional ellipsis menu — Index shows by default; Sandbox only if onMenuClick provided */}
        {showMenu && (
          <Box onClick={(e) => e.stopPropagation()} sx={{ flexShrink: 0, ml: 0.5 }}>
            <HaloTooltip title="More actions">
              <HaloIconButton
                size="small"
                aria-label="More actions"
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuClick?.();
                }}>
                <FontAwesomeIcon icon={faEllipsisVertical} style={{ fontSize: 14 }} />
              </HaloIconButton>
            </HaloTooltip>
          </Box>
        )}
      </Box>

      {/* Tree body */}
      <Collapse in={open} unmountOnExit>
        <HaloTree selectedId={selectedId} defaultSelectedId={defaultSelectedId} onSelect={onSelect}>
          {children}
        </HaloTree>
      </Collapse>
    </Box>
  );
}

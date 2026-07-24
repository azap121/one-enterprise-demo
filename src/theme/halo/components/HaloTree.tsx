/**
 * HaloTree / HaloTreeItem
 *
 * Expandable file/folder tree. No HALO Design System Tree exists; Halo inherits
 * MUI defaults with Halo tokens (Figtree, action.* states).
 *
 * Visual reference: PROD MUI Library (Fo6hsjtXuJCH4XiwkhErC4) —
 *   tree item:        24154:39224
 *   tree_fileroom:    24154:48854
 *   index example:    25895:9169
 *   sandbox example:  26006:45805
 *
 * Tokens (from get_design_context, April 2026):
 *   text:            text.primary (Halo)
 *   hover bg:        action.hover
 *   selected bg:     action.selected
 *   focused bg:      action.focus
 *   disabled text:   text.disabled
 *   row padding:     pl:8 pr:4 py:4 (inside row bg)
 *   border-radius:   8px
 *   indent per level: [14, 22, 36, 50, 64, 78]px — pixel-perfect to Figma,
 *                     off-grid vs Halo 8px scale (flagged for PR review)
 *   text:            14px / 400 / 1.43 / 0.17px letter-spacing
 *
 * Hover / selection behaviour:
 *   - Row hover and selection only change bg + text — never the icon by itself.
 *   - `iconOpen` shown when `expanded === true`; `icon` shown otherwise.
 *   - When `icon` is provided AND the row has expandable children, hovering the
 *     row swaps the folder icon for faAngleRight / faAngleDown matching
 *     `expanded`. Leaf rows and rows without children never swap.
 *
 * Actions slot (right):
 *   Pass any IconButton(s) via `actions`. Visible on row hover only —
 *   selection alone does not reveal actions.
 *
 * Usage:
 *   <HaloTree>
 *     <HaloTreeItem
 *       label="Financials"
 *       icon={<FontAwesomeIcon icon={faFolder} />}
 *       iconOpen={<FontAwesomeIcon icon={faFolderOpen} />}
 *       actions={
 *         <>
 *           <IconButton size="small"><FontAwesomeIcon icon={faMagnifyingGlass} /></IconButton>
 *           <IconButton size="small"><FontAwesomeIcon icon={faEllipsisVertical} /></IconButton>
 *         </>
 *       }
 *     >
 *       <HaloTreeItem label="FY2025.xlsx" isLeaf />
 *     </HaloTreeItem>
 *   </HaloTree>
 */
import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faAngleDown, faAngleRight } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Collapse, Typography } from '@mui/material';
import React, { useState } from 'react';
import { HaloIconButton } from './HaloIconButton';
import { HaloTooltip } from './HaloTooltip';

// Indent per depth — sourced verbatim from Figma node 24154:48854.
// Off-grid vs Halo 8px spacing scale (only L4=64 snaps); shipping pixel-perfect
// per design call, flagged for follow-up with Halo Team.
const INDENT_PX = [14, 22, 36, 50, 64, 78] as const;

const HaloTreeLevelContext = React.createContext(0);

// ── Selection (single-select) ─────────────────────────────────────────────────
// Tree owns `selectedId`. HaloTreeItem with matching `id` paints selected bg.
// Items without `id` are not addressable via context — they fall back to the
// explicit `selected` prop for static demos.
//
// Click model when an item has `id` AND tree has `onSelect`:
//   - chevron click → toggle expand only (never selects)
//   - row click     → calls onSelect(id) (never toggles expand)
// Selection persists through collapse/expand. No keyboard nav in V1.

interface HaloTreeSelectionCtx {
  selectedId?: string;
  onSelect?: (id: string) => void;
}
const HaloTreeSelectionContext = React.createContext<HaloTreeSelectionCtx>({});

// ── HaloTree (container) ──────────────────────────────────────────────────────

export interface HaloTreeProps {
  children: React.ReactNode;
  sx?: object;
  /** Controlled selected item id. Pair with `onSelect`. */
  selectedId?: string;
  /** Uncontrolled initial selection. Ignored when `selectedId` is set. */
  defaultSelectedId?: string;
  /** Called with the clicked item's id. Receives selection events from descendants. */
  onSelect?: (id: string) => void;
}

export function HaloTree({ children, sx, selectedId, defaultSelectedId, onSelect }: HaloTreeProps) {
  const isControlled = selectedId !== undefined;
  const [internalSel, setInternalSel] = useState<string | undefined>(defaultSelectedId);
  const currentSel = isControlled ? selectedId : internalSel;

  const handleSelect = React.useCallback(
    (id: string) => {
      if (!isControlled) setInternalSel(id);
      onSelect?.(id);
    },
    [isControlled, onSelect],
  );

  const ctx = React.useMemo<HaloTreeSelectionCtx>(
    () => ({ selectedId: currentSel, onSelect: handleSelect }),
    [currentSel, handleSelect],
  );

  return (
    <HaloTreeSelectionContext.Provider value={ctx}>
      <Box component="ul" role="tree" sx={{ listStyle: 'none', m: 0, p: 0, ...sx }}>
        <HaloTreeLevelContext.Provider value={0}>{children}</HaloTreeLevelContext.Provider>
      </Box>
    </HaloTreeSelectionContext.Provider>
  );
}

// ── HaloTreeItem ──────────────────────────────────────────────────────────────

export interface HaloTreeItemProps {
  label: string;
  /**
   * Stable identifier for selection. When set AND the parent HaloTree has `onSelect`,
   * row click calls onSelect(id) and chevron click toggles expand independently.
   * Without `id`, the row keeps legacy behaviour (whole row toggles expand).
   */
  id?: string;
  /** Leaf node — hides chevron, no expand/collapse */
  isLeaf?: boolean;
  /** Start expanded */
  defaultExpanded?: boolean;
  /** Highlight this row with selected background. Overridden by tree-level selection when `id` is set. */
  selected?: boolean;
  /** Dim text and disable interaction */
  disabled?: boolean;
  /** Optional icon in the left slot (replaces chevron area for leaf nodes) */
  icon?: React.ReactNode;
  /** Optional icon shown when `expanded === true` (e.g. faFolderOpen). Falls back to `icon`. */
  iconOpen?: React.ReactNode;
  /**
   * Right-slot inline actions. Visible on row hover only — selection alone does not reveal actions.
   * Each entry renders as `HaloTooltip → HaloIconButton size="small" → FontAwesomeIcon` (14px, FA Pro Light).
   * onClick stops propagation so clicking an action never toggles row expand/collapse.
   */
  actions?: HaloTreeAction[];
  children?: React.ReactNode;
}

export interface HaloTreeAction {
  /** Tooltip text + aria-label (required). */
  label: string;
  icon: IconDefinition;
  onClick?: () => void;
}

export function HaloTreeItem({
  label,
  id,
  isLeaf = false,
  defaultExpanded = false,
  selected: selectedProp = false,
  disabled = false,
  icon,
  iconOpen,
  actions,
  children,
}: HaloTreeItemProps) {
  const [open, setOpen] = useState(defaultExpanded);
  const level = React.useContext(HaloTreeLevelContext);
  const sel = React.useContext(HaloTreeSelectionContext);
  const indent = INDENT_PX[Math.min(level, INDENT_PX.length - 1)];

  const hasChildren = React.Children.count(children) > 0;
  const expandable = !isLeaf && hasChildren;
  const showIconHoverSwap = !!icon && expandable && !disabled;

  // Selection mode: addressable via id + tree has onSelect handler.
  // In selection mode: chevron toggles, row selects.
  // In legacy mode: row toggles (current behaviour preserved for static demos).
  const selectable = !!id && !!sel.onSelect;
  const selected = selectable ? sel.selectedId === id : selectedProp;

  const handleRowClick = () => {
    if (disabled) return;
    if (selectable) {
      sel.onSelect?.(id!);
    } else if (expandable) {
      setOpen((v) => !v);
    }
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    if (disabled || !expandable) return;
    e.stopPropagation();
    setOpen((v) => !v);
  };

  const rowBg = selected ? 'action.selected' : 'transparent';
  const rowClickable = !disabled && (selectable || expandable);

  return (
    <Box
      component="li"
      role="treeitem"
      aria-expanded={expandable ? open : undefined}
      aria-selected={selectable ? selected : undefined}
      aria-disabled={disabled}
      sx={{ listStyle: 'none' }}>
      {/* Row */}
      <Box
        onClick={handleRowClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          // Full-width row: bg paints corner-to-corner, indent shifts content only.
          // Figma indent array [14, 22, 36, 50, 64, 78] = distance from container
          // left to icon column. No internal pl needed — indent already covers leading whitespace.
          pl: `${indent}px`,
          pr: 1, // 8px — actions sit 8px from container right edge
          py: '4px',
          borderRadius: '8px',
          bgcolor: rowBg,
          cursor: rowClickable ? 'pointer' : 'default',
          userSelect: 'none',
          '&:hover': {
            bgcolor: disabled ? rowBg : selected ? 'action.focus' : 'action.hover',
          },
          // Actions: hover-only visibility
          ...(actions && actions.length > 0 && {
            '&:hover .halo-tree-actions': { display: 'flex' },
          }),
          // Icon hover-swap: folder → angle, only for rows with custom icon AND expandable children
          ...(showIconHoverSwap && {
            '&:hover .halo-tree-folder-icon': { display: 'none' },
            '&:hover .halo-tree-hover-angle': { display: 'flex' },
          }),
        }}>
        {/* Left slot — symmetric 28px box. 8px gap to label is `mr` (external),
            so folder icon and hover-swap angle center on the SAME pixel column. */}
        <Box
          sx={{
            width: 28,
            height: 20,
            mr: 1, // 8px external gap
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
          {icon ? (
            <>
              {/* Default folder icon — swaps to iconOpen when expanded */}
              <Box
                className="halo-tree-folder-icon"
                sx={{
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: disabled ? 'text.disabled' : 'text.primary',
                }}>
                {open && iconOpen ? iconOpen : icon}
              </Box>
              {/* Hover angle — rendered only when expandable, hidden by default, shown on row hover.
                  Inner 20×20 + radius 4 hover bg matches HaloIconButton size="small" target —
                  consistent click-affordance for chevron-specific hover. */}
              {showIconHoverSwap && (
                <Box
                  className="halo-tree-hover-angle"
                  onClick={handleChevronClick}
                  sx={{
                    width: 20,
                    height: 20,
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.primary',
                    fontSize: 12,
                    position: 'absolute',
                    inset: 0,
                    margin: 'auto',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}>
                  <FontAwesomeIcon icon={open ? faAngleDown : faAngleRight} />
                </Box>
              )}
            </>
          ) : expandable ? (
            <Box
              onClick={handleChevronClick}
              sx={{
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: disabled ? 'text.disabled' : 'text.primary',
                fontSize: 12,
                borderRadius: '4px',
                cursor: disabled ? 'default' : 'pointer',
                '&:hover': disabled ? undefined : { bgcolor: 'action.selected' },
              }}>
              <FontAwesomeIcon icon={open ? faAngleDown : faAngleRight} />
            </Box>
          ) : (
            // Leaf with no icon — empty space preserves alignment
            <Box sx={{ width: 20, height: 20 }} />
          )}
        </Box>

        {/* Label */}
        <Box sx={{ flex: 1, pr: 1, py: '4px', minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: 'Figtree, system-ui, sans-serif',
              fontSize: '0.875rem',
              fontWeight: 400,
              lineHeight: 1.43,
              letterSpacing: '0.17px',
              color: disabled ? 'text.disabled' : 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
            {label}
          </Typography>
        </Box>

        {/* Right slot — actions, hover-only. Each action: HaloTooltip → HaloIconButton (size=small, 14px FA). */}
        {actions && actions.length > 0 && (
          <Box
            className="halo-tree-actions"
            onClick={(e) => e.stopPropagation()}
            sx={{
              display: 'none',
              alignItems: 'center',
              gap: 0.5,
              flexShrink: 0,
              ml: 0.5,
            }}>
            {actions.map((action, i) => (
              <HaloTooltip key={i} title={action.label}>
                <HaloIconButton
                  size="small"
                  aria-label={action.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick?.();
                  }}>
                  <FontAwesomeIcon icon={action.icon} style={{ fontSize: 14 }} />
                </HaloIconButton>
              </HaloTooltip>
            ))}
          </Box>
        )}
      </Box>

      {/* Children — render at level+1 via context; no cumulative pl on the <ul> */}
      {hasChildren && (
        <Collapse in={open} unmountOnExit>
          <Box component="ul" role="group" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            <HaloTreeLevelContext.Provider value={level + 1}>{children}</HaloTreeLevelContext.Provider>
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

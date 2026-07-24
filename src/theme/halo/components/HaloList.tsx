/**
 * HaloList / HaloListItem
 *
 * Halo-spec wrappers around MUI List and ListItem composition.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_List> (node 11033:145389)
 * Tokens:
 *   width:          260px (default, or fullWidth)
 *   border-radius:  8px (item)
 *   item padding:   px 8px py 4px, min-height 36px
 *   font:           Figtree 400, 14px
 *   secondary text: Figtree 400, 12px, text/secondary
 *   icon slot:      20px, action.active color
 *   states:         transparent / hover action.hover / selected action.selected / focused action.focus
 *
 * Usage:
 *   // Data-driven:
 *   <HaloList
 *     items={[
 *       { id: '1', label: 'Overview', icon: <FontAwesomeIcon icon={faHome} /> },
 *       { id: '2', label: 'Documents', icon: <FontAwesomeIcon icon={faFolder} />, count: 24 },
 *       { id: '3', label: 'Q&A', icon: <FontAwesomeIcon icon={faMessageLines} />, disabled: true },
 *     ]}
 *     selected="2"
 *     onSelect={(id) => setSelected(id)}
 *   />
 *
 *   // Composition (custom items):
 *   <HaloList>
 *     <HaloListItem
 *       label="Atlas Deal"
 *       icon={<FontAwesomeIcon icon={faFolder} />}
 *       selected
 *       onClick={() => navigate('/atlas')}
 *     />
 *     <HaloListItem label="Pending review" count={3} onClick={() => navigate('/review')} />
 *   </HaloList>
 */
import {
  Box,
  ButtonBase,
  Collapse,
  IconButton,
  List,
  type ListProps,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import React, { createContext, useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleDown,
  faAngleRight,
  faEllipsisVertical,
  faFolder,
  faFolderOpen,
} from '@fortawesome/pro-light-svg-icons';
import { HaloBadge } from './HaloBadge';

// Context: true when a HaloListItem renders inside a chevron-bearing parent
// (HaloListGroup or HaloListFolder). Text-only items in indented context
// align under iconed siblings via 36px left pad. Standalone items keep 8px.
const HaloListIndentContext = createContext(false);

// ── HaloListItem ─────────────────────────────────────────────────────────────

export interface HaloListItemProps {
  label: React.ReactNode;
  secondaryLabel?: React.ReactNode;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  count?: number;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function HaloListItem({
  label,
  secondaryLabel,
  icon,
  trailingIcon,
  count,
  selected,
  disabled,
  onClick,
}: HaloListItemProps) {
  const indented = useContext(HaloListIndentContext);
  return (
    <ListItemButton
      selected={selected}
      disabled={disabled}
      onClick={onClick}
      sx={{
        borderRadius: '8px',
        // Inside a chevron-bearing parent, align text-only rows under iconed rows
        // (36px = chevron + icon + gap slot). Standalone items keep 8px default.
        pl: icon ? 1 : indented ? '36px' : 1,
        pr: 1,
        py: '4px',
        minHeight: 36,
        gap: '8px',
        '&:hover': { bgcolor: 'action.hover' },
        '&.Mui-selected': {
          bgcolor: 'action.selected',
          '&:hover': { bgcolor: 'action.selected' },
        },
        '&.Mui-focusVisible': { bgcolor: 'action.focus' },
        '&.Mui-disabled': { opacity: 0.38 },
      }}
    >
      {icon && (
        <ListItemIcon
          sx={{
            minWidth: 20,
            color: 'action.active',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </ListItemIcon>
      )}

      <ListItemText
        primary={
          <Typography
            component="span"
            sx={{
              fontFamily: 'Figtree, system-ui, sans-serif',
              fontWeight: 400,
              fontSize: '0.875rem',
              lineHeight: '24px',
              color: 'text.primary',
              display: 'block',
            }}
          >
            {label}
          </Typography>
        }
        secondary={
          secondaryLabel ? (
            <Typography
              component="span"
              sx={{
                fontFamily: 'Figtree, system-ui, sans-serif',
                fontWeight: 400,
                fontSize: '0.75rem',
                color: 'text.secondary',
                display: 'block',
              }}
            >
              {secondaryLabel}
            </Typography>
          ) : undefined
        }
        disableTypography
      />

      {count !== undefined && (
        <HaloBadge
          badgeContent={count}
          color={selected ? 'primary' : 'default'}
          sx={{
            flexShrink: 0,
            '& .MuiBadge-badge': {
              position: 'static',
              transform: 'none',
            },
          }}
        >
          <Box sx={{ width: 0, height: 0 }} />
        </HaloBadge>
      )}

      {trailingIcon && (
        <Box
          sx={{
            fontSize: 12,
            color: 'text.secondary',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          {trailingIcon}
        </Box>
      )}
    </ListItemButton>
  );
}

// ── HaloList (data-driven) ────────────────────────────────────────────────────

export interface HaloListDataItem extends HaloListItemProps {
  id: string;
}

export interface HaloListProps extends Omit<ListProps, 'onSelect'> {
  items?: HaloListDataItem[];
  selected?: string;
  onSelect?: (id: string) => void;
  fullWidth?: boolean;
}

export function HaloList({ items, selected, onSelect, fullWidth = false, sx, children, ...props }: HaloListProps) {
  return (
    <List
      disablePadding
      sx={{
        width: fullWidth ? '100%' : 260,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        ...sx,
      }}
      {...props}
    >
      {items
        ? items.map((item) => (
            <HaloListItem
              key={item.id}
              {...item}
              selected={selected === item.id}
              onClick={() => onSelect?.(item.id)}
            />
          ))
        : children}
    </List>
  );
}

// ── HaloListGroup (collapsible subheader) ─────────────────────────────────────
//
// Figma: ⭐️ [HALO] Design System → <ListSubheader> (node 11033:145394)
// Tokens:
//   subheader:    pl 8 / pr 4 / py 8 / gap 4 / borderRadius 8
//   chevron:      angle-down 16×20 in 24px slot · rotates -90° when collapsed
//   label:        Figtree medium 14px / 1.57 / 0.1px tracking · text.secondary
//   count:        Figtree regular 12px / 1.66 / 0.4px · text.secondary
//   menu:         ellipsis-vertical IconButton 24×24 (optional)
//   states:       enabled / hover primary.states.hover / selected primary.states.selected
//
// Usage:
//   <HaloListGroup label="Shortcuts" defaultExpanded>
//     <HaloListItem label="Inbox" icon={<FontAwesomeIcon icon={faInbox} />} />
//     <HaloListItem label="Favorites" icon={<FontAwesomeIcon icon={faStar} />} />
//   </HaloListGroup>

export interface HaloListGroupProps {
  label: React.ReactNode;
  count?: number;
  showMenu?: boolean;
  onMenuClick?: () => void;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  selected?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function HaloListGroup({
  label,
  count,
  showMenu,
  onMenuClick,
  defaultExpanded = true,
  expanded,
  onToggle,
  selected,
  fullWidth,
  children,
}: HaloListGroupProps) {
  const isControlled = expanded !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultExpanded);
  const isOpen = isControlled ? expanded : internalOpen;

  const handleToggle = () => {
    const next = !isOpen;
    if (!isControlled) setInternalOpen(next);
    onToggle?.(next);
  };

  return (
    <Box sx={{ width: fullWidth ? '100%' : 260, display: 'flex', flexDirection: 'column' }}>
      <ButtonBase
        onClick={handleToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          width: '100%',
          pl: 1,
          pr: '4px',
          py: 1,
          borderRadius: '8px',
          justifyContent: 'flex-start',
          textAlign: 'left',
          bgcolor: selected ? 'action.selected' : 'transparent',
          '&:hover': { bgcolor: 'action.hover' },
          '&.Mui-focusVisible': { bgcolor: 'action.focus' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 19,
            pr: '4px',
            color: 'text.secondary',
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon
            icon={faAngleDown}
            style={{
              fontSize: 14,
              transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 150ms ease',
            }}
          />
        </Box>
        <Typography
          component="span"
          sx={{
            flex: '1 0 0',
            minWidth: 0,
            fontFamily: 'Figtree, system-ui, sans-serif',
            fontWeight: 500,
            fontSize: '0.875rem',
            lineHeight: 1.57,
            letterSpacing: '0.1px',
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Typography>
        {count !== undefined && (
          <Typography
            component="span"
            sx={{
              fontFamily: 'Figtree, system-ui, sans-serif',
              fontWeight: 400,
              fontSize: '0.75rem',
              lineHeight: 1.66,
              letterSpacing: '0.4px',
              color: 'text.secondary',
              flexShrink: 0,
            }}
          >
            {count}
          </Typography>
        )}
        {showMenu && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick?.();
            }}
            sx={{
              width: 24,
              height: 24,
              p: '2px',
              borderRadius: '4px',
              color: 'text.secondary',
              flexShrink: 0,
            }}
            aria-label="More options"
          >
            <FontAwesomeIcon icon={faEllipsisVertical} style={{ fontSize: 14 }} />
          </IconButton>
        )}
      </ButtonBase>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', pt: '2px' }}>
          <HaloListIndentContext.Provider value={true}>
            {children}
          </HaloListIndentContext.Provider>
        </Box>
      </Collapse>
    </Box>
  );
}

// ── HaloListFolder (nested folder row with hover-to-chevron icon) ─────────────
//
// Models the folder/menu pattern: every parent is a folder (never a file),
// children are themselves standard folders. Default state shows a folder icon
// (closed) or folder-open icon (expanded). On hover the icon swaps to a chevron
// (angle-right when collapsed, angle-down when expanded) to telegraph the
// expand/collapse affordance — matching the production Datasite list menu.
//
// Recursive: a HaloListFolder can contain HaloListFolder children. Each level
// gets 16px additional left padding so the tree reads cleanly.
//
// Usage:
//   <HaloListFolder label="Archive Bots" defaultExpanded>
//     <HaloListFolder label="(1) Contracts" />
//     <HaloListFolder label="(2) Human Resources" />
//   </HaloListFolder>

export interface HaloListFolderProps {
  label: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  selected?: boolean;
  disabled?: boolean;
  level?: number;
  children?: React.ReactNode;
}

export function HaloListFolder({
  label,
  defaultExpanded = false,
  expanded,
  onToggle,
  selected,
  disabled,
  level = 0,
  children,
}: HaloListFolderProps) {
  const isControlled = expanded !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultExpanded);
  const isOpen = isControlled ? expanded : internalOpen;
  const hasChildren = React.Children.count(children) > 0;

  const handleToggle = () => {
    if (!hasChildren) return;
    const next = !isOpen;
    if (!isControlled) setInternalOpen(next);
    onToggle?.(next);
  };

  return (
    <>
      <ListItemButton
        selected={selected}
        disabled={disabled}
        onClick={handleToggle}
        sx={{
          borderRadius: '8px',
          pl: `${8 + level * 16}px`,
          pr: 1,
          py: '4px',
          minHeight: 36,
          gap: '8px',
          '&:hover': { bgcolor: 'action.hover' },
          '&.Mui-selected': {
            bgcolor: 'action.selected',
            '&:hover': { bgcolor: 'action.selected' },
          },
          '&.Mui-focusVisible': { bgcolor: 'action.focus' },
          '&.Mui-disabled': { opacity: 0.38 },
          // Hover swap: hide folder icon, show chevron
          '& .halo-folder-leading-folder': { display: 'inline-flex' },
          '& .halo-folder-leading-chevron': { display: 'none' },
          ...(hasChildren && {
            '&:hover .halo-folder-leading-folder': { display: 'none' },
            '&:hover .halo-folder-leading-chevron': { display: 'inline-flex' },
          }),
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 20,
            color: 'action.active',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box component="span" className="halo-folder-leading-folder" sx={{ alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={isOpen ? faFolderOpen : faFolder} />
          </Box>
          <Box component="span" className="halo-folder-leading-chevron" sx={{ alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={isOpen ? faAngleDown : faAngleRight} />
          </Box>
        </ListItemIcon>

        <ListItemText
          primary={
            <Typography
              component="span"
              sx={{
                fontFamily: 'Figtree, system-ui, sans-serif',
                fontWeight: 400,
                fontSize: '0.875rem',
                lineHeight: '24px',
                color: 'text.primary',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Typography>
          }
          disableTypography
        />
      </ListItemButton>

      {hasChildren && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <HaloListIndentContext.Provider value={true}>
              {React.Children.map(children, (child) => {
                if (React.isValidElement<HaloListFolderProps>(child) && child.type === HaloListFolder) {
                  return React.cloneElement(child, { level: level + 1 });
                }
                return child;
              })}
            </HaloListIndentContext.Provider>
          </Box>
        </Collapse>
      )}
    </>
  );
}

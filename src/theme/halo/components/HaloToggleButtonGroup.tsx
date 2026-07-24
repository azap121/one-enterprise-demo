/**
 * HaloToggleButtonGroup
 *
 * Pill-shaped segment/tab control. The floating white "active" card
 * is handled by Halo MUI theme MuiToggleButtonGroup overrides.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_ToggleButtonGroup> (node 6601:51012)
 * Tokens (get_variable_defs, node 6601:51012):
 *   container:   border 1px solid rgba(106,106,105,0.3) (secondary/_states/outlinedBorder)
 *                border-radius 8px (--borderRadiusM), padding 4px (--new), gap 4px (--new)
 *   button:      border-radius 4px (--borderRadiusS), min-height 28px
 *                padding 2px 8px (py=2px, px=--1=8px)
 *                icon→label gap 8px (--1)
 *   selected bg: rgba(25,25,25,0.08) (primary/_states/selected)
 *   typography:  fontFamily, fontWeightMedium=500, 14px, lh 24px, ls 0.4px (button/medium)
 *   color:       text/primary (#323232)
 *
 * Usage:
 *   const [view, setView] = useState('list');
 *
 *   <HaloToggleButtonGroup
 *     value={view}
 *     onChange={(_, v) => v && setView(v)}
 *     options={[
 *       { value: 'list',  label: 'List' },
 *       { value: 'grid',  label: 'Grid' },
 *       { value: 'board', label: 'Board' },
 *     ]}
 *   />
 *
 *   // With icons (FA or MUI SvgIcon):
 *   options={[
 *     { value: 'list', label: 'List', icon: <FontAwesomeIcon icon={faList} /> },
 *   ]}
 */
import { ToggleButton, ToggleButtonGroup, type ToggleButtonGroupProps } from '@mui/material';
import React from 'react';

export interface HaloToggleOption {
  value: string;
  /** Button label — string or JSX */
  label: React.ReactNode;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface HaloToggleButtonGroupProps extends Omit<ToggleButtonGroupProps, 'onChange' | 'children'> {
  options: HaloToggleOption[];
  onChange?: (event: React.MouseEvent<HTMLElement>, value: string | null) => void;
}

export function HaloToggleButtonGroup({
  options,
  value,
  onChange,
  exclusive = true,
  ...rest
}: HaloToggleButtonGroupProps) {
  return (
    <ToggleButtonGroup value={value} exclusive={exclusive} onChange={onChange} {...rest}>
      {options.map((opt) => (
        <ToggleButton key={opt.value} value={opt.value} disabled={opt.disabled} sx={{ gap: opt.icon ? 1 : 0 }}>
          {opt.icon}
          {opt.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

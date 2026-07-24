import type { ReactNode } from 'react';

/**
 * Single entry in the left navigation rail.
 *
 * Used by DatasitePrototypeShell.navItems and the per-product nav arrays
 * in productNavItems.ts.
 */
export interface NavItem {
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}

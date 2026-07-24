/**
 * HaloBreadcrumbs
 *
 * Full Halo-spec wrapper around MUI Breadcrumbs.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Breadcrumbs> (node 6572:50436)
 * Tokens (get_variable_defs, node 6572:50436):
 *   typography:        fontFamily, fontWeightRegular=400, 12px, lh 1.66, ls 0.4px (typography/caption)
 *   non-current:       text/primary (#323232)
 *   current (last):    primary/dark (#191919)
 *   separator:         faAngleRight, mx 4px (--new), color text.secondary
 *   collapse bg:       _components/breadcrumbs/collapseFill (#f7f6f2)
 *   collapse radius:   borderRadiusS (4px), size 24×16px
 *
 * Usage:
 *   <HaloBreadcrumbs
 *     items={[
 *       { label: 'Projects', href: '/projects' },
 *       { label: 'Atlas Deal', href: '/projects/atlas' },
 *       { label: 'Documents' },
 *     ]}
 *   />
 *
 *   // With onClick handlers instead of hrefs:
 *   <HaloBreadcrumbs
 *     items={[
 *       { label: 'Home', onClick: () => navigate('/') },
 *       { label: 'Data room', onClick: () => navigate('/dataroom') },
 *       { label: 'Financials' },
 *     ]}
 *   />
 *
 *   // 5+ items — collapse after maxItems, show 3 after the ellipsis:
 *   <HaloBreadcrumbs
 *     items={deepItems}
 *     maxItems={4}
 *     itemsBeforeCollapse={1}
 *     itemsAfterCollapse={3}
 *   />
 */
import { faAngleRight } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Breadcrumbs, Link, type SxProps, type Theme, Typography } from '@mui/material';
import React from 'react';

export interface HaloBreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface HaloBreadcrumbsProps {
  items: HaloBreadcrumbItem[];
  /** Max items before collapsing — default 4 */
  maxItems?: number;
  /** Items visible before the collapse ellipsis — default 1 */
  itemsBeforeCollapse?: number;
  /** Items visible after the collapse ellipsis — default 1 */
  itemsAfterCollapse?: number;
  sx?: SxProps<Theme>;
}

export function HaloBreadcrumbs({
  items,
  maxItems = 4,
  itemsBeforeCollapse,
  itemsAfterCollapse,
  sx,
}: HaloBreadcrumbsProps) {
  const itemSx = (theme: Theme) => ({
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightRegular ?? 400,
    fontSize: '0.75rem',
    lineHeight: 1.66,
    letterSpacing: '0.4px',
  });

  return (
    <Breadcrumbs
      maxItems={maxItems}
      itemsBeforeCollapse={itemsBeforeCollapse}
      itemsAfterCollapse={itemsAfterCollapse}
      separator={
        <FontAwesomeIcon icon={faAngleRight} style={{ fontSize: 10 }} />
      }
      sx={[
        (theme) => ({
          '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap', alignItems: 'center' },
          '& .MuiBreadcrumbs-li': {
            fontFamily: theme.typography.fontFamily,
            fontWeight: theme.typography.fontWeightRegular ?? 400,
            fontSize: '0.75rem',
            lineHeight: 1.66,
            letterSpacing: '0.4px',
          },
          '& .MuiBreadcrumbs-separator': {
            mx: '4px',
            color: 'text.secondary',
          },
          // _<HALO_BreadcrumbCollapsed>: collapseFill bg, borderRadiusS, 24×16px
          // MUI v6 renders collapse as ButtonBase with only MuiButtonBase-root class
          '& .MuiBreadcrumbs-ol .MuiButtonBase-root': {
            bgcolor: '#f7f6f2',
            borderRadius: '4px',
            width: 24,
            height: 16,
            p: 0,
            ml: 0,
            color: 'text.secondary',
            '& .MuiSvgIcon-root': { fontSize: '0.75rem' },
          },
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;

        if (isLast) {
          return (
            <Typography
              key={i}
              sx={(theme) => ({
                ...itemSx(theme),
                color: '#191919', // primary/dark
              })}
            >
              {item.label}
            </Typography>
          );
        }

        if (item.href || item.onClick) {
          return (
            <Link
              key={i}
              href={item.href}
              onClick={item.onClick}
              underline="hover"
              sx={(theme) => ({
                ...itemSx(theme),
                color: 'text.primary',
                cursor: 'pointer',
              })}
            >
              {item.label}
            </Link>
          );
        }

        return (
          <Typography
            key={i}
            sx={(theme) => ({
              ...itemSx(theme),
              color: 'text.primary',
            })}
          >
            {item.label}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
}

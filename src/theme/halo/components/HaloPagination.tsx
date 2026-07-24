/**
 * HaloPagination
 *
 * Halo-spec wrapper around MUI Pagination.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Pagination> (node 11051:148776)
 *                                   <HALO_PaginationItem> (node 6598:49207)
 * Tokens (get_variable_defs, node 6598:49207):
 *   item size:       24×24px
 *   border-radius:   borderRadiusS (4px)
 *   typography:      fontFamily, fontWeightRegular=400, 14px, lh 1.43, ls 0.17px (typography/body2)
 *   color:           text/primary (#323232) — all items including prev/next icons
 *   item gap:        8px (--1) between items via container gap
 *   hover bg:        primary/_states/hover rgba(25,25,19,0.04)
 *   focus bg:        primary/_states/focus rgba(25,25,25,0.12)
 *   selected bg:     primary/_states/selected rgba(25,25,25,0.08)
 *   disabled color:  action/disabled rgba(78,78,77,0.38)
 *
 * Usage:
 *   <HaloPagination count={10} page={page} onChange={setPage} />
 *   <HaloPagination count={10} page={1} showFirstButton showLastButton />
 *   <HaloPagination count={5} page={page} onChange={setPage} siblingCount={0} />
 */
import { Pagination, type PaginationProps } from '@mui/material';

export interface HaloPaginationProps extends Omit<PaginationProps, 'onChange'> {
  onChange?: (page: number) => void;
}

export function HaloPagination({ onChange, sx, ...props }: HaloPaginationProps) {
  return (
    <Pagination
      shape="rounded"
      onChange={onChange ? (_, page) => onChange(page) : undefined}
      sx={[
        (theme) => ({
          '& .MuiPagination-ul': {
            gap: '8px',          // --1 token: gap between items
            flexWrap: 'nowrap',
          },
          '& .MuiPaginationItem-root': {
            fontFamily: theme.typography.fontFamily,
            fontWeight: theme.typography.fontWeightRegular ?? 400, // fontWeightRegular
            fontSize: '0.875rem',   // _fontSize/0,875rem (14px)
            lineHeight: 1.43,       // typography/body2
            letterSpacing: '0.17px', // typography/body2
            borderRadius: '4px',    // borderRadiusS
            minWidth: 24,
            height: 24,
            margin: 0,              // gap handled by container
            color: 'text.primary',  // text/primary — same for all items incl. icons
            '&.Mui-selected': {
              backgroundColor: 'rgba(25,25,25,0.08)', // primary/_states/selected
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'rgba(25,25,25,0.12)', // primary/_states/focus
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(25,25,25,0.04)', // primary/_states/hover
            },
            '&.Mui-focusVisible': {
              backgroundColor: 'rgba(25,25,25,0.12)', // primary/_states/focus
            },
            '&.Mui-disabled': {
              color: 'text.disabled', // action/disabled rgba(78,78,77,0.38)
            },
          },
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    />
  );
}

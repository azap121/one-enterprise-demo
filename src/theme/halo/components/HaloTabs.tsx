/**
 * HaloTabs / HaloTab
 *
 * Halo-spec wrappers around MUI Tabs and Tab.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Tabs> (node 11053:152542)
 *                                   <HALO_Tab>  (node 6579:45104)
 * Tokens (get_variable_defs, node 11053:152542):
 *   typography:         button/medium — fontWeightMedium=500, 14px, lh 24px, ls 0.4px
 *   inactive color:     text/secondary (#6a6a69)
 *   active color:       primary/main (#4e4e4d) — dark charcoal, NOT tanzanite
 *   disabled color:     text/disabled rgba(78,78,77,0.38)
 *   inactive hover bg:  secondary/_states/focus rgba(106,106,105,0.12)
 *   active hover bg:    primary/_states/focus rgba(25,25,25,0.12)
 *   inactive focused:   primary/dark (#191919) text
 *   active focused:     common/black (#000000) text
 *   indicator:          primary/main (#4e4e4d), height 2px
 *   border-bottom:      _components/divider/divider rgba(25,25,25,0.12)
 *   tab padding:        px 16px (--2) py 8px (--1)
 *   tab gap:            8px (--1) between icon and label
 *   container height:   40px
 *
 * Usage:
 *   const [tab, setTab] = React.useState(0);
 *   <HaloTabs value={tab} onChange={setTab}>
 *     <HaloTab label="Overview" />
 *     <HaloTab label="Documents" />
 *     <HaloTab label="Activity" />
 *   </HaloTabs>
 *
 *   // With icon:
 *   <HaloTab label="Files" icon={<FontAwesomeIcon icon={faFolder} />} iconPosition="start" />
 *
 *   // Scrollable:
 *   <HaloTabs value={tab} onChange={setTab} variant="scrollable" scrollButtons="auto">
 *     ...
 *   </HaloTabs>
 */
import { Tab, type TabProps, Tabs, type TabsProps } from '@mui/material';

export interface HaloTabsProps extends Omit<TabsProps, 'onChange'> {
  onChange?: (value: number) => void;
}

export function HaloTabs({ onChange, sx, ...props }: HaloTabsProps) {
  return (
    <Tabs
      onChange={onChange ? (_, value) => onChange(value) : undefined}
      TabIndicatorProps={{
        style: {
          backgroundColor: '#4e4e4d', // primary/main
          height: 2,
        },
      }}
      sx={[
        {
          borderBottom: '1px solid rgba(25,25,25,0.12)', // _components/divider/divider
          minHeight: 40,
          '& .MuiTabs-flexContainer': { gap: 0 },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    />
  );
}

export function HaloTab({ sx, ...props }: TabProps) {
  return (
    <Tab
      disableRipple={false}
      sx={[
        (theme) => ({
          fontFamily: theme.typography.fontFamily,
          fontWeight: theme.typography.fontWeightMedium ?? 500, // button/medium
          fontSize: '0.875rem',           // 14px
          lineHeight: '24px',             // button/medium lh
          letterSpacing: '0.4px',         // button/medium ls
          textTransform: 'none',
          minHeight: 40,
          padding: '8px 16px',            // py --1, px --2
          gap: '8px',                     // --1 gap between icon and label
          color: '#6a6a69',               // text/secondary
          '&.Mui-selected': {
            color: '#4e4e4d',             // primary/main — dark charcoal, NOT tanzanite
          },
          '&.Mui-disabled': {
            color: 'rgba(78,78,77,0.38)', // text/disabled
          },
          '&:hover:not(.Mui-disabled):not(.Mui-selected)': {
            color: '#6a6a69',             // text/secondary — unchanged on hover
            backgroundColor: 'rgba(106,106,105,0.12)', // secondary/_states/focus
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(25,25,25,0.12)', // primary/_states/focus
          },
          '&:not(.Mui-selected):focus-visible': {
            color: '#191919',             // primary/dark
          },
          '&.Mui-selected:focus-visible': {
            color: '#000000',             // common/black
          },
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    />
  );
}

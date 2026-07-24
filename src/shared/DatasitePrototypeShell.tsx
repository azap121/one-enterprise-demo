'use client';
import {
  faAngleLeft,
  faBell,
  faBars,
  faArrowUp,
  faMagnifyingGlass,
  faXmark,
  faChevronRight,
  faUpRightAndDownLeftFromCenter,
  faPaperclip,
  faClock,
  faAtom,
} from '@fortawesome/pro-light-svg-icons';
import { faGrid, faHouse, faPlus, faCode, faGrid2Plus } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faAiSparkle } from './icons/faAiSparkle';
import { faDatasiteLogo } from './icons/faDatasiteLogo';
import { appLogos, partnerLogos } from '~/assets/app-logos';
import danielAvatar from '~/assets/daniel.png';
import {
  Box,
  Button,
  ButtonBase,
  ClickAwayListener,
  Divider,
  Fade,
  GlobalStyles,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Popper,
  Stack,
  Tooltip,
  Typography,
  type SxProps,
} from '@mui/material';
import { forwardRef, useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { SearchSpotlight } from './SearchSpotlight';
import { SearchResultsContent } from '~/projects/Graham/SearchResults/components/SearchResultsPage';
import { amber } from '~/theme/halo/theme';
import { HaloAvatar, HaloBadge, HaloChip, HaloMenuItem } from '~/theme/halo/components';
import { DatasiteProfileMenu, type DatasiteProfileMenuProps } from './DatasiteProfileMenu';
import {
  navItemsByProductMode,
  productDisplayName,
  type ProductMode,
} from './productNavItems';
import type { NavItem } from './types';

// ─── Figma tokens — HALO_LeftNav + HALO_TopNav, node 25988:13056, April 2026 ──
const COLLAPSED_NAV_WIDTH = 60;   // Figma: collapsed nav width 60px
const EXPANDED_NAV_WIDTH  = 200;  // Figma: expanded nav width 200px
const TOP_BAR_HEIGHT      = 60;   // Figma: top bar height 60px
const DATASITE_ORANGE     = amber[600];

// ─── Animation spec ───────────────────────────────────────────────────────────
const NAV_OPEN_MS    = 250;
const NAV_CLOSE_MS   = 200;
const MENU_OPEN_MS   = 800;
const MENU_CLOSE_MS  = 200;
const SIDECAR_OPEN_MS  = 240;
const SIDECAR_CLOSE_MS = 220;
const OPEN_EASING    = 'cubic-bezier(0.2, 0, 0.2, 1)';
const CLOSE_EASING   = 'cubic-bezier(0.4, 0, 0.6, 0.55)';

const LABEL_OPEN_DELAY_MS  = 80;
const LABEL_OPEN_FADE_MS   = 120;
const LABEL_CLOSE_FADE_MS  = 200;

const SIDECAR_MENU_WIDTH = 280; // App switcher popover width

// ─── AiAvatarButton / AiSidecar view constants ───────────────────────────────

const ACTION_CHIPS = [
  'Find sensitive data & disclosures',
  'Summarize selected documents',
  'Identify information gaps',
  'Surface key deal risks',
];

const AGENT_ITEMS = [
  'CIM Summary',
  'Due Diligence Tracker',
  'Risk Analyzer',
];

const HISTORY_ITEMS = [
  'Review the proposed acquisition structure and flag any structural risks',
  'This target has operations in 7 countries. Summarise key regulatory exposure',
  'Identify retention risk in the management team based on employment contracts',
  'Review the employee benefits and pension obligations in these HR documents',
  "We've received the IT infrastructure overview. Flag any cyber or tech risks",
];

// ─── App Switcher data ────────────────────────────────────────────────────────
type SwitcherApp =
  | { label: string; faIcon: IconProp; bg?: string; fg?: string; letter?: never; svgLogo?: never }
  | { label: string; letter: string; bg: string; fg: string; faIcon?: never; svgLogo?: never }
  | { label: string; svgLogo: string; showBorder?: boolean; faIcon?: never; letter?: never; bg?: string; fg?: string };

const SWITCHER_APPS: SwitcherApp[] = [
  { label: 'Home',         faIcon: faHouse as IconProp, fg: 'inherit' },
  { label: 'Blueflame AI', svgLogo: partnerLogos['blueflame']! },
  { label: 'Grata',        svgLogo: partnerLogos['grata']!, showBorder: true },
  { label: 'Sherpany',     svgLogo: partnerLogos['sherpany']! },
  { label: 'MergerLinks',  svgLogo: partnerLogos['mergerlinks']! },
];

type SwitcherProject = { label: string; letter: string; bg: string; badge: string };
const SWITCHER_RECENT: SwitcherProject[] = [
  { label: 'Voxelmatter',     letter: 'V', bg: '#1D4ED8', badge: 'D' },
  { label: 'Acme Industries', letter: 'A', bg: '#CA8A04', badge: 'P' },
  { label: 'Test 2',          letter: 'T', bg: '#1D4ED8', badge: 'D' },
  { label: 'Hawaii',          letter: 'H', bg: '#1D4ED8', badge: 'D' },
];

type SwitcherDiscover =
  | { label: string; faIcon: IconProp; bgcolor?: string; svgLogo?: never }
  | { label: string; svgLogo: string;  bgcolor?: string; faIcon?: never };
const SWITCHER_DISCOVER: SwitcherDiscover[] = [
  { label: 'Translate',                 svgLogo: appLogos['translate']! },
  { label: 'Datasite MCP for Claude',   svgLogo: appLogos['claude-mcp']! },
  { label: 'Datasite Marketplace',      faIcon: faGrid2Plus as IconProp,  bgcolor: 'background.defaultAlt' },
  { label: 'Datasite Developer Portal', faIcon: faCode as IconProp,           bgcolor: 'background.defaultAlt' },
];

export interface DatasitePrototypeShellProps {
  // Top bar
  logo?: ReactNode;
  search?: ReactNode | false;
  topBarActions?: ReactNode;
  /** Project name shown in the Spotlight placeholder. Defaults to "Project". */
  projectName?: string;
  /** Called when user submits a search query from the Spotlight. */
  onSearch?: (query: string) => void;
  /** When true, replaces the main content area with the Search Results page after a query is submitted. */
  showSearchResultsOnQuery?: boolean;
  /** Pre-fills the top search bar and spotlight with this query on mount. */
  defaultSearchQuery?: string;
  /** Controlled search query — when provided, syncs the top search bar to this value. */
  searchQuery?: string;

  // Left nav
  productMode?: ProductMode;
  productName?: string;
  navItems?: NavItem[];
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (next: boolean) => void;

  // Bottom-of-nav slots
  notificationsCount?: number;
  onNotificationsClick?: () => void;
  hideNotifications?: boolean;
  /** Slot rendered above the notifications button in the left nav. Use for prototype-specific widgets (e.g. credits meter). */
  bottomNavSlot?: ReactNode;
  user?: { name?: string; initials?: string; avatarUrl?: string };
  profileMenu?: ReactNode;
  profileMenuProps?: Omit<DatasiteProfileMenuProps, 'user'>;

  /** Override the left nav + top bar background. Defaults to background.defaultAlt (MoonDust50). */
  chromeBg?: string;
  /** Override the AI sidecar background. Defaults to background.paper. */
  sidecarBg?: string;
  /** Override the AI sidecar width in px. Defaults to 440. */
  sidecarWidth?: number;
  /** Override the expand icon in the sidecar header. Defaults to faUpRightAndDownLeftFromCenter. */
  sidecarExpandIcon?: ReactNode;
  /** Use HaloMenuItem-style rows in the app switcher instead of the default List pattern. */
  appMenuVariant?: 'halo';
  /** Places the app switcher in the top bar or as an Apps row above Notifications in the left nav. */
  appSwitcherPlacement?: 'topbar' | 'nav-bottom';
  /** Override the top bar height in px. Defaults to the Halo 60px top bar. */
  topBarHeight?: number;
  /** Apply a background to the content row (main + sidecar), so gradient shows in sidecar margin gaps. */
  contentRowBg?: string;
  /** Override the main content area background. Pass 'transparent' to let contentRowBg show through. Defaults to background.paper. */
  mainBg?: string;
  /** Override the sidecar top margin in MUI spacing units. Defaults to 1.5 (12px). */
  sidecarMt?: number;

  // Content
  children: ReactNode;
  sx?: SxProps;
  /** Override the left nav + outer wrapper background. Accepts any MUI theme color token or CSS value. Defaults to 'background.paperAlt'. */
  navBgColor?: string;
  /** Context label shown in the AI sidecar's context chip. */
  sidecarActiveContext?: string;
  /** Called when the sidecar opens or closes. */
  onSidecarChange?: (open: boolean) => void;
  /** Controlled open state for the sidecar. When provided, the shell syncs to this value. */
  sidecarOpen?: boolean;
  /** When set, pre-populates the sidecar chat with a search result summary. */
  sidecarSearchQuery?: string;
  /** Completely hides the AI sidecar and avatar button (no auto-open on long queries). */
  hideSidecar?: boolean;
}

/**
 * Full Datasite app shell matching the canonical Halo navigation Figma.
 * node 25988:13056, April 2026.
 */
export function DatasitePrototypeShell({
  logo,
  search,
  topBarActions,
  projectName,
  onSearch,
  showSearchResultsOnQuery = false,
  defaultSearchQuery = '',
  productMode,
  productName,
  navItems,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  notificationsCount = 0,
  onNotificationsClick,
  hideNotifications = false,
  bottomNavSlot,
  user = { name: 'Daniel Samuels', initials: 'DS', avatarUrl: danielAvatar },
  profileMenu,
  profileMenuProps,
  chromeBg = 'background.defaultAlt',
  sidecarBg = 'background.paper',
  sidecarWidth,
  sidecarExpandIcon,
  appMenuVariant,
  appSwitcherPlacement = 'topbar',
  topBarHeight = TOP_BAR_HEIGHT,
  contentRowBg,
  mainBg,
  sidecarMt,
  children,
  sx,
  navBgColor: _navBgColor = 'background.paperAlt',
  sidecarActiveContext: _sidecarActiveContext,
  onSidecarChange,
  sidecarOpen: _sidecarOpenProp,
  sidecarSearchQuery: _sidecarSearchQuery,
  searchQuery: searchQueryProp,
  hideSidecar = false,
}: DatasitePrototypeShellProps) {
  const rawItems = navItems ?? (productMode ? navItemsByProductMode[productMode] : []);

  const [activeNavLabel, setActiveNavLabel]     = useState<string | null>(
    () => rawItems.find(i => i.active)?.label ?? null
  );
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  // Sync active item when the nav source changes (e.g. productMode switch)
  useEffect(() => {
    const items = navItems ?? (productMode ? navItemsByProductMode[productMode] : []);
    const initial = items.find(i => i.active)?.label ?? null;
    if (initial) setActiveNavLabel(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productMode, navItems]);
  const [spotlightOpen, setSpotlightOpen]       = useState(false);
  const [spotlightInitialQuery, setSpotlightInitialQuery] = useState('');
  const [searchQuery, setSearchQuery]           = useState(defaultSearchQuery);
  const [sidecarOpen, setSidecarOpen]           = useState(false);
  const [sidecarAiQuery, setSidecarAiQuery]     = useState<string | null>(null);

  // Sync controlled searchQuery prop into internal state
  useEffect(() => {
    if (searchQueryProp !== undefined) setSearchQuery(searchQueryProp);
  }, [searchQueryProp]);

  const toggleSidecar = useCallback((next: boolean) => {
    setSidecarOpen(next);
    onSidecarChange?.(next);
  }, [onSidecarChange]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      setSpotlightOpen(true);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const expanded   = expandedProp ?? internalExpanded;
  const setExpanded = (next: boolean) => {
    if (expandedProp === undefined) setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  // Inject active state and click handlers so all nav items are selectable
  const items = rawItems.map(item => ({
    ...item,
    active: item.label === activeNavLabel,
    onClick: item.disabled ? undefined : () => {
      setActiveNavLabel(item.label);
      item.onClick?.();
    },
  }));

  const headerName = productName ?? (productMode ? productDisplayName[productMode] : undefined);
  const navWidth   = expanded ? EXPANDED_NAV_WIDTH : COLLAPSED_NAV_WIDTH;
  const showAppSwitcherInTopBar = appSwitcherPlacement === 'topbar';
  const showAppSwitcherInNav    = appSwitcherPlacement === 'nav-bottom';
  const compactTopBar           = topBarHeight <= 16;

  // When closing: labels fade first, then nav width collapses after
  const navTransition = expanded
    ? `width ${NAV_OPEN_MS}ms ${OPEN_EASING}`
    : `width ${NAV_CLOSE_MS}ms ${CLOSE_EASING}`;

  // Label fade: collapse to maxWidth:0 so collapsed icon centers cleanly.
  // On close, maxWidth snaps to 0 only after opacity has faded (delay = fade duration).
  const labelFadeSx: SxProps = {
    opacity:       expanded ? 1 : 0,
    maxWidth:      expanded ? 9999 : 0,
    pointerEvents: expanded ? 'auto' : 'none',
    overflow:      'hidden',
    whiteSpace:    'nowrap',
    textOverflow:  'ellipsis',
    transition: expanded
      ? `opacity ${LABEL_OPEN_FADE_MS}ms ${OPEN_EASING} ${LABEL_OPEN_DELAY_MS}ms`
      : `opacity ${LABEL_CLOSE_FADE_MS}ms ${CLOSE_EASING}, max-width 0ms linear ${LABEL_CLOSE_FADE_MS}ms`,
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', bgcolor: chromeBg, ...sx }}>
      <GlobalStyles styles={KEYFRAME_CSS} />
      <SearchSpotlight
        open={spotlightOpen}
        projectName={projectName}
        initialQuery={spotlightInitialQuery}
        onClose={() => setSpotlightOpen(false)}
        onSearch={(query) => { handleSearch(query); setSpotlightOpen(false); if (!hideSidecar && query.trim().split(/\s+/).length > 3) toggleSidecar(true); }}
        onAskBlueflame={(q) => {
          setSpotlightOpen(false);
          setSearchQuery('');
          if (!hideSidecar) { setSidecarAiQuery(q); toggleSidecar(true); }
        }}
      />

      {/* ── Left nav ──────────────────────────────────────────────────────── */}
      <Stack
        component="nav"
        aria-label="Primary navigation"
        sx={{
          width:      navWidth,
          bgcolor:    chromeBg,
          flexShrink: 0,
          position:   'sticky',
          top:        0,
          height:     '100%',
          transition: navTransition,
          overflow:   'hidden',
        }}>

        {/* Logo row — clicking logo or product name collapses when expanded */}
        <Box sx={{
          display:        'flex',
          alignItems:     'center',
          height:         TOP_BAR_HEIGHT,
          px:             1.5,
          py:             0.75,
          flexShrink:     0,
          overflow:       'hidden',
          justifyContent: 'space-between',
          gap:            0.75,
        }}>
          <Box
            onClick={() => setExpanded(!expanded)}
            sx={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          36,
              height:         36,
              flexShrink:     0,
              cursor:         'pointer',
            }}>
            {logo ?? <DefaultLogo />}
          </Box>

          {/* Product name — click collapses when expanded */}
          {headerName && (
            <Typography
              onClick={expanded ? () => setExpanded(false) : undefined}
              sx={{
                ...labelFadeSx,
                fontSize:      '1.25rem',
                fontWeight:    500,
                lineHeight:    1.6,
                letterSpacing: '0.15px',
                color:         'text.primary',
                flex:          1,
                py:            '4px',
                cursor:        expanded ? 'pointer' : 'default',
              }}>
              {headerName}
            </Typography>
          )}
          {!headerName && <Box sx={{ flex: 1 }} />}

          {/* Collapse button */}
          <IconButton
            size="small"
            onClick={() => setExpanded(false)}
            aria-label="Collapse navigation"
            sx={{
              ...labelFadeSx,
              width:        24,
              height:       24,
              borderRadius: '4px',
              p:            '4px',
              flexShrink:   0,
            }}>
            <FontAwesomeIcon icon={faAngleLeft} style={{ fontSize: 14 }} />
          </IconButton>
        </Box>

        {/* Nav items */}
        <Stack sx={{ px: 1.5, flex: 1, overflowY: 'auto' }}>
          {items.map((item) => (
            <Box key={item.label} sx={{ py: 0.5 }}>
              <NavRow item={item} expanded={expanded} labelFadeSx={labelFadeSx} />
            </Box>
          ))}
        </Stack>

        {/* Bottom — notifications + user */}
        <Stack sx={{ px: 1.5, pb: 1, flexShrink: 0 }}>
          {bottomNavSlot}
          {showAppSwitcherInNav && (
            <Box sx={{ py: '4px' }}>
              <DatasiteAppSwitcher
                menuVariant={appMenuVariant}
                variant="nav"
                expanded={expanded}
                labelFadeSx={labelFadeSx}
              />
            </Box>
          )}
          {!hideNotifications && (
            <Box sx={{ py: '4px' }}>
              <Tooltip title="Notifications" placement="right" disableHoverListener={expanded} arrow>
                <Stack
                  component="button"
                  direction="row"
                  alignItems="center"
                  onClick={onNotificationsClick}
                  sx={{
                    ...navItemSx(false),
                    gap: '12px',
                  }}>
                  <Box sx={{ width: 25, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <HaloBadge variant="dot" color="error" overlap="circular" invisible={notificationsCount === 0}>
                      <FontAwesomeIcon icon={faBell} style={{ fontSize: 16 }} />
                    </HaloBadge>
                  </Box>
                  <Typography variant="body2" sx={{ ...labelFadeSx }}>
                    Notifications
                  </Typography>
                </Stack>
              </Tooltip>
            </Box>
          )}

          <UserAvatarButton
            user={user}
            expanded={expanded}
            labelFadeSx={labelFadeSx}
            profileMenu={profileMenu}
            profileMenuProps={profileMenuProps}
          />
        </Stack>
      </Stack>

      {/* ── Right column: top bar + main content ──────────────────────────── */}
      <Stack sx={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden' }}>
        <Stack
          component="header"
          direction="row"
          alignItems="center"
          sx={{
            pl:           compactTopBar ? 0 : 1,
            pr:           compactTopBar ? 0 : 2,
            py:           compactTopBar ? 0 : 1.5,
            height:       topBarHeight,
            minHeight:    topBarHeight,
            bgcolor:      chromeBg,
            flexShrink:   0,
            position:     'sticky',
            top:          0,
            zIndex:       10,
            gap:          '16px',
          }}>
          {/* Search — flex 1, centred */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            {search === false ? null : search ?? (
              <DatasiteSearchField
                query={searchQuery}
                projectName={projectName}
                onClick={() => { setSpotlightInitialQuery(searchQuery); setSpotlightOpen(true); }}
                onClear={() => { setSpotlightInitialQuery(''); setSpotlightOpen(true); }}
              />
            )}
          </Box>

          {/* Right actions */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {topBarActions ?? (
              <>
                {!hideSidecar && (
                  <AiAvatarButton
                    sidecarOpen={sidecarOpen}
                    attentionTrigger={0}
                    pageLoadTrigger={0}
                    onToggle={() => setSidecarOpen((o) => !o)}
                  />
                )}
                {showAppSwitcherInTopBar && <DatasiteAppSwitcher menuVariant={appMenuVariant} />}
              </>
            )}
          </Stack>
        </Stack>

        {/* Content row: main area + sidecar */}
        <Stack direction="row" sx={{ flex: 1, minHeight: 0, overflow: 'hidden', ...(contentRowBg ? { background: contentRowBg } : {}) }}>
          <Box component="main" sx={{ flex: 1, overflow: 'auto', bgcolor: mainBg ?? 'background.paper', minWidth: 0 }}>
            {showSearchResultsOnQuery && searchQuery
              ? <SearchResultsContent query={searchQuery} />
              : children}
          </Box>
          {!hideSidecar && <AiSidecar open={sidecarOpen} onClose={() => { setSidecarOpen(false); setSidecarAiQuery(null); }} userName={user.name} aiQuery={sidecarAiQuery} bg={sidecarBg} width={sidecarWidth} expandIcon={sidecarExpandIcon} mt={sidecarMt} />}
        </Stack>
      </Stack>
    </Box>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ────────────────────────────────────────────────────────────────────────────

function DefaultLogo() {
  return (
    <FontAwesomeIcon icon={faDatasiteLogo as unknown as IconProp} style={{ fontSize: 24 }} />
  );
}

// Nav item base styles — active uses Halo action.selected (subtle highlight)
const navItemSx = (active: boolean): SxProps => ({
  display:        'flex',
  flexDirection:  'row',
  alignItems:     'center',
  width:          '100%',
  px:             0.75,
  py:             0.5,
  minHeight:      36,
  border:         'none',
  bgcolor:        active ? 'action.selected' : 'transparent',
  borderRadius:   1,
  cursor:         'pointer',
  color:          'text.primary',
  textAlign:      'left',
  textDecoration: 'none',
  justifyContent: 'flex-start',
  transition:     `background-color ${MENU_CLOSE_MS}ms ${CLOSE_EASING}`,
  '&:hover':      { bgcolor: 'action.hover' },
  WebkitAppearance: 'none',
});

interface NavRowProps {
  item: NavItem;
  expanded: boolean;
  labelFadeSx: SxProps;
}

const NavRow = forwardRef<HTMLElement, NavRowProps>(function NavRow({ item, expanded, labelFadeSx }, ref) {
  const isLink      = !!item.href && !item.onClick;
  const Component: any = isLink ? 'a' : 'button';
  return (
    <Tooltip title={item.label} placement="right" disableHoverListener={expanded} arrow>
      <Stack
        ref={ref as any}
        component={Component}
        {...(isLink ? { href: item.href } : { type: 'button' })}
        onClick={item.onClick}
        direction="row"
        alignItems="center"
        sx={{
          ...navItemSx(!!item.active),
          opacity:        item.disabled ? 0.4 : 1,
          pointerEvents:  item.disabled ? 'none' : 'auto',
          gap:            '12px',
        }}>
        <Box sx={{ width: 25, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
          {item.icon}
        </Box>
        <Typography variant="body2" sx={{ ...labelFadeSx, fontWeight: 400 }}>
          {item.label}
        </Typography>
      </Stack>
    </Tooltip>
  );
});

interface UserAvatarButtonProps {
  user: { name?: string; initials?: string; avatarUrl?: string };
  expanded: boolean;
  labelFadeSx: SxProps;
  profileMenu?: ReactNode;
  profileMenuProps?: Omit<DatasiteProfileMenuProps, 'user'>;
}

function UserAvatarButton({ user, expanded: _expanded, labelFadeSx, profileMenu, profileMenuProps }: UserAvatarButtonProps) {
  const [open, setOpen]   = useState(false);
  const anchorRef         = useRef<HTMLButtonElement | null>(null);
  const initials          = user.initials ?? user.name?.slice(0, 2).toUpperCase() ?? 'DS';
  const name              = user.name ?? 'User';

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box>
        <Stack
          ref={anchorRef as any}
          component="button"
          type="button"
          onClick={() => setOpen((o) => !o)}
          direction="row"
          alignItems="center"
          sx={{
            display:         'flex',
            width:           '100%',
            px:              0,
            py:              '4px',
            minHeight:       60,
            border:          'none',
            bgcolor:         'transparent',
            borderRadius:    '8px',
            cursor:          'pointer',
            gap:             '7px',
            WebkitAppearance: 'none',
          }}
          aria-label="Open profile menu"
          aria-haspopup="menu">
          <HaloAvatar src={user.avatarUrl} size="sm" sx={{ flexShrink: 0 }}>
            {!user.avatarUrl && initials}
          </HaloAvatar>
          <Typography variant="body2" sx={{ ...labelFadeSx }}>
            {name}
          </Typography>
        </Stack>

        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="right-end"
          transition
          modifiers={[{ name: 'offset', options: { offset: [0, 16] } }]}
          sx={{ zIndex: 1300 }}>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={{ enter: MENU_OPEN_MS, exit: MENU_CLOSE_MS }}>
              <Box>
                {profileMenu ?? (
                  <DatasiteProfileMenu
                    user={{ name, initials: user.initials, avatarUrl: user.avatarUrl }}
                    onClose={() => setOpen(false)}
                    {...profileMenuProps}
                  />
                )}
              </Box>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}

interface DatasiteSearchFieldProps {
  query?: string;
  projectName?: string;
  onClick?: () => void;
  onClear?: () => void;
}

export function DatasiteSearchField({ query = '', projectName: _projectName, onClick, onClear }: DatasiteSearchFieldProps) {
  const [hovered, setHovered] = useState(false);
  const hasQuery    = query.length > 0;
  const borderColor = hovered && !hasQuery ? 'primary.dark' : 'divider';

  return (
    <Stack
      component="button"
      direction="row"
      alignItems="center"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        width:            '100%',
        maxWidth:         773,
        height:           32,
        border:           '1px solid',
        borderColor,
        borderRadius:     '8px',
        pl:               1,
        pr:               0.5,
        gap:              1,
        bgcolor:          'background.paper',
        cursor:           'pointer',
        textAlign:        'left',
        WebkitAppearance: 'none',
        transition:       `border-color ${MENU_CLOSE_MS}ms ${CLOSE_EASING}`,
        flexShrink:       0,
      }}>

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', overflow: 'hidden', px: 0.5 }}>
        {hasQuery ? (
          <Typography variant="body1" noWrap sx={{ color: 'text.primary', flex: 1 }}>
            {query}
          </Typography>
        ) : (
          <Typography variant="body1" noWrap sx={{ color: 'text.secondary' }}>
            Ask or search for anything
          </Typography>
        )}
      </Box>

      {hovered && !hasQuery && (
        <Stack direction="row" alignItems="center" gap="4px" sx={{ flexShrink: 0 }}>
          <Typography variant="caption" sx={{ color: 'text.disabled', lineHeight: '20px' }}>
            Press
          </Typography>
          <Box sx={{
            width: 20, height: 20,
            bgcolor:        'action.selected',
            borderRadius:   '4px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}>
            <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary', lineHeight: '24px' }}>
              /
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'text.disabled', lineHeight: '20px', whiteSpace: 'nowrap' }}>
            to start searching
          </Typography>
        </Stack>
      )}

      {hasQuery && (
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onClear?.(); }}
          aria-label="Clear search"
          sx={{ width: 24, height: 24, p: 0, color: 'text.secondary', flexShrink: 0, '&:hover': { color: 'text.primary' } }}>
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
        </IconButton>
      )}

      <Box sx={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'text.disabled' }}>
        <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 16 }} />
      </Box>
    </Stack>
  );
}

export function DatasiteAiButton({ onClick, active: _active }: { onClick?: () => void; active?: boolean } = {}) {
  return (
    <Tooltip title="Datasite AI" arrow>
      <IconButton
        disableRipple
        onClick={onClick}
        aria-label="Datasite AI"
        sx={{
          width:         36,
          height:        36,
          padding:       0,
          borderRadius:  '50%',
          bgcolor:       DATASITE_ORANGE,
          color:         'common.white',
          flexShrink:    0,
          transition:    `opacity ${MENU_CLOSE_MS}ms ${CLOSE_EASING}`,
          '&:hover':     { opacity: 0.9, bgcolor: DATASITE_ORANGE },
        }}>
        <FontAwesomeIcon
          icon={faAiSparkle as unknown as IconProp}
          style={{ width: 27.01, height: 27.01 }}
        />
      </IconButton>
    </Tooltip>
  );
}

// ─── Animated AI avatar button ───────────────────────────────────────────────

// Sparkle path — Datasite AI Avatar spec (15 May 2026)
const SPARKLE_D =
  'M31.3088 17.6175C22.6688 17.5613 18.4275 13.3313 18.3713 4.68V4.48874H17.6175V4.68C17.5613 13.32 13.32 17.5613 4.68002 17.6175H4.48877V18.3712H4.68002C13.32 18.4275 17.5613 22.6687 17.6175 31.3087V31.5H18.3713V31.3087C18.4275 22.6687 22.6688 18.4275 31.3088 18.3712H31.5V17.6175H31.3088Z';

const KEYFRAME_CSS = `
  .ai-sparkle    { transform-box: fill-box; transform-origin: center; }
  .ai-hover-group { transform-box: fill-box; transform-origin: center; }
  @keyframes ai-cw {
    0%   { transform: scale(1)    rotate(0deg); }
    12%  { transform: scale(.82)  rotate(0deg); }
    32%  { transform: scale(1.12) rotate(30deg); }
    52%  { transform: scale(.96)  rotate(-12deg); }
    68%  { transform: scale(1.04) rotate(5deg); }
    82%  { transform: scale(.99)  rotate(-2deg); }
    100% { transform: scale(1)    rotate(0deg); }
  }
  @keyframes ai-wash-fade {
    0%   { opacity: 0; }
    12%  { opacity: 1; }
    80%  { opacity: 0.85; }
    100% { opacity: 0; }
  }
  @keyframes ai-sunrise-1 {
    0%   { stop-color: #EF601A; }
    30%  { stop-color: #F5A623; }
    65%  { stop-color: #F8C84E; }
    100% { stop-color: #EF601A; }
  }
  @keyframes ai-sunrise-2 {
    0%   { stop-color: #F38F5E; }
    30%  { stop-color: #F5B94A; }
    65%  { stop-color: #F6D06B; }
    100% { stop-color: #F38F5E; }
  }
  @keyframes ai-sparkle-grow {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  @keyframes ai-ember-1 {
    0%   { stop-color: #EF601A; }
    50%  { stop-color: #C44A12; }
    100% { stop-color: #EF601A; }
  }
  @keyframes ai-ember-2 {
    0%   { stop-color: #EF601A; }
    50%  { stop-color: #A03D10; }
    100% { stop-color: #EF601A; }
  }
  @keyframes ai-sparkle-shrink {
    0%   { transform: scale(1); }
    30%  { transform: scale(0.92); }
    100% { transform: scale(1); }
  }
  @keyframes ai-hover-spin {
    0%   { transform: rotate(0deg)   scale(1); }
    25%  { transform: rotate(90deg)  scale(.8); }
    50%  { transform: rotate(180deg) scale(1); }
    75%  { transform: rotate(270deg) scale(.8); }
    100% { transform: rotate(360deg) scale(1); }
  }
  @keyframes ai-hover-rot {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes ai-hover-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes ai-su1 {
    0%, 100% { stop-color: #EF601A; }
    33%       { stop-color: #E94160; }
    66%       { stop-color: #2F3F7F; }
  }
  @keyframes ai-su2 {
    0%, 100% { stop-color: #E94160; }
    33%       { stop-color: #2F3F7F; }
    66%       { stop-color: #EF601A; }
  }
  @keyframes ai-bounce {
    0%    { transform: translateY(0)      scaleX(1)    scaleY(1); }
    3%    { transform: translateY(-4.5px) scaleX(.90)  scaleY(1.14); }
    6.5%  { transform: translateY(1px)    scaleX(1.06) scaleY(.94); }
    9%    { transform: translateY(0)      scaleX(1)    scaleY(1); }
    11.5% { transform: translateY(-3.4px) scaleX(.92)  scaleY(1.10); }
    14.5% { transform: translateY(.7px)   scaleX(1.05) scaleY(.95); }
    17%   { transform: translateY(0)      scaleX(1)    scaleY(1); }
    19%   { transform: translateY(-2.5px) scaleX(.94)  scaleY(1.07); }
    21.5% { transform: translateY(.5px)   scaleX(1.03) scaleY(.97); }
    23.5% { transform: translateY(0)      scaleX(1)    scaleY(1); }
    25%   { transform: translateY(-1.7px) scaleX(.96)  scaleY(1.05); }
    27%   { transform: translateY(.3px)   scaleX(1.02) scaleY(.98); }
    28.5% { transform: translateY(0)      scaleX(1)    scaleY(1); }
    29.5% { transform: translateY(-1px)   scaleX(.97)  scaleY(1.03); }
    31%   { transform: translateY(0)      scaleX(1)    scaleY(1); }
    32%   { transform: translateY(-.5px)  scaleX(.99)  scaleY(1.01); }
    33%   { transform: translateY(0)      scaleX(1)    scaleY(1); }
    33.5% { transform: translateY(-.2px)  scaleX(.99)  scaleY(1.005); }
    34%, 100% { transform: translateY(0) scaleX(1) scaleY(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .ai-sparkle, .ai-hover-group { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
  }
`;

const XFADE = 240;

function AiAvatarButton({
  sidecarOpen,
  attentionTrigger,
  pageLoadTrigger,
  onToggle,
}: {
  sidecarOpen: boolean;
  attentionTrigger: number;
  pageLoadTrigger: number;
  onToggle: () => void;
}) {
  const svgRef           = useRef<SVGSVGElement>(null);
  const prevOpen         = useRef(sidecarOpen);
  const prevPageLoadTrig = useRef(pageLoadTrigger);
  const pendingTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverTimer       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHovering       = useRef(false);

  const ids = useRef({
    sunrise: `ai-sr-${Math.random().toString(36).slice(2)}`,
    ember:   `ai-em-${Math.random().toString(36).slice(2)}`,
    hover:   `ai-hv-${Math.random().toString(36).slice(2)}`,
  });

  const getEls = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return null;
    return {
      svg,
      sp:  svg.querySelector('.ai-sparkle')     as SVGElement,
      sov: svg.querySelector('.ai-sunrise-ov')  as SVGElement,
      eov: svg.querySelector('.ai-ember-ov')    as SVGElement,
      hov: svg.querySelector('.ai-hover-ov')    as SVGElement,
      gg:  svg.querySelector('.ai-hover-group') as SVGElement,
      ws1: svg.querySelector('.ai-ws1')         as SVGElement,
      ws2: svg.querySelector('.ai-ws2')         as SVGElement,
      es1: svg.querySelector('.ai-es1')         as SVGElement,
      es2: svg.querySelector('.ai-es2')         as SVGElement,
      s1:  svg.querySelector('.ai-s1')          as SVGElement,
      s2:  svg.querySelector('.ai-s2')          as SVGElement,
    };
  }, []);

  const crossFade = useCallback((startNew: () => void) => {
    if (pendingTimer.current) { clearTimeout(pendingTimer.current); pendingTimer.current = null; }
    const e = getEls();
    if (!e) { startNew(); return; }
    [e.ws1, e.ws2, e.es1, e.es2, e.s1, e.s2].forEach(el => { el.style.animation = 'none'; });
    e.svg.style.animation = '';
    const spT = getComputedStyle(e.sp).transform;
    e.sp.style.animation  = 'none';
    e.sp.style.transform  = (spT && spT !== 'none') ? spT : '';
    void e.sp.getBoundingClientRect();
    e.sp.style.transition = `transform ${XFADE}ms cubic-bezier(0.4,0,0.2,1)`;
    e.sp.style.transform  = 'scale(1)';
    const ggT = getComputedStyle(e.gg).transform;
    e.gg.style.animation  = 'none';
    e.gg.style.transform  = (ggT && ggT !== 'none') ? ggT : '';
    void e.gg.getBoundingClientRect();
    e.gg.style.transition = `transform ${XFADE}ms ease-out`;
    e.gg.style.transform  = 'rotate(0deg)';
    [e.sov, e.eov, e.hov].forEach(el => {
      const co = parseFloat(getComputedStyle(el).opacity ?? '0');
      el.style.animation = 'none';
      if (co > 0.01) {
        el.style.opacity    = String(co);
        void el.getBoundingClientRect();
        el.style.transition = `opacity ${XFADE}ms ease-out`;
        el.style.opacity    = '0';
      } else {
        el.style.opacity = '0';
      }
    });
    pendingTimer.current = setTimeout(() => {
      pendingTimer.current = null;
      const e2 = getEls();
      if (!e2) return;
      [e2.sp, e2.sov, e2.eov, e2.hov, e2.gg].forEach(el => {
        el.style.transition = '';
        el.style.animation  = '';
        el.style.transform  = '';
        el.style.opacity    = '';
      });
      startNew();
    }, XFADE + 16);
  }, [getEls]);

  const playPageLoad = useCallback(() => {
    const e = getEls();
    if (!e) return;
    e.sp.style.animation = 'ai-cw 2.8s cubic-bezier(0.45,0.05,0.55,0.95) 1 forwards';
  }, [getEls]);

  const playSunrise = useCallback(() => {
    const e = getEls();
    if (!e) return;
    e.sov.style.animation = 'ai-wash-fade 3s ease-in-out 1 forwards';
    e.ws1.style.animation = 'ai-sunrise-1 3s ease-in-out 1 forwards';
    e.ws2.style.animation = 'ai-sunrise-2 3s ease-in-out 1 forwards';
    e.sp.style.animation  = 'ai-sparkle-grow 3s ease-in-out 1 forwards';
  }, [getEls]);

  const playEmber = useCallback(() => {
    const e = getEls();
    if (!e) return;
    e.eov.style.animation = 'ai-wash-fade 3s ease-in-out 1 forwards';
    e.es1.style.animation = 'ai-ember-1 3s ease-in-out 1 forwards';
    e.es2.style.animation = 'ai-ember-2 3s ease-in-out 1 forwards';
    e.sp.style.animation  = 'ai-sparkle-shrink 3s ease-in-out 1 forwards';
  }, [getEls]);

  const startHover = useCallback(() => {
    if (!isHovering.current) return;
    const e = getEls();
    if (!e) return;
    e.sp.style.animation  = 'ai-hover-spin 3.6s linear infinite';
    e.hov.style.animation = 'ai-hover-in 0.8s ease-out forwards';
    e.gg.style.animation  = 'ai-hover-rot 8s linear infinite';
    e.s1.style.animation  = 'ai-su1 10s ease-in-out infinite';
    e.s2.style.animation  = 'ai-su2 10s ease-in-out infinite';
  }, [getEls]);

  useEffect(() => {
    const t = setTimeout(() => crossFade(playPageLoad), 1600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLoadTrigger]);

  useEffect(() => {
    if (prevOpen.current === sidecarOpen) return;
    const replayFired = pageLoadTrigger !== prevPageLoadTrig.current;
    if (sidecarOpen) {
      crossFade(playSunrise);
    } else if (!replayFired) {
      crossFade(playEmber);
    }
    prevOpen.current         = sidecarOpen;
    prevPageLoadTrig.current = pageLoadTrigger;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidecarOpen, pageLoadTrigger]);

  useEffect(() => {
    if (attentionTrigger === 0) return;
    crossFade(() => {
      const e = getEls();
      if (!e) return;
      e.svg.style.animation = 'ai-bounce 3.5s cubic-bezier(0.34,1.56,0.64,1) 1 forwards';
      setTimeout(() => { if (e.svg) e.svg.style.animation = ''; }, 3500 + 16);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attentionTrigger]);

  useEffect(() => () => {
    if (pendingTimer.current) clearTimeout(pendingTimer.current);
    if (hoverTimer.current)   clearTimeout(hoverTimer.current);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
    isHovering.current = true;
    crossFade(startHover);
  }, [crossFade, startHover]);

  const handleMouseLeave = useCallback(() => {
    isHovering.current = false;
    if (pendingTimer.current) { clearTimeout(pendingTimer.current); pendingTimer.current = null; }
    if (hoverTimer.current)   { clearTimeout(hoverTimer.current);   hoverTimer.current   = null; }
    const e = getEls();
    if (!e) return;
    const spT = getComputedStyle(e.sp).transform;
    const ovO = getComputedStyle(e.hov).opacity;
    const ggT = getComputedStyle(e.gg).transform;
    [e.sp, e.hov, e.gg, e.s1, e.s2].forEach(el => { el.style.animation = 'none'; });
    e.sp.style.transform  = (spT && spT !== 'none') ? spT : '';
    e.hov.style.opacity   = ovO;
    e.gg.style.transform  = (ggT && ggT !== 'none') ? ggT : '';
    void e.sp.getBoundingClientRect();
    e.sp.style.transition  = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
    e.sp.style.transform   = 'scale(1)';
    e.hov.style.transition = 'opacity 0.5s ease-out';
    e.hov.style.opacity    = '0';
    e.gg.style.transition  = 'transform 0.5s ease-out';
    e.gg.style.transform   = 'rotate(0deg)';
    hoverTimer.current = setTimeout(() => {
      [e.sp, e.hov, e.gg, e.s1, e.s2].forEach(el => { el.style.cssText = ''; });
      hoverTimer.current = null;
    }, 550);
  }, [getEls]);

  const { sunrise, ember, hover } = ids.current;

  return (
    <Box
      component="button"
      onClick={onToggle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        width: 36, height: 36, border: 'none', background: 'transparent',
        cursor: 'pointer', padding: 0, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        outline: 'none',
        '&:hover': { background: 'rgba(0,0,0,0.04)' },
        flexShrink: 0,
      }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 36 36"
        width={36}
        height={36}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          <radialGradient id={sunrise} cx="35%" cy="35%" r="70%">
            <stop className="ai-ws1" offset="0%"   stopColor="#F38F5E" />
            <stop className="ai-ws2" offset="100%" stopColor="#F5B94A" />
          </radialGradient>
          <radialGradient id={ember} cx="35%" cy="35%" r="70%">
            <stop className="ai-es1" offset="0%"   stopColor="#EF601A" />
            <stop className="ai-es2" offset="100%" stopColor="#EF601A" />
          </radialGradient>
          <radialGradient id={hover} cx="30%" cy="30%" r="75%">
            <stop className="ai-s1" offset="0%"   stopColor="#EF601A" />
            <stop className="ai-s2" offset="100%" stopColor="#E94160" />
          </radialGradient>
        </defs>
        <circle cx="18" cy="18" r="18" fill="#EF601A" />
        <circle className="ai-sunrise-ov" cx="18" cy="18" r="18" fill={`url(#${sunrise})`} opacity="0" />
        <circle className="ai-ember-ov"   cx="18" cy="18" r="18" fill={`url(#${ember})`}   opacity="0" />
        <g className="ai-hover-group">
          <circle className="ai-hover-ov" cx="18" cy="18" r="18" fill={`url(#${hover})`} opacity="0" />
        </g>
        <path className="ai-sparkle" d={SPARKLE_D} fill="white" />
      </svg>
    </Box>
  );
}

// ─── AI Sidecar ──────────────────────────────────────────────────────────────

const SIDECAR_WIDTH = 440;

function AiSidecar({ open, onClose, userName, aiQuery, bg = 'background.paper', width = SIDECAR_WIDTH, expandIcon, mt = 1.5 }: { open: boolean; onClose: () => void; userName?: string; aiQuery?: string | null; bg?: string; width?: number; expandIcon?: ReactNode; mt?: number }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const sidecarTransition = open
    ? `width ${SIDECAR_OPEN_MS}ms ${OPEN_EASING}`
    : `width ${SIDECAR_CLOSE_MS}ms ${CLOSE_EASING}`;

  return (
    <Box sx={{
      width:                 open ? width : 0,
      flexShrink:            0,
      overflow:              'hidden',
      transition:            sidecarTransition,
      borderLeft:            '1px solid',
      borderTop:             '1px solid',
      borderBottom:          '1px solid',
      borderColor:           open ? 'divider' : 'transparent',
      borderTopLeftRadius:   '16px',
      borderBottomLeftRadius:'16px',
      bgcolor:               bg,
      display:               'flex',
      flexDirection:         'column',
      mt,
      mb:                    3,
    }}>
      <Box sx={{ width, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {menuOpen
          ? <SidecarMenuView onClose={() => setMenuOpen(false)} />
          : aiQuery
          ? <SidecarChatView query={aiQuery} onClose={onClose} onMenu={() => setMenuOpen(true)} expandIcon={expandIcon} />
          : <SidecarWelcomeView onMenu={() => setMenuOpen(true)} onClose={onClose} userName={userName} expandIcon={expandIcon} />
        }
      </Box>
    </Box>
  );
}

function SidecarChatView({ query, onClose, onMenu, expandIcon }: { query: string; onClose: () => void; onMenu: () => void; expandIcon?: ReactNode }) {
  return (
    <>
      {/* Header — same as WelcomeView */}
      <Stack direction="row" alignItems="center" sx={{ px: 1.5, minHeight: 48, flexShrink: 0, gap: 1 }}>
        <IconButton size="small" aria-label="Menu" onClick={onMenu} sx={{ p: 0.75, color: 'text.secondary' }}>
          <FontAwesomeIcon icon={faBars} style={{ fontSize: 14 }} />
        </IconButton>
        <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: DATASITE_ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FontAwesomeIcon icon={faAiSparkle as unknown as IconProp} style={{ width: 16, height: 16, color: '#fff' }} />
        </Box>
        <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
          Datasite AI
        </Typography>
        <Stack direction="row" alignItems="center" sx={{ color: 'text.secondary', flexShrink: 0 }}>
          <IconButton size="small" aria-label="New chat" sx={{ p: 0.75 }}>
            <FontAwesomeIcon icon={faPlus} style={{ fontSize: 14 }} />
          </IconButton>
          <IconButton size="small" aria-label="Expand" sx={{ p: 0.75 }}>
            {expandIcon ?? <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} style={{ fontSize: 12 }} />}
          </IconButton>
          <IconButton size="small" aria-label="Close AI panel" onClick={onClose} sx={{ p: 0.75 }}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
          </IconButton>
        </Stack>
      </Stack>

      {/* Chat thread */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* User message */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box sx={{ bgcolor: 'action.selected', borderRadius: '12px 12px 2px 12px', px: 2, py: 1, maxWidth: '85%' }}>
            <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.5 }}>
              {query}
            </Typography>
          </Box>
        </Box>

        {/* Blueflame response */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: DATASITE_ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: '2px' }}>
            <FontAwesomeIcon icon={faAiSparkle as unknown as IconProp} style={{ width: 14, height: 14, color: '#fff' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 0.75 }}>Blueflame</Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6, mb: 1.5 }}>
              I found several relevant documents in OSI Acquisition related to your query. Here's a summary of the most relevant results:
            </Typography>
            <Stack spacing={1}>
              {['Financial Statements Q3 2024.pdf', 'Debt Schedule — Capital Lease Summary.xlsx', 'Vendor Agreement — Enhanced Review.docx'].map((doc) => (
                <ButtonBase key={doc} sx={{
                  width:        '100%',
                  display:      'flex',
                  textAlign:    'left',
                  border:       '1px solid',
                  borderColor:  'divider',
                  borderRadius: 1,
                  px:           1.5,
                  py:           1,
                  '&:hover':    { bgcolor: 'action.hover' },
                  transition:   `background-color ${MENU_CLOSE_MS}ms ${CLOSE_EASING}`,
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{doc}</Typography>
                </ButtonBase>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ px: 2, pt: 1.5, pb: 1.5, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', px: 1.5, py: 1, mb: 1, gap: 1, bgcolor: 'background.paper' }}>
          <Box sx={{ color: 'text.disabled', flexShrink: 0, display: 'flex' }}>
            <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: 16 }} />
          </Box>
          <Typography variant="body2" sx={{ flex: 1, color: 'text.secondary' }}>Ask anything…</Typography>
          <IconButton
            size="small"
            aria-label="Send"
            sx={{ width: 26, height: 26, bgcolor: 'text.primary', color: 'common.white', flexShrink: 0, p: 0, '&:hover': { bgcolor: 'text.secondary' } }}
          >
            <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: 11 }} />
          </IconButton>
        </Stack>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', textAlign: 'center' }}>
          Powered by Blueflame AI. Always review for accuracy.
        </Typography>
      </Box>
    </>
  );
}

function SidecarWelcomeView({ onMenu, onClose, userName, expandIcon }: { onMenu: () => void; onClose: () => void; userName?: string; expandIcon?: ReactNode }) {
  const firstName = userName?.split(' ')[0] ?? 'Daniel';
  return (
    <>
      {/* Header */}
      <Stack direction="row" alignItems="center" sx={{
        px:         1.5,
        minHeight:  48,
        flexShrink: 0,
        gap:        1,
      }}>
        <IconButton size="small" aria-label="Menu" onClick={onMenu} sx={{ p: 0.75, color: 'text.secondary' }}>
          <FontAwesomeIcon icon={faBars} style={{ fontSize: 14 }} />
        </IconButton>
        <Box sx={{
          width:          22,
          height:         22,
          borderRadius:   '50%',
          bgcolor:        DATASITE_ORANGE,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
        }}>
          <FontAwesomeIcon icon={faAiSparkle as unknown as IconProp} style={{ width: 16, height: 16, color: '#fff' }} />
        </Box>
        <Typography sx={{
          flex:       1,
          fontSize:   13,
          fontWeight: 600,
          color:      'text.primary',
        }}>
          Datasite AI
        </Typography>
        <Stack direction="row" alignItems="center" sx={{ color: 'text.secondary', flexShrink: 0 }}>
          <IconButton size="small" aria-label="New chat" sx={{ p: 0.75 }}>
            <FontAwesomeIcon icon={faPlus} style={{ fontSize: 14 }} />
          </IconButton>
          <IconButton size="small" aria-label="Expand" sx={{ p: 0.75 }}>
            {expandIcon ?? <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} style={{ fontSize: 12 }} />}
          </IconButton>
          <IconButton size="small" aria-label="Close AI panel" onClick={onClose} sx={{ p: 0.75 }}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
          </IconButton>
        </Stack>
      </Stack>

      {/* Body */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 300, color: 'text.primary', lineHeight: 1.2, mb: 0.75 }}>
            Hello, {firstName}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Ask me anything!
          </Typography>
        </Box>

        {/* Action chips — outlined per Figma AI-Pattern-Audit */}
        <Stack alignItems="center" spacing={1}>
          {ACTION_CHIPS.map((chip) => (
            <HaloChip key={chip} label={chip} variant="outlined" />
          ))}
        </Stack>
      </Box>

      {/* Footer */}
      <Box sx={{ px: 2, pt: 1.5, pb: 1.5, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', px: 1.5, py: 1, mb: 1, gap: 1, bgcolor: 'background.paper' }}>
          <Box sx={{ color: 'text.disabled', flexShrink: 0, display: 'flex' }}>
            <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: 16 }} />
          </Box>
          <Typography variant="body2" sx={{ flex: 1, color: 'text.secondary' }}>
            Ask anything…
          </Typography>
          <IconButton
            size="small"
            aria-label="Send"
            sx={{ width: 26, height: 26, bgcolor: 'text.primary', color: 'common.white', flexShrink: 0, p: 0, '&:hover': { bgcolor: 'text.secondary' } }}
          >
            <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: 11 }} />
          </IconButton>
        </Stack>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', textAlign: 'center' }}>
          Powered by Blueflame AI. Always review for accuracy.
        </Typography>
      </Box>
    </>
  );
}

function SidecarMenuView({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Header — X only, closes menu and returns to welcome view */}
      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{
        px:         1.5,
        minHeight:  48,
        flexShrink: 0,
      }}>
        <IconButton size="small" aria-label="Close menu" onClick={onClose} sx={{ p: 0.75, color: 'text.secondary' }}>
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
        </IconButton>
      </Stack>

      {/* Body */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2.5 }}>
        {/* New Chat */}
        <Button
          variant="outlined"
          fullWidth
          startIcon={<FontAwesomeIcon icon={faPlus} style={{ fontSize: 13 }} />}
          sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 3 }}
        >
          New Chat
        </Button>

        {/* Agents section */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 1 }}>
            <Box sx={{ color: 'text.disabled', display: 'flex' }}>
              <FontAwesomeIcon icon={faAtom} style={{ fontSize: 11 }} />
            </Box>
            <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1, fontSize: 10 }}>
              Agents
            </Typography>
          </Stack>
          {AGENT_ITEMS.map((item) => (
            <ButtonBase key={item} sx={{
              width:        '100%',
              display:      'flex',
              justifyContent: 'space-between',
              alignItems:   'center',
              py:           1,
              px:           1,
              borderRadius: '6px',
              '&:hover':    { bgcolor: 'action.hover' },
              transition:   `background-color ${MENU_CLOSE_MS}ms ${CLOSE_EASING}`,
            }}>
              <Typography variant="body2">{item}</Typography>
              <Box sx={{ color: 'text.disabled', display: 'flex' }}>
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 11 }} />
              </Box>
            </ButtonBase>
          ))}
          <Link component="button" variant="caption" sx={{ display: 'block', mt: 0.5, px: 1, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            View all
          </Link>
        </Box>

        {/* History section */}
        <Box>
          <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 1 }}>
            <Box sx={{ color: 'text.disabled', display: 'flex' }}>
              <FontAwesomeIcon icon={faClock} style={{ fontSize: 11 }} />
            </Box>
            <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1, fontSize: 10 }}>
              History
            </Typography>
          </Stack>
          {HISTORY_ITEMS.map((item) => (
            <ButtonBase key={item} sx={{
              width:          '100%',
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
              py:             1,
              px:             1,
              borderRadius:   '6px',
              '&:hover':      { bgcolor: 'action.hover' },
              transition:     `background-color ${MENU_CLOSE_MS}ms ${CLOSE_EASING}`,
            }}>
              <Typography variant="body2">{item}</Typography>
              <Box sx={{ color: 'text.disabled', display: 'flex' }}>
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 11 }} />
              </Box>
            </ButtonBase>
          ))}
          <Link component="button" variant="caption" sx={{ display: 'block', mt: 0.5, px: 1, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            View all
          </Link>
        </Box>
      </Box>
    </>
  );
}

export function DatasiteAppSwitcher({
  menuVariant,
  variant = 'icon',
  expanded = true,
  labelFadeSx,
}: {
  menuVariant?: 'halo';
  variant?: 'icon' | 'nav';
  expanded?: boolean;
  labelFadeSx?: SxProps;
}) {
  const [open, setOpen] = useState(false);
  const [pointerAnchor, setPointerAnchor] = useState<{ x: number; y: number } | null>(null);
  const anchorRef       = useRef<HTMLButtonElement | null>(null);
  const isNavVariant    = variant === 'nav';

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    if (isNavVariant) {
      setPointerAnchor({ x: event.clientX, y: event.clientY });
    }
    setOpen((o) => !o);
  };

  const popperAnchor = isNavVariant && pointerAnchor
    ? {
        getBoundingClientRect: () => ({
          width:  0,
          height: 0,
          top:    pointerAnchor.y,
          bottom: pointerAnchor.y,
          left:   pointerAnchor.x,
          right:  pointerAnchor.x,
          x:      pointerAnchor.x,
          y:      pointerAnchor.y,
          toJSON: () => {},
        }),
      }
    : anchorRef.current;
  const placement = isNavVariant ? 'right-start' : 'bottom-end';
  const fallbackPlacements = isNavVariant
    ? ['right-end', 'top-start', 'bottom-start', 'left-start']
    : ['bottom-start', 'top-end', 'top-start'];

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box>
        {isNavVariant ? (
          <Tooltip title="Apps" placement="right" disableHoverListener={expanded} arrow>
            <Stack
              ref={anchorRef as any}
              component="button"
              type="button"
              direction="row"
              alignItems="center"
              onClick={handleToggle}
              aria-label="Apps"
              sx={{
                ...navItemSx(open),
                gap: '12px',
              }}>
              <Box sx={{ width: 25, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FontAwesomeIcon icon={faGrid} style={{ fontSize: 16 }} />
              </Box>
              <Typography variant="body2" sx={{ ...(labelFadeSx ?? {}) }}>
                Apps
              </Typography>
            </Stack>
          </Tooltip>
        ) : (
          <Tooltip title="App switcher" arrow disableHoverListener={open}>
            <IconButton
              ref={anchorRef as any}
              size="small"
              onClick={handleToggle}
              aria-label="App switcher"
              sx={{
                width:        24,
                height:       24,
                borderRadius: '4px',
                p:            '4px',
                bgcolor:      open ? 'action.selected' : 'transparent',
                transition:   `background-color ${MENU_CLOSE_MS}ms ${CLOSE_EASING}`,
                '&:hover':    { bgcolor: 'action.hover' },
              }}>
              <FontAwesomeIcon icon={faGrid} style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}

        <Popper
          open={open}
          anchorEl={popperAnchor as any}
          placement={placement}
          transition
          modifiers={[
            { name: 'offset', options: { offset: [0, 8] } },
            { name: 'flip', options: { fallbackPlacements } },
            { name: 'preventOverflow', options: { padding: 8, rootBoundary: 'viewport' } },
          ]}
          sx={{ zIndex: 1300 }}>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={{ enter: MENU_OPEN_MS, exit: MENU_CLOSE_MS }}>
              <Box sx={{
                bgcolor:      'background.paper',
                borderRadius: '12px',
                boxShadow:    '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                width:        SIDECAR_MENU_WIDTH,
                overflow:     'hidden',
                border:       '1px solid',
                borderColor:  'divider',
              }}>
                <AppSwitcherMenu onClose={() => setOpen(false)} variant={menuVariant} />
              </Box>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}

// ─── App icon avatar ─────────────────────────────────────────────────────────
function AppAvatar({ app, size = 28 }: { app: SwitcherApp; size?: number }) {
  if (app.svgLogo) {
    return (
      <Box sx={{
        width:          size,
        height:         size,
        borderRadius:   '6px',
        overflow:       'hidden',
        flexShrink:     0,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        ...(app.showBorder && {
          border:      '0.5px solid',
          borderColor: 'divider',
        }),
      }}>
        <img src={app.svgLogo} alt={app.label} style={{ width: size, height: size, objectFit: 'contain', display: 'block' }} />
      </Box>
    );
  }
  if (app.letter) {
    return (
      <Box sx={{
        width:          size,
        height:         size,
        borderRadius:   '6px',
        bgcolor:        app.bg,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: app.fg, lineHeight: 1 }}>
          {app.letter}
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{
      width:          size,
      height:         size,
      borderRadius:   '6px',
      bgcolor:        'background.defaultAlt',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      flexShrink:     0,
      color:          app.fg ?? 'text.secondary',
    }}>
      <FontAwesomeIcon icon={app.faIcon!} style={{ fontSize: 13 }} />
    </Box>
  );
}

// badge letter → Datasite product logo
const BADGE_PRODUCT_LOGOS: Record<string, string | null> = {
  D: appLogos['diligence'],
  P: appLogos['prepare'],
};

// ─── Project avatar with product badge ───────────────────────────────────────
function ProjectAvatar({ item, size = 28 }: { item: SwitcherProject; size?: number }) {
  const productLogo = BADGE_PRODUCT_LOGOS[item.badge] ?? null;
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Main icon — product logo if available, else letter avatar */}
      <Box sx={{
        width:          size,
        height:         size,
        borderRadius:   '6px',
        overflow:       'hidden',
        bgcolor:        productLogo ? 'transparent' : item.bg,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}>
        {productLogo ? (
          <img src={productLogo} alt={item.badge} style={{ width: size, height: size, objectFit: 'contain', display: 'block' }} />
        ) : (
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'common.white', lineHeight: 1 }}>
            {item.letter}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── App Switcher Menu ────────────────────────────────────────────────────────
function AppSwitcherMenu({ onClose, variant }: { onClose: () => void; variant?: 'halo' }) {
  if (variant === 'halo') {
    return (
      <Box sx={{ py: 1 }}>
        {/* Apps */}
        <Typography variant="overline" sx={{ px: 1.5, pb: 0.5, display: 'block', color: 'text.secondary' }}>Apps</Typography>
        {SWITCHER_APPS.map((app) => (
          <HaloMenuItem key={app.label} icon={<AppAvatar app={app} />} onClick={onClose}>
            {app.label}
          </HaloMenuItem>
        ))}
        <Divider sx={{ my: 1 }} />
        {/* Recent */}
        <Typography variant="overline" sx={{ px: 1.5, pb: 0.5, display: 'block', color: 'text.secondary' }}>Recent</Typography>
        {SWITCHER_RECENT.map((item) => (
          <HaloMenuItem key={item.label} icon={<ProjectAvatar item={item} />} onClick={onClose}>
            {item.label}
          </HaloMenuItem>
        ))}
        <HaloMenuItem
          icon={
            <Box sx={{ width: 28, height: 28, borderRadius: '6px', border: '1.5px dashed', borderColor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'primary.main' }}>
              <FontAwesomeIcon icon={faPlus} style={{ fontSize: 11 }} />
            </Box>
          }
          onClick={onClose}
          sx={{ color: 'primary.main', fontWeight: 500 }}
        >
          Create Project
        </HaloMenuItem>
        <Divider sx={{ my: 1 }} />
        {/* Discover More */}
        <Typography variant="overline" sx={{ px: 1.5, pb: 0.5, display: 'block', color: 'text.secondary' }}>Discover More</Typography>
        {SWITCHER_DISCOVER.map((item) => (
          <HaloMenuItem
            key={item.label}
            icon={
              item.svgLogo
                ? <Box sx={{ width: 28, height: 28, borderRadius: '6px', overflow: 'hidden', flexShrink: 0, ...(item.bgcolor && { bgcolor: item.bgcolor }) }}>
                    <img src={item.svgLogo} alt={item.label} style={{ width: 28, height: 28, objectFit: 'contain', display: 'block' }} />
                  </Box>
                : <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: item.bgcolor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit', flexShrink: 0 }}>
                    <FontAwesomeIcon icon={item.faIcon!} style={{ fontSize: 13 }} />
                  </Box>
            }
            onClick={onClose}
          >
            {item.label}
          </HaloMenuItem>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {/* Apps */}
      <List
        dense
        disablePadding
        subheader={<ListSubheader disableSticky sx={{ bgcolor: 'transparent', lineHeight: '36px' }}>Apps</ListSubheader>}
      >
        {SWITCHER_APPS.map((app) => (
          <ListItem key={app.label} disablePadding>
            <ListItemButton onClick={onClose} sx={{ gap: 1.25 }}>
              <AppAvatar app={app} />
              <ListItemText primary={app.label} primaryTypographyProps={{ variant: 'body2' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'background.defaultAlt' }} />

      {/* Recent projects */}
      <List
        dense
        disablePadding
        subheader={<ListSubheader disableSticky sx={{ bgcolor: 'transparent', lineHeight: '36px' }}>Recent</ListSubheader>}
      >
        {SWITCHER_RECENT.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={onClose} sx={{ gap: 1.25 }}>
              <ProjectAvatar item={item} />
              <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2' }} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton sx={{ gap: 1.25 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '6px', border: '1.5px dashed', borderColor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'primary.main' }}>
              <FontAwesomeIcon icon={faPlus} style={{ fontSize: 11 }} />
            </Box>
            <ListItemText primary="Create Project" primaryTypographyProps={{ variant: 'body2', sx: { color: 'primary.main', fontWeight: 500 } }} />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ borderColor: 'background.defaultAlt' }} />

      {/* Discover More */}
      <List
        dense
        disablePadding
        subheader={<ListSubheader disableSticky sx={{ bgcolor: 'transparent', lineHeight: '36px' }}>Discover More</ListSubheader>}
      >
        {SWITCHER_DISCOVER.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={onClose} sx={{ gap: 1.25 }}>
              {item.svgLogo
                ? <Box sx={{ width: 28, height: 28, borderRadius: '6px', overflow: 'hidden', flexShrink: 0, ...(item.bgcolor && { bgcolor: item.bgcolor }) }}>
                    <img src={item.svgLogo} alt={item.label} style={{ width: 28, height: 28, objectFit: 'contain', display: 'block' }} />
                  </Box>
                : <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: item.bgcolor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'inherit' }}>
                    <FontAwesomeIcon icon={item.faIcon!} style={{ fontSize: 13 }} />
                  </Box>
              }
              <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

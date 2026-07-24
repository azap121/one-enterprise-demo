import {
  faAddressBook,
  faArrowTrendUp,
  faCabinetFiling,
  faCompass,
  faComments,
  faEraser,
  faFileLines,
  faFlag,
  faGear,
  faGrid2Plus,
  faHouse,
  faInbox,
  faListCheck,
  faMagnifyingGlass,
  faRectangleHistory,
  faSliders,
  faUserLock,
  faUsers,
  faChartBar,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { NavItem } from './types';

/**
 * Per-product nav arrays mirroring HALO_LeftNav variants in Figma.
 * Pass to DatasitePrototypeShell as `navItems`, or extend with
 * `navItems={[...diligenceNavItems, myItem]}`.
 *
 * Icons are FA Pro Light/Solid matching HALO_LeftNav variants in Figma node 25979:42723.
 */

export const homeNavItems: NavItem[] = [
  { label: 'Home',         icon: <FontAwesomeIcon icon={faHouse} />,            active: true },
  { label: 'Projects',     icon: <FontAwesomeIcon icon={faRectangleHistory} /> },
  { label: 'Marketplace',  icon: <FontAwesomeIcon icon={faGrid2Plus} /> },
  { label: 'My Documents', icon: <FontAwesomeIcon icon={faFileLines} /> },
];

export const diligenceNavItems: NavItem[] = [
  { label: 'Dashboard', icon: <FontAwesomeIcon icon={faChartBar} /> },
  { label: 'Documents', icon: <FontAwesomeIcon icon={faFileLines} />, active: true },
  { label: 'Trackers',  icon: <FontAwesomeIcon icon={faListCheck} /> },
  { label: 'Q&A',       icon: <FontAwesomeIcon icon={faComments} /> },
  { label: 'Users',     icon: <FontAwesomeIcon icon={faUsers} /> },
  { label: 'Archives',  icon: <FontAwesomeIcon icon={faCabinetFiling} /> },
  { label: 'Settings',  icon: <FontAwesomeIcon icon={faGear} /> },
];

export const acquireNavItems: NavItem[] = [
  { label: 'Dashboard', icon: <FontAwesomeIcon icon={faChartBar} />,    active: true },
  { label: 'Documents', icon: <FontAwesomeIcon icon={faFileLines} /> },
  { label: 'Trackers',  icon: <FontAwesomeIcon icon={faListCheck} /> },
  { label: 'Q&A',       icon: <FontAwesomeIcon icon={faComments} /> },
  { label: 'Findings',  icon: <FontAwesomeIcon icon={faFlag} /> },
  { label: 'Users',     icon: <FontAwesomeIcon icon={faUsers} /> },
  { label: 'Archives',  icon: <FontAwesomeIcon icon={faCabinetFiling} /> },
  { label: 'Settings',  icon: <FontAwesomeIcon icon={faGear} /> },
];

export const pipelineNavItems: NavItem[] = [
  { label: 'Dashboard', icon: <FontAwesomeIcon icon={faChartBar} />,    active: true },
  { label: 'Documents', icon: <FontAwesomeIcon icon={faFileLines} /> },
  { label: 'Trackers',  icon: <FontAwesomeIcon icon={faListCheck} /> },
  { label: 'Inbox',     icon: <FontAwesomeIcon icon={faInbox} /> },
  { label: 'Contacts',  icon: <FontAwesomeIcon icon={faAddressBook} /> },
  { label: 'Users',     icon: <FontAwesomeIcon icon={faUsers} /> },
  { label: 'Settings',  icon: <FontAwesomeIcon icon={faGear} /> },
];

export const prepareNavItems: NavItem[] = [
  { label: 'Dashboard',            icon: <FontAwesomeIcon icon={faChartBar} />, active: true },
  { label: 'Documents',            icon: <FontAwesomeIcon icon={faFileLines} /> },
  { label: 'Search',               icon: <FontAwesomeIcon icon={faMagnifyingGlass} /> },
  { label: 'Trackers',             icon: <FontAwesomeIcon icon={faListCheck} /> },
  { label: 'Users',                icon: <FontAwesomeIcon icon={faUsers} /> },
  { label: 'Permissions',          icon: <FontAwesomeIcon icon={faUserLock} /> },
  { label: 'Redaction',            icon: <FontAwesomeIcon icon={faEraser} /> },
  { label: 'Settings',             icon: <FontAwesomeIcon icon={faGear} /> },
  { label: 'Discover',             icon: <FontAwesomeIcon icon={faCompass} /> },
  { label: 'Upgrade to Diligence', icon: <FontAwesomeIcon icon={faArrowTrendUp} /> },
];

export const archiveNavItems: NavItem[] = [
  { label: 'Documents', icon: <FontAwesomeIcon icon={faFileLines} />, active: true },
  { label: 'Trackers',  icon: <FontAwesomeIcon icon={faListCheck} /> },
  { label: 'Q&A',       icon: <FontAwesomeIcon icon={faComments} /> },
  { label: 'Users',     icon: <FontAwesomeIcon icon={faUsers} /> },
  { label: 'Options',   icon: <FontAwesomeIcon icon={faSliders} /> },
];

export const navItemsByProductMode = {
  home: homeNavItems,
  diligence: diligenceNavItems,
  acquire: acquireNavItems,
  pipeline: pipelineNavItems,
  prepare: prepareNavItems,
  archive: archiveNavItems,
} as const;

export type ProductMode = keyof typeof navItemsByProductMode;

export const productDisplayName: Partial<Record<ProductMode, string>> = {
  diligence: 'Datasite',
  acquire: 'Acquire',
  pipeline: 'Pipeline',
  prepare: 'Prepare',
  archive: 'Archive',
};

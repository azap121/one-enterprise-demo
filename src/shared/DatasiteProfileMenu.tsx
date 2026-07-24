import { faCheck } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  Divider,
  Link as MuiLink,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
  Typography,
} from '@mui/material';
import { HaloAvatar } from '~/theme/halo/components';

export interface DatasiteSubscription {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export interface DatasiteHelpItem {
  label: string;
  onClick?: () => void;
}

export interface DatasiteProfileMenuProps {
  user: { name: string; initials?: string; avatarUrl?: string };
  onClose?: () => void;
  onEditProfile?: () => void;
  subscriptions?: DatasiteSubscription[];
  showViewAllSubscriptions?: boolean;
  onViewAllSubscriptions?: () => void;
  help?: DatasiteHelpItem[];
  onSettings?: () => void;
  onLogOut?: () => void;
}

const defaultSubscriptions: DatasiteSubscription[] = [
  { label: 'OSI Deal Team', active: true },
  { label: 'OSI Leadership' },
];

const defaultHelp: DatasiteHelpItem[] = [
  { label: 'Ask Lana' },
  { label: 'Support Portal' },
  { label: 'Feedback' },
  { label: 'Legal' },
];

/**
 * Profile dropdown matching HALO_Nav_UserMenu (Figma node 25988:12098, April 2026).
 * Tokens: white bg, border rgba(25,25,25,0.12), borderRadius 4px, width 220px.
 * Render inside a Popper anchored to the avatar — positioning is the caller's responsibility.
 */
export function DatasiteProfileMenu({
  user,
  onClose,
  onEditProfile,
  subscriptions = defaultSubscriptions,
  showViewAllSubscriptions,
  onViewAllSubscriptions,
  help = defaultHelp,
  onSettings,
  onLogOut,
}: DatasiteProfileMenuProps) {
  const showViewAll = showViewAllSubscriptions ?? false;

  const handle = (cb?: () => void) => () => { onClose?.(); cb?.(); };

  return (
    <Paper
      elevation={0}
      sx={{
        width: 220,
        pb: '8px',
        pt: '4px',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '4px',
      }}>

      {/* User header — HaloAvatar large (48px) */}
      <Box sx={{ px: '16px', py: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <HaloAvatar src={user.avatarUrl} size="md" sx={{ flexShrink: 0 }}>
          {!user.avatarUrl && (user.initials ?? user.name.slice(0, 2).toUpperCase())}
        </HaloAvatar>
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Typography
            variant="body2"
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name}
          </Typography>
          <MuiLink
            component="button"
            type="button"
            onClick={handle(onEditProfile)}
            sx={{
              typography: 'caption',
              color: 'text.secondary',
              textDecoration: 'none',
              background: 'none',
              border: 0,
              p: 0,
              cursor: onEditProfile ? 'pointer' : 'default',
              '&:hover': onEditProfile ? { textDecoration: 'underline' } : {},
            }}>
            Edit profile
          </MuiLink>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'background.defaultAlt' }} />

      <ListSubheader disableSticky sx={{ bgcolor: 'transparent', lineHeight: '36px' }}>Subscriptions</ListSubheader>
      <List dense disablePadding>
        {subscriptions.map((sub) => (
          <ListItem key={sub.label} disablePadding>
            <ListItemButton onClick={handle(sub.onClick)} sx={{ px: '16px', py: '8px' }}>
              <ListItemText
                primary={sub.label}
                primaryTypographyProps={{ variant: 'body2' }}
              />
              {sub.active && (
                <Box sx={{ color: 'text.primary', fontSize: 14, flexShrink: 0 }}>
                  <FontAwesomeIcon icon={faCheck} />
                </Box>
              )}
            </ListItemButton>
          </ListItem>
        ))}
        {showViewAll && (
          <ListItem disablePadding>
            <ListItemButton onClick={handle(onViewAllSubscriptions)} sx={{ px: '16px', py: '8px' }}>
              <ListItemText
                primary="View All"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      <Divider sx={{ borderColor: 'background.defaultAlt' }} />

      <ListSubheader disableSticky sx={{ bgcolor: 'transparent', lineHeight: '36px' }}>Help</ListSubheader>
      <List dense disablePadding>
        {help.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={handle(item.onClick)} sx={{ px: '16px', py: '8px' }}>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'background.defaultAlt' }} />

      <List dense disablePadding>
        <ListItem disablePadding>
          <ListItemButton onClick={handle(onSettings)} sx={{ px: '16px', py: '8px' }}>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ borderColor: 'background.defaultAlt' }} />

      <List dense disablePadding>
        <ListItem disablePadding>
          <ListItemButton onClick={handle(onLogOut)} sx={{ px: '16px', py: '8px' }}>
            <ListItemText
              primary="Log out"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Paper>
  );
}


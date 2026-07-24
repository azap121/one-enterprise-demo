/**
 * SearchSpotlight — pill input + results dropdown over MUI backdrop.
 *
 * Idle state:  recent queries (clock icon) + recent files/folders
 * Query state: live suggestions (magnifying glass icon) + recent files/folders
 */
import {
  faArrowUpFromBracket,
  faBell,
  faBoxArchive,
  faChartBar,
  faChartLine,
  faChartSimple,
  faClockRotateLeft,
  faCodeCompare,
  faArrowTurnDownLeft,
  faComments,
  faDownload,
  faDroplet,
  faEllipsisVertical,
  faEraser,
  faFileExcel,
  faFileLines,
  faFilePdf,
  faFilePlus,
  faFileSpreadsheet,
  faFileWord,
  faFlask,
  faFolder,
  faFolderOpen,
  faGear,
  faGears,
  faHouse,
  faInbox,
  faLanguage,
  faListCheck,
  faListOl,
  faMagnifyingGlass,
  faMagnifyingGlassPlus,
  faPeopleGroup,
  faRecycle,
  faShieldCheck,
  faSignature,
  faStar,
  faStore,
  faTableColumns,
  faTimeline,
  faUserGear,
  faUserPlus,
  faUsers,
  faXmark,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  Chip,
  Divider,
  Fade,
  IconButton,
  InputAdornment,
  Modal,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { faAiSparkle } from '~/shared/icons/faAiSparkle';
import { emerald, ruby, tanzanite } from '~/theme/halo/theme';

// ─── Mock data ────────────────────────────────────────────────────────────────

const RECENT_QUERIES = [
  'A schedule summarising short-term and long term debt and capital lease obligations of the Business, incl...',
  'What is the total amount of long-term debt for the business',
  'Enhanced Review - Vendor Agreement',
  'Redaction - Employee Agreement - EN.doc',
  'Redaction - Lean_Process_Implementation.docx',
];

// Full suggestions pool — filtered client-side as the user types
const SUGGESTIONS = [
  'Share purchase agreement',
  'Balance sheet summary',
  'Shop revenue analysis',
  'Lease agreement summary',
  'Capital obligations report',
  'Vendor contract review',
  'Long-term debt schedule',
  'Employee agreement redaction',
  'Financial statements 2024',
  'Intellectual property assignments',
  'Material contracts list',
  'Customer concentration analysis',
  'Tax returns due diligence',
  'Environmental compliance reports',
  'Insurance policy summary',
  'Organisational chart',
  'Management accounts Q1',
  'Working capital analysis',
  'Shareholder register',
  'Board minutes 2023',
  'Regulatory approvals',
  'Real estate lease agreements',
  'Litigation and disputes summary',
  'Debt instruments schedule',
  'Pension and benefits overview',
  'Revenue recognition policy',
  'Accounts receivable aging report',
  'Change of control provisions',
  'Non-disclosure agreement',
  'Representations and warranties',
];

// Shown when query starts with "+" — creation/add actions
const ADD_ACTIONS = [
  { label: 'New documents',  icon: faFilePlus           },
  { label: 'Upload',         icon: faArrowUpFromBracket },
  { label: 'Add user',       icon: faUserPlus           },
  { label: 'Add team',       icon: faPeopleGroup        },
  { label: 'E-Signature',    icon: faSignature          },
  { label: 'Translate',      icon: faLanguage           },
];

// Shown when query starts with "/" — navigational actions
const ACTIONS = [
  { label: 'Documents',     icon: faFileLines },
  { label: 'Users',         icon: faUsers     },
  { label: 'Permissions',   icon: faUserGear  },
  { label: 'New documents', icon: faFilePlus  },
  { label: 'Q&A',           icon: faComments  },
  { label: 'Add user',      icon: faUserPlus  },
];

// All navigable pages/sections — mixed into typeahead results
const NAV_ITEMS = [
  { label: 'Home',                     icon: faHouse              },
  { label: 'Documents',                icon: faFileLines          },
  { label: 'Projects',                 icon: faFolderOpen         },
  { label: 'Marketplace',              icon: faStore              },
  { label: 'Dashboard',                icon: faTableColumns       },
  { label: 'Trackers',                 icon: faListCheck          },
  { label: 'Q&A',                      icon: faComments           },
  { label: 'Users',                    icon: faUsers              },
  { label: 'Permissions',              icon: faShieldCheck        },
  { label: 'Redaction',                icon: faEraser             },
  { label: 'Archive',                  icon: faBoxArchive         },
  { label: 'My Archive',               icon: faBoxArchive         },
  { label: 'Analytics',                icon: faChartBar           },
  { label: 'Settings',                 icon: faGear               },
  { label: 'New documents',            icon: faFilePlus           },
  { label: 'Inbox',                    icon: faInbox              },
  { label: 'Favorites',                icon: faStar               },
  { label: 'Action required',          icon: faBell               },
  { label: 'Downloads',                icon: faDownload           },
  { label: 'Recycle',                  icon: faRecycle            },
  { label: 'Teams',                    icon: faPeopleGroup        },
  { label: 'Blueflame deep research',  icon: faMagnifyingGlassPlus },
  { label: 'Translate',                icon: faLanguage           },
  { label: 'Rapid Redact',             icon: faEraser             },
  { label: 'Watermarking',             icon: faDroplet            },
  { label: 'CIM Summary',              icon: faFileSpreadsheet    },
  { label: 'Document comparison',      icon: faCodeCompare        },
  { label: 'Convert to Excel',         icon: faFileExcel          },
  { label: 'E-Signature',              icon: faSignature          },
  { label: 'Upload',                   icon: faArrowUpFromBracket },
  { label: 'Add user',                 icon: faUserPlus           },
  { label: 'Add team',                 icon: faPeopleGroup        },
  { label: 'Q&A Settings',             icon: faGears              },
  { label: 'Index',                    icon: faListOl             },
  { label: 'Sandbox',                  icon: faFlask              },
  { label: 'Document Change History',  icon: faTimeline           },
  { label: 'Activity Overview',        icon: faChartSimple        },
  { label: 'Trackers',                 icon: faChartLine          },
];

interface RecentItem {
  name: string;
  type: 'pdf' | 'xlsx' | 'docx' | 'folder';
  tag?: string;
}

const RECENT_FILES: RecentItem[] = [
  { name: 'Generic-direct-depositauthorization.pdf', type: 'pdf' },
  { name: 'Statement of Earnings.xls', type: 'xlsx' },
  { name: 'Leasehold_Improvements.docx', type: 'docx' },
  { name: 'Leases',          type: 'folder', tag: 'Property Records' },
  { name: 'Contracts',       type: 'folder', tag: 'Management' },
  { name: 'Material Assets', type: 'folder' },
];

const FILE_ICON = {
  pdf:    { icon: faFilePdf,   color: ruby[600]      },
  xlsx:   { icon: faFileExcel, color: emerald[600]   },
  docx:   { icon: faFileWord,  color: tanzanite[600] },
  folder: { icon: faFolder,    color: 'text.secondary' as const },
};

// ─── Public API ───────────────────────────────────────────────────────────────

export interface SearchSpotlightProps {
  open: boolean;
  projectName?: string;
  initialQuery?: string;
  onClose: () => void;
  onSearch: (query: string) => void;
  onAskBlueflame?: (query: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchSpotlight({
  open,
  projectName = 'Sanoma Project',
  initialQuery = '',
  onClose,
  onSearch,
  onAskBlueflame,
}: SearchSpotlightProps) {
  const [query, setQuery] = useState(initialQuery);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setFocusedIndex(-1);
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open, initialQuery]);

  // Reset selection whenever the query changes so nothing is pre-highlighted
  useEffect(() => { setFocusedIndex(-1); }, [query]);

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    onSearch(trimmed);
    onClose();
  };

  const handleSuggestion = (text: string) => {
    onSearch(text);
    onClose();
  };

  const isSlashMode = query.startsWith('/');
  const isAddMode = query.startsWith('+');
  const isCommandMode = isSlashMode || isAddMode;
  const hasQuery = !isCommandMode && query.length > 0;
  const q = query.toLowerCase();

  // Top section: recents → nav items → suggestions
  const filteredRecents = hasQuery
    ? RECENT_QUERIES.filter((r) => r.toLowerCase().includes(q)).slice(0, 3)
    : RECENT_QUERIES;

  const filteredNavItems = hasQuery
    ? NAV_ITEMS.filter((n) => n.label.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const usedLabels = new Set([
    ...filteredRecents.map((r) => r.toLowerCase()),
    ...filteredNavItems.map((n) => n.label.toLowerCase()),
  ]);
  const filteredSuggestions = hasQuery
    ? SUGGESTIONS
        .filter((s) => s.toLowerCase().includes(q) && !usedLabels.has(s.toLowerCase()))
        .slice(0, Math.max(0, 5 - filteredRecents.length - filteredNavItems.length))
    : [];

  // Bottom section: filter files + folders by name or tag
  const filteredFiles = hasQuery
    ? RECENT_FILES.filter((f) => f.name.toLowerCase().includes(q) || f.tag?.toLowerCase().includes(q))
    : RECENT_FILES;

  // Flat ordered list for keyboard nav
  const topItems: Array<() => void> = isSlashMode
    ? ACTIONS.map((a) => () => handleSuggestion(a.label))
    : isAddMode
    ? ADD_ACTIONS.map((a) => () => handleSuggestion(a.label))
    : [
        ...filteredRecents.map((r) => () => handleSuggestion(r)),
        ...filteredNavItems.map((n) => () => handleSuggestion(n.label)),
        ...filteredSuggestions.map((s) => () => handleSuggestion(s)),
      ];
  const fileItems = filteredFiles.map((f) => () => handleSuggestion(f.name));
  const aiItem = query.length > 0 ? [() => { onAskBlueflame?.(query); onClose(); }] : [];
  const allItems = [...topItems, ...fileItems, ...aiItem];
  const topCount = topItems.length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slotProps={{ backdrop: { style: { backgroundColor: 'rgba(0,0,0,0.35)' } } }}
      sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', pt: '162px' }}>
      <Fade in={open} timeout={150}>
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{ width: '100%', maxWidth: 660, mx: 2, outline: 'none' }}>

          {/* ── Pill input ── */}
          <TextField
            inputRef={inputRef}
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Start typing to ask or search for anything"
            inputProps={{
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setFocusedIndex((i) => (i + 1) % allItems.length);
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setFocusedIndex((i) => (i <= 0 ? allItems.length - 1 : i - 1));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  if (focusedIndex >= 0 && focusedIndex < allItems.length) {
                    allItems[focusedIndex]();
                  } else {
                    handleSubmit();
                  }
                } else if (e.key === 'Escape') {
                  onClose();
                }
              },
              style: {
                fontFamily: 'Figtree, system-ui, sans-serif',
                fontSize: 20,
                fontWeight: 400,
                lineHeight: '24px',
                letterSpacing: '0.15px',
                padding: '10px 4px 10px 0',
                color: 'inherit',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '100px',
                bgcolor: 'background.paper',
                boxShadow: 16,
                pl: '24px',
                pr: '8px',
                color: 'text.primary',
                '& fieldset': { borderColor: 'divider', borderWidth: '1px', borderRadius: '100px' },
                '&:hover fieldset': { borderColor: 'text.disabled', borderRadius: '100px' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px', borderRadius: '100px' },
                '& input::placeholder': { color: 'text.secondary', opacity: 1 },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ ml: 0, gap: '4px', display: 'flex', alignItems: 'center' }}>
                  {query.length > 0 && (
                    <IconButton
                      onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                      aria-label="Clear search"
                      sx={{
                        width: 32, height: 32, borderRadius: '100px',
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                      }}>
                      <FontAwesomeIcon icon={faXmark} style={{ fontSize: 15 }} />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={handleSubmit}
                    aria-label="Search"
                    sx={{
                      width: 36, height: 36, borderRadius: '100px',
                      transition: 'background-color 150ms ease, color 150ms ease',
                      ...(hasQuery
                        ? { bgcolor: 'primary.main', color: 'common.white', '&:hover': { bgcolor: 'primary.dark' } }
                        : { bgcolor: 'action.disabledBackground', color: 'text.secondary', '&:hover': { bgcolor: 'action.focus' } }
                      ),
                    }}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* ── Results dropdown — hidden until user starts typing ── */}
          {query.length > 0 && <Box
            sx={{
              mt: '8px',
              mx: '24px',
              bgcolor: 'background.paper',
              borderRadius: '4px',
              boxShadow: 16,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              position: 'relative',
              zIndex: 1,
            }}>

            {/* Command mode (/ or +) OR filtered recents + nav + suggestions */}
            <Stack sx={{ pt: '4px', pb: '4px' }}>
              {isSlashMode ? (
                ACTIONS.map((action, i) => (
                  <Row
                    key={action.label}
                    icon={<FontAwesomeIcon icon={action.icon} style={{ fontSize: 14 }} />}
                    label={action.label}
                    focused={focusedIndex === i}
                    onClick={() => handleSuggestion(action.label)}
                    onMouseEnter={() => setFocusedIndex(i)}
                  />
                ))
              ) : isAddMode ? (
                ADD_ACTIONS.map((action, i) => (
                  <Row
                    key={action.label}
                    icon={<FontAwesomeIcon icon={action.icon} style={{ fontSize: 14 }} />}
                    label={action.label}
                    focused={focusedIndex === i}
                    onClick={() => handleSuggestion(action.label)}
                    onMouseEnter={() => setFocusedIndex(i)}
                  />
                ))
              ) : (
                <>
                  {filteredRecents.map((r, i) => (
                    <Row
                      key={r}
                      icon={<FontAwesomeIcon icon={faClockRotateLeft} style={{ fontSize: 14 }} />}
                      label={r}
                      focused={focusedIndex === i}
                      onClick={() => handleSuggestion(r)}
                      onMouseEnter={() => setFocusedIndex(i)}
                    />
                  ))}
                  {filteredNavItems.map((n, i) => (
                    <Row
                      key={n.label}
                      icon={<FontAwesomeIcon icon={n.icon} style={{ fontSize: 14 }} />}
                      label={n.label}
                      focused={focusedIndex === filteredRecents.length + i}
                      onClick={() => handleSuggestion(n.label)}
                      onMouseEnter={() => setFocusedIndex(filteredRecents.length + i)}
                    />
                  ))}
                  {filteredSuggestions.map((s, i) => (
                    <Row
                      key={s}
                      icon={<FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 14 }} />}
                      label={s}
                      focused={focusedIndex === filteredRecents.length + filteredNavItems.length + i}
                      onClick={() => handleSuggestion(s)}
                      onMouseEnter={() => setFocusedIndex(filteredRecents.length + filteredNavItems.length + i)}
                    />
                  ))}
                </>
              )}
            </Stack>

            {filteredFiles.length > 0 && <Divider />}

            {/* Recent files & folders — hidden when query returns no file matches */}
            {filteredFiles.length > 0 && <Box sx={{ pb: '8px' }}>
              <Typography
                variant="body2"
                sx={{ px: '20px', pt: '12px', pb: '4px', color: 'text.secondary' }}>
                Find a recent file or folder
              </Typography>

              {filteredFiles.map((item, i) => {
                const { icon, color } = FILE_ICON[item.type];
                const isFocused = focusedIndex === topCount + i;
                return (
                  <Stack
                    key={item.name}
                    component="button"
                    direction="row"
                    alignItems="center"
                    gap={1.5}
                    onClick={() => handleSuggestion(item.name)}
                    onMouseEnter={() => setFocusedIndex(topCount + i)}
                    sx={{
                      px: '20px', py: '8px',
                      width: '100%', border: 'none',
                      bgcolor: isFocused ? 'action.hover' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', WebkitAppearance: 'none',
                      '&:hover': { bgcolor: 'action.hover' },
                      '&:hover .overflow-btn': { opacity: 1 },
                      ...(isFocused && { '& .overflow-btn': { opacity: 1 } }),
                    }}>
                    <Box sx={{ color, flexShrink: 0, fontSize: 15, width: 18, textAlign: 'center' }}>
                      <FontAwesomeIcon icon={icon} />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </Typography>
                    {item.tag && (
                      <Chip
                        label={item.tag}
                        size="small"
                        icon={<FontAwesomeIcon icon={faFolder} style={{ fontSize: 10, marginLeft: 6 }} />}
                        sx={{
                          height: 22, fontSize: 11, fontWeight: 400,
                          bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider',
                          flexShrink: 0, '& .MuiChip-label': { pl: '4px' },
                        }}
                      />
                    )}
                    <IconButton
                      className="overflow-btn"
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                      sx={{ width: 24, height: 24, p: 0, opacity: 0, flexShrink: 0, transition: 'opacity 120ms' }}
                      aria-label={`More options for ${item.name}`}>
                      <FontAwesomeIcon icon={faEllipsisVertical} style={{ fontSize: 13 }} />
                    </IconButton>
                  </Stack>
                );
              })}
            </Box>}

            {/* ── Datasite AI section — always shown ── */}
            <Divider />
            <Box sx={{ pb: '4px' }}>
              <Typography variant="overline" sx={{ px: '20px', pt: '10px', pb: '2px', color: 'text.disabled', display: 'block', fontSize: 10, letterSpacing: '0.08em' }}>
                Datasite AI
              </Typography>
              <Row
                icon={<FontAwesomeIcon icon={faAiSparkle as unknown as any} style={{ fontSize: 14, color: '#D95E1B' }} />}
                label={`Ask Blueflame about "${query}"`}
                focused={focusedIndex === topItems.length + fileItems.length}
                onClick={() => { onAskBlueflame?.(query); onClose(); }}
                onMouseEnter={() => setFocusedIndex(topItems.length + fileItems.length)}
              />
            </Box>
          </Box>}

        </Box>
      </Fade>
    </Modal>
  );
}

// ─── Row helper ───────────────────────────────────────────────────────────────

function Row({ icon, label, onClick, focused, onMouseEnter }: { icon: React.ReactNode; label: string; onClick: () => void; focused?: boolean; onMouseEnter?: () => void }) {
  return (
    <Stack
      component="button"
      direction="row"
      alignItems="center"
      gap={1.5}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      sx={{
        px: '20px', py: '9px',
        border: 'none', bgcolor: focused ? 'action.hover' : 'transparent',
        cursor: 'pointer', textAlign: 'left', WebkitAppearance: 'none', width: '100%',
        color: 'text.primary',
        '&:hover': { bgcolor: 'action.hover' },
        '&:hover .enter-btn': { opacity: 1 },
        ...(focused && { '& .enter-btn': { opacity: 1 } }),
      }}>
      <Box sx={{ color: 'text.secondary', flexShrink: 0, width: 18, textAlign: 'center' }}>
        {icon}
      </Box>
      <Typography
        variant="body2"
        sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
      <Box
        className="enter-btn"
        sx={{
          opacity: 0,
          width: 24, height: 24,
          borderRadius: '4px',
          bgcolor: 'primary.main',
          color: 'common.white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'opacity 120ms',
        }}>
        <FontAwesomeIcon icon={faArrowTurnDownLeft} style={{ fontSize: 11 }} />
      </Box>
    </Stack>
  );
}

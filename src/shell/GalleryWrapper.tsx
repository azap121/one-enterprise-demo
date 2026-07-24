import { faAngleDown, faChartLine, faHouse, faMoon, faSun } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Chip, Divider, Menu, MenuItem } from '@mui/material';
import { useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { registry } from '~/projects/registry';
import { useThemeMode } from '~/theme/ThemeModeContext';
import { computeBreadcrumb } from './breadcrumb';
import { useGalleryFilters } from './hooks/useGalleryFilters';
import type { DisciplineFilter } from './filterPrototypes';
import './chrome.css';

const DESIGNERS = Array.from(new Set(registry.map((p) => p.designer))).sort();

const DISCIPLINE_LABELS: Record<DisciplineFilter, string> = {
  product: 'Product Design',
  information: 'Information Design',
  documentation: 'Halo Documentation',
  hidden: 'Hidden',
  all: 'All Artefacts',
};

export function GalleryWrapper() {
  const { pathname, search } = useLocation();
  const { segments } = computeBreadcrumb(pathname, registry, search);
  const { mode, toggle } = useThemeMode();
  const { state, setDesigner, setDiscipline } = useGalleryFilters();
  const activeEntry = registry.find((entry) => {
    const prefix = entry.type === 'project' ? 'projects' : 'labs';
    return pathname === `/${prefix}/${entry.slug}`;
  });
  const isChromeless = Boolean(activeEntry?.chromeless);
  const isActivityPage = pathname === '/activity';

  const disciplineRef = useRef<HTMLDivElement>(null);
  const [disciplineMenuOpen, setDisciplineMenuOpen] = useState(false);

  const chipRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const disciplineLabel = DISCIPLINE_LABELS[state.discipline] ?? 'Product Design';

  const chipSx = {
    fontSize: '0.8125rem',
    height: 26,
    borderColor: 'var(--dsg-chip-border, rgba(0,0,0,0.23))',
    color: 'var(--dsg-chrome-fg, #4E4E4D)',
    bgcolor: 'transparent',
    '& .MuiChip-label': { px: 1.25 },
    '&:hover': { bgcolor: 'var(--dsg-chrome-toggle-hover, rgba(0,0,0,0.07))' },
  };

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {!isChromeless && (
        <div className="dsg-chrome-wrap">
          <nav className="dsg-chrome" aria-label="Gallery navigation">
            <div className="dsg-crumbs">
              {segments.map((seg, i) => (
                <span key={i}>
                  {i > 0 && <span className="dsg-crumb-sep">/</span>}{' '}
                  {seg.href ? (
                    <Link to={seg.href}>
                      {i === 0 && <FontAwesomeIcon icon={faHouse} style={{ fontSize: 12 }} />}
                      {seg.label}
                    </Link>
                  ) : (
                    <>
                      {i === 0 && <FontAwesomeIcon icon={faHouse} style={{ fontSize: 12, marginRight: 4 }} />}
                      <strong>{seg.label}</strong>
                    </>
                  )}
                </span>
              ))}
            </div>

            <div className="dsg-chrome-actions">
              {!isActivityPage && (
                <>
                  {/* Discipline filter */}
                  <Chip
                    ref={disciplineRef}
                    size="small"
                    variant="outlined"
                    label={
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {disciplineLabel}
                        <FontAwesomeIcon icon={faAngleDown} style={{ fontSize: 9 }} />
                      </span>
                    }
                    onClick={() => setDisciplineMenuOpen(true)}
                    sx={chipSx}
                  />
                  <Menu
                    open={disciplineMenuOpen}
                    anchorEl={disciplineRef.current}
                    onClose={() => setDisciplineMenuOpen(false)}
                    PaperProps={{ sx: { mt: 0.5, minWidth: 180 } }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <MenuItem
                      dense
                      selected={state.discipline === 'all'}
                      onClick={() => { setDiscipline('all'); setDisciplineMenuOpen(false); }}>
                      All Artefacts
                    </MenuItem>
                    <Divider />
                    {(['product', 'information', 'documentation'] as const).map((d) => (
                      <MenuItem
                        key={d}
                        dense
                        selected={state.discipline === d}
                        onClick={() => { setDiscipline(d); setDisciplineMenuOpen(false); }}>
                        {DISCIPLINE_LABELS[d]}
                      </MenuItem>
                    ))}
                    <Divider />
                    <MenuItem
                      dense
                      selected={state.discipline === 'hidden'}
                      onClick={() => { setDiscipline('hidden'); setDisciplineMenuOpen(false); }}>
                      Hidden
                    </MenuItem>
                  </Menu>

                  {/* Designer filter */}
                  <Chip
                    ref={chipRef}
                    size="small"
                    variant="outlined"
                    label={
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {state.designer === 'all' ? 'Everyone' : state.designer}
                        <FontAwesomeIcon icon={faAngleDown} style={{ fontSize: 9 }} />
                      </span>
                    }
                    onClick={() => setMenuOpen(true)}
                    sx={chipSx}
                  />
                  <Menu
                    open={menuOpen}
                    anchorEl={chipRef.current}
                    onClose={() => setMenuOpen(false)}
                    PaperProps={{ sx: { mt: 0.5, minWidth: 160 } }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <MenuItem
                      dense
                      selected={state.designer === 'all'}
                      onClick={() => { setDesigner('all'); setMenuOpen(false); }}>
                      Everyone
                    </MenuItem>
                    <Divider />
                    {DESIGNERS.map((d) => (
                      <MenuItem
                        key={d}
                        dense
                        selected={state.designer === d}
                        onClick={() => { setDesigner(d); setMenuOpen(false); }}>
                        {d}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              <Link to="/activity" className="dsg-mode-toggle" title="Activity" aria-label="Activity">
                <FontAwesomeIcon icon={faChartLine} />
              </Link>
              <span className="dsg-sep-v" />

              <button
                type="button"
                className="dsg-mode-toggle"
                onClick={toggle}
                aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                <FontAwesomeIcon icon={mode === 'dark' ? faSun : faMoon} />
              </button>
            </div>
          </nav>
        </div>
      )}
      <Box component="main" sx={{ flex: 1, minHeight: 0, overflow: isChromeless ? 'hidden' : 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
}

import {
  faBookOpen,
  faDiagramProject,
  faEye,
  faPenRuler,
  faXmark,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { HaloDialog } from '~/theme/halo/components/HaloDialog';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registry } from '~/projects/registry';
import type { PrototypeDiscipline } from '~/projects/types';
import { HaloChip } from '~/theme/halo/components';
import type { DisciplineFilter, TypeFilter } from './filterPrototypes';
import { filterPrototypes, sortPrototypes } from './filterPrototypes';
import { useGalleryFilters } from './hooks/useGalleryFilters';
import { useHiddenPrototypes } from './hooks/useHiddenPrototypes';

const DISCIPLINE_ICON: Record<PrototypeDiscipline, typeof faPenRuler> = {
  product: faPenRuler,
  information: faDiagramProject,
  documentation: faBookOpen,
};

const DISCIPLINE_LABEL: Record<PrototypeDiscipline, string> = {
  product: 'Product Design',
  information: 'Information Design',
  documentation: 'Documentation',
};

const SUBTITLE: Record<DisciplineFilter, string> = {
  product: 'Product Design Artefacts',
  information: 'Information Design Artefacts',
  documentation: 'Design Documentation',
  hidden: 'Hidden Artefacts',
  all: 'Design Artefacts',
};

interface DialogState {
  open: boolean;
  slug: string;
  mode: 'hide' | 'show';
}

export function GalleryHome() {
  const { state } = useGalleryFilters();
  const { hidden, hideSlug, showSlug } = useHiddenPrototypes();
  const [dialog, setDialog] = useState<DialogState>({ open: false, slug: '', mode: 'hide' });

  const isHiddenView = state.discipline === 'hidden';

  const filtered = isHiddenView
    ? sortPrototypes(registry.filter((p) => hidden.has(p.slug)), 'updated')
    : sortPrototypes(
        filterPrototypes(registry, { ...state, q: '', type: 'all' as TypeFilter }).filter(
          (p) => !hidden.has(p.slug),
        ),
        'updated',
      );

  function openDialog(mode: 'hide' | 'show', slug: string) {
    setDialog({ open: true, slug, mode });
  }

  function closeDialog() {
    setDialog((prev) => ({ ...prev, open: false }));
  }

  function confirmDialog() {
    if (dialog.mode === 'hide') hideSlug(dialog.slug);
    else showSlug(dialog.slug);
    closeDialog();
  }

  return (
    <Box sx={{ bgcolor: 'background.defaultAlt', minHeight: '100%' }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h1" component="h1" sx={{ mb: 0.5 }}>Halo</Typography>
          <Typography variant="h5" component="p" color="text.secondary" sx={{ fontWeight: 400 }}>
            {SUBTITLE[state.discipline]}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          }}>
          {filtered.map((p) => (
            <Card key={p.slug} variant="outlined" sx={{ position: 'relative' }}>
              <CardActionArea
                component={Link}
                to={`/${p.type === 'project' ? 'projects' : 'labs'}/${p.slug}`}
                sx={{ height: '100%', alignItems: 'flex-start' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', pr: 5 }}>
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                      mb: 1,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}>
                    {p.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, flex: 1 }}>
                    {p.description}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                    <Tooltip title={DISCIPLINE_LABEL[p.discipline]} arrow placement="top">
                      <HaloChip
                        size="small"
                        label={
                          <FontAwesomeIcon
                            icon={DISCIPLINE_ICON[p.discipline]}
                            style={{ fontSize: 11 }}
                          />
                        }
                        sx={{ minWidth: 30, '& .MuiChip-label': { px: 0.75, display: 'flex', alignItems: 'center' } }}
                      />
                    </Tooltip>
                    <HaloChip size="small" label={p.designer} />
                  </Stack>
                </CardContent>
              </CardActionArea>

              {/* Hide / Show button */}
              <IconButton
                size="small"
                aria-label={isHiddenView ? 'Show artefact' : 'Hide artefact'}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openDialog(isHiddenView ? 'show' : 'hide', p.slug);
                }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  width: 26,
                  height: 26,
                  color: 'text.disabled',
                  '&:hover': { color: 'text.secondary', bgcolor: 'action.hover' },
                }}>
                <FontAwesomeIcon icon={isHiddenView ? faEye : faXmark} style={{ fontSize: 12 }} />
              </IconButton>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Hide dialog — caution variant (red tint) */}
      <HaloDialog
        open={dialog.open && dialog.mode === 'hide'}
        onClose={closeDialog}
        title="Do you really want to hide me?"
        variant="caution"
        actions={
          <>
            <Button variant="outlined" onClick={closeDialog}>Let's keep it</Button>
            <Button
              variant="contained"
              onClick={confirmDialog}
              sx={{ bgcolor: '#C02641', '&:hover': { bgcolor: '#a01e35' } }}>
              Hide this puppy
            </Button>
          </>
        }>
        <Typography variant="body2" color="text.secondary">
          Don't worry all is not lost! The artefact is only being hidden from this page. Hidden artefacts can be found under the category menu.
        </Typography>
      </HaloDialog>

      {/* Show dialog — success variant (jade/green tint override) */}
      <HaloDialog
        open={dialog.open && dialog.mode === 'show'}
        onClose={closeDialog}
        title="Show me the artefact!"
        variant="success"
        actions={
          <>
            <Button variant="outlined" onClick={closeDialog}>Let's keep it a secret!</Button>
            <Button
              variant="contained"
              onClick={confirmDialog}
              color="success">
              It's show time
            </Button>
          </>
        }>
        <Typography variant="body2" color="text.secondary">
          Let's get this show back on the road! Show your artefact on the main stage. Share your work for all of the world to see!
        </Typography>
      </HaloDialog>
    </Box>
  );
}

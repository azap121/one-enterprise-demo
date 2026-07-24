import { useMemo } from 'react';
import { Box } from '@mui/material';
import { DatasitePrototypeShell, diligenceNavItems } from '~/shared';
import { useEnhancedIndexStore } from './state/store';
import FileRoomSurface from './components/FileRoomSurface';
import EnhancedIndexRoute from './components/EnhancedIndexRoute';

export default function EnhancedIndexV2() {
  const store = useEnhancedIndexStore();
  const navItems = useMemo(() => {
    return diligenceNavItems.map((item) => ({
      ...item,
      active: item.label === 'Documents',
    }));
  }, []);

  return (
    <DatasitePrototypeShell
      productMode="diligence"
      projectName={store.state.scenario.rootName}
      navItems={navItems}
      defaultExpanded
      sx={{ height: '100%' }}
    >
      <Box sx={{ position: 'relative', height: '100%', minHeight: 0, overflow: 'hidden', bgcolor: 'background.default' }}>
        {store.state.stage === 'closed' && (
          <FileRoomSurface scenario={store.state.scenario} onOpen={store.open} />
        )}
        <EnhancedIndexRoute state={store.state} dispatch={store.dispatch} />
      </Box>
    </DatasitePrototypeShell>
  );
}

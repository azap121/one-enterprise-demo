import { DatasitePrototypeShell } from '~/shared/DatasitePrototypeShell';
import { Box } from '@mui/material';

export function ProductShellPreview() {
  return (
    <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <DatasitePrototypeShell
        productMode="diligence"
        defaultExpanded={false}
        user={{ name: 'Daniel Samuels', initials: 'DS' }}
        projectName="OSI Acquisition"
      >
        <Box />
      </DatasitePrototypeShell>
    </Box>
  );
}

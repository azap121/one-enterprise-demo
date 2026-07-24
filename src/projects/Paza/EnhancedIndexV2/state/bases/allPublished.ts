import type { Scenario, ChangeProposal, TreeNode } from '../types';

const nodes: TreeNode[] = [
  {
    id: 'ap-legal',
    name: 'Legal',
    kind: 'folder',
    publishState: 'published',
    children: [
      { id: 'ap-msa', name: 'MSA.pdf', kind: 'file', publishState: 'published', fileExt: 'pdf' },
    ],
  },
];

const proposals: ChangeProposal[] = [];

export const allPublished: Scenario = {
  id: 'all-published',
  label: 'All published (locked)',
  rootName: 'Locked Deal Room',
  nodes,
  proposals,
  prompt: 'All content is published. Enhanced Index is unavailable in this state.',
  attachmentChip: '0 changes',
};

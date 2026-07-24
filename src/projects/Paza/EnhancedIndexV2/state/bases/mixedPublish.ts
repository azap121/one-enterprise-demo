import type { Scenario, ChangeProposal, TreeNode } from '../types';

const nodes: TreeNode[] = [
  {
    id: 'mp-legal',
    name: 'Legal',
    kind: 'folder',
    publishState: 'published',
    children: [
      { id: 'mp-msa', name: 'MSA.pdf', kind: 'file', publishState: 'published', fileExt: 'pdf' },
    ],
  },
  {
    id: 'mp-finance',
    name: 'Finance docs',
    kind: 'folder',
    publishState: 'not-published',
    children: [
      { id: 'mp-q1', name: 'Q1.xlsx', kind: 'file', publishState: 'not-published', fileExt: 'xlsx' },
      { id: 'mp-q2', name: 'Q2 FINAL v2.xlsx', kind: 'file', publishState: 'not-published', fileExt: 'xlsx' },
    ],
  },
  { id: 'mp-empty', name: 'Stale Drafts', kind: 'folder', publishState: 'not-published', children: [] },
];

const proposals: ChangeProposal[] = [
  {
    id: 'mp-add-1',
    type: 'add-folder',
    name: 'Contracts',
    parentId: 'mp-legal',
    parentPath: ['Legal'],
    description: 'Group MSA and contract docs',
  },
  {
    id: 'mp-rename-1',
    type: 'rename',
    nodeId: 'mp-finance',
    oldName: 'Finance docs',
    newName: 'Financials',
    nodeKind: 'folder',
    parentPath: [],
    reason: 'Match standard section naming',
  },
  {
    id: 'mp-rename-2',
    type: 'rename',
    nodeId: 'mp-q2',
    oldName: 'Q2 FINAL v2.xlsx',
    newName: 'Q2-summary.xlsx',
    nodeKind: 'file',
    parentPath: ['Finance docs'],
    reason: 'Drop version suffix to match convention',
  },
  {
    id: 'mp-move-1',
    type: 'move',
    nodeId: 'mp-msa',
    nodeName: 'MSA.pdf',
    nodeKind: 'file',
    fromParentId: 'mp-legal',
    fromPath: ['Legal'],
    toParentId: 'sug-mp-add-1',
    toPath: ['Legal', 'Contracts'],
    reason: 'Move into Contracts subfolder',
    dependsOn: ['mp-add-1'],
  },
];

export const mixedPublish: Scenario = {
  id: 'mixed-publish',
  label: 'Mixed publish (mirrors Datasite)',
  rootName: 'Datasite Live Room',
  nodes,
  proposals,
  prompt: 'Tidy section names and move loose contracts into a Contracts folder.',
  attachmentChip: '4 changes',
};

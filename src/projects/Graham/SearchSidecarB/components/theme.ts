import { amber } from '~/theme/halo/theme';

// File type icon colors matching the Halo theme
export const FILE_ICON_COLORS = {
  pdf: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' },
  docx: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' },
  xlsx: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)' },
  pptx: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)' },
  xls: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)' },
  default: { color: '#6B7280', bg: 'rgba(107, 116, 128, 0.08)' },
  folder: { color: '#F38932', bg: 'rgba(243, 137, 50, 0.08)' },
} as const;

export const HALO_NAV_ORANGE = amber[600]; // #EF601A

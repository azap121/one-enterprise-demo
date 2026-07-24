// src/projects/types.ts
import type { ComponentType, LazyExoticComponent } from 'react';

export type PrototypeType = 'project' | 'lab';
export type PrototypeDiscipline = 'product' | 'information' | 'documentation';

export interface PrototypeEntry {
  /** Design discipline — product or information */
  discipline: PrototypeDiscipline;
  /** Globally unique URL slug, kebab-case */
  slug: string;
  /** Filter category */
  type: PrototypeType;
  /** Display name; powers the designer filter chip */
  designer: string;
  /** Card title */
  title: string;
  /** 1–2 sentence card description */
  description: string;
  /** YYYY-MM-DD; manually maintained */
  updatedAt: string;
  /** React.lazy(() => import('./Path/To/Folder')) */
  component: LazyExoticComponent<ComponentType<unknown>>;
  /** When true, suppress the shell breadcrumb chrome above this prototype */
  chromeless?: boolean;
  /**
   * Audience(s) this prototype was designed for. Populated by the `audience`
   * skill at Step 2.5 of `halo-prototype-workflow`. Values are kebab-case
   * persona or ICP slugs matching the reference files in
   * `.claude/skills/persona/references/` and `.claude/skills/icp/references/`
   * (e.g. 'daniel', 'daniel-corpdev', 'desmond', 'deborah', 'mcp-icp').
   * Optional — older entries created before audience tagging existed leave this empty.
   */
  audience?: string[];
}

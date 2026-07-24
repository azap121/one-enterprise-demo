import { lazy } from 'react';
import type { PrototypeEntry } from './types';

export const registry: PrototypeEntry[] = [
  {
    slug: 'paza-stifel-deal-assistant',
    type: 'project',
    discipline: 'product',
    designer: 'Paza',
    title: 'Stifel Deal Assistant — Tom & Jaime',
    description:
      'Discovery scaffold for Tom Koula (Associate) & Jaime Bergaz (Analyst): agentic Q&A triage with approval-gated plans, seat switcher, and right-panel evidence canvas. Content placeholder pending Quartet telemetry.',
    updatedAt: '2026-07-16',
    chromeless: true,
    audience: ['daniel'],
    component: lazy(() => import('./Paza/StifelDealAssistant')),
  },
  {
    slug: 'paza-stifel-deal-assistant-chat-first',
    type: 'project',
    discipline: 'product',
    designer: 'Paza',
    title: 'Stifel Deal Assistant — Chat-First (original concept)',
    description:
      'Preserved record of the original chat-front-and-centre concept: Datasite AI chat as the primary workspace with the right-hand context canvas opening alongside it. The pre-v2 layout, kept before the structure-first paradigm pass.',
    updatedAt: '2026-07-20',
    chromeless: true,
    audience: ['daniel'],
    component: lazy(() => import('./Paza/StifelDealAssistantChatFirst')),
  },
];

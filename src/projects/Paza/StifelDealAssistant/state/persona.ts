// Seat model for the Stifel discovery sessions: one prototype, two personas.
// Telemetry (2026-07-16) inverted the original split: the Associate seat does the raw in-room
// operator work; the Analyst seat works ahead of the room (email, Excel, buyer lists).
// The switcher toggles WHERE the work lives relative to the room, not seniority.
//
// Attendee correction (session 2026-07-16): the second attendee was Freddie Hindley (ex-research/PE,
// new to M&A; role unconfirmed) — NOT Jaime Bergaz as prepped. The second seat is therefore
// a neutral analyst seat until Freddie's exact role is confirmed (name confirmed 2026-07-17).
//
// v2 paradigm (session 2026-07-16): operator seats live in folder structure — chat-first read
// as a "black box". Each seat now carries a default workspace layout; the toggle in the top
// bar can flip it live in-session.

export type SeatId = 'tom' | 'analyst';

// 'structure' = room index primary, agent docked right (the Excel-like operator stage).
// 'chat' = chat primary, context canvas right (retained for reviewer/advisor moments).
export type WorkspaceLayout = 'structure' | 'chat';

export interface Persona {
  id: SeatId;
  name: string;
  firstName: string;
  initials: string;
  role: string;
  defaultLayout: WorkspaceLayout;
}

export const PERSONAS: Record<SeatId, Persona> = {
  tom: {
    id: 'tom',
    name: 'Tom Koula',
    firstName: 'Tom',
    initials: 'TK',
    role: 'Associate · runs the room',
    defaultLayout: 'structure',
  },
  analyst: {
    id: 'analyst',
    name: 'Deal Analyst',
    firstName: 'Analyst',
    initials: 'DA',
    role: 'Analyst · works ahead of the room',
    defaultLayout: 'chat',
  },
};

export const DEFAULT_SEAT: SeatId = 'tom';

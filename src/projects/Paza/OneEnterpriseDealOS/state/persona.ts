// Seat model for the Stifel discovery session: one prototype, two personas.
// Telemetry (2026-07-16) inverted the original split: the Associate seat does the raw in-room
// operator work; the Analyst seat works ahead of the room (email, Excel, buyer lists).
// The switcher toggles WHERE the work lives relative to the room, not seniority.

// 'alex' is the One Enterprise Deal OS persona (Surface 0): Corporate Development,
// buy-side. Tom/Jaime are retained for the inherited Aldgate (sell-side IB) flows.
// 'morgan' is the Phase-3 operator seat: same Caldera deal, structure-first default
// (content canvas primary, chat docked to the rail) vs Alex's chat-first default.
export type SeatId = 'tom' | 'jaime' | 'alex' | 'morgan';

// Deal-workspace layout defaults per seat (Phase 3 seat toggle).
export type DealLayout = 'chat-first' | 'structure-first';

export interface Persona {
  id: SeatId;
  name: string;
  firstName: string;
  initials: string;
  role: string;
}

export const PERSONAS: Record<SeatId, Persona> = {
  tom: {
    id: 'tom',
    name: 'Tom Koula',
    firstName: 'Tom',
    initials: 'TK',
    role: 'Associate · runs the room',
  },
  jaime: {
    id: 'jaime',
    name: 'Jaime Bergaz',
    firstName: 'Jaime',
    initials: 'JB',
    role: 'Analyst · works ahead of the room',
  },
  alex: {
    id: 'alex',
    name: 'Alex Verma',
    firstName: 'Alex',
    initials: 'AV',
    role: 'Corporate Development · buy-side',
  },
  morgan: {
    id: 'morgan',
    name: 'Morgan Hale',
    firstName: 'Morgan',
    initials: 'MH',
    role: 'Deal Operations · structure-first',
  },
};

export const DEFAULT_SEAT: SeatId = 'tom';

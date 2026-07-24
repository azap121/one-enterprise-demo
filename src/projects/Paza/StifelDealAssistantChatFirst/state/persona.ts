// Seat model for the Stifel discovery session: one prototype, two personas.
// Telemetry (2026-07-16) inverted the original split: the Associate seat does the raw in-room
// operator work; the Analyst seat works ahead of the room (email, Excel, buyer lists).
// The switcher toggles WHERE the work lives relative to the room, not seniority.

export type SeatId = 'tom' | 'jaime';

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
};

export const DEFAULT_SEAT: SeatId = 'tom';

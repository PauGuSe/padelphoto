export type CourtStatus = 'available' | 'in_use';

export interface Court {
  id: number;
  name: string;
  status: CourtStatus;
  currentMatchId: string | null;
}

export interface Match {
  id: string;
  courtId: number;
  jornada: number;
  players: string;
  category: string;
  photoBursts: number;
  notes: string;
  startTime: number;
  endTime: number | null;
  duration: number | null; // in seconds
}

export interface Jornada {
  number: number;
  name: string;
  date: string;
  closedAt: number | null;
}

export interface Sponsor {
  id: string;
  name: string;
  status: 'pending' | 'completed';
  notes: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  status: 'pending' | 'completed';
  notes: string;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface AppState {
  isSetupComplete: boolean;
  tournamentName: string;
  totalCourts: number;
  currentJornada: number;
  courts: Court[];
  matches: Match[];
  jornadas: Jornada[];
  sponsors: Sponsor[];
  checklists: Checklist[];
  categories: string[];
  colors: string[];
}

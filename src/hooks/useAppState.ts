import { useState, useEffect, useCallback } from 'react';
import { AppState, Court, Match } from '../types';

const STORAGE_KEY = 'padel_photo_app_state';

const defaultState: AppState = {
  isSetupComplete: false,
  tournamentName: '',
  totalCourts: 0,
  currentJornada: 1,
  courts: [],
  matches: [],
  jornadas: [],
};

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure currentJornada exists for backward compatibility
        if (!parsed.currentJornada) parsed.currentJornada = 1;
        if (!parsed.tournamentName) parsed.tournamentName = 'Torneo de Pádel';
        if (!parsed.jornadas) parsed.jornadas = [];
        return parsed;
      } catch (e) {
        console.error('Failed to parse state from localStorage', e);
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setupCourts = useCallback((count: number, tournamentName: string) => {
    const courts: Court[] = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Cancha ${i + 1}`,
      status: 'available',
      currentMatchId: null,
    }));
    setState((prev) => ({
      ...prev,
      isSetupComplete: true,
      tournamentName,
      totalCourts: count,
      currentJornada: 1,
      courts,
    }));
  }, []);

  const closeJornada = useCallback((name: string, date: string) => {
    const hasActive = state.courts.some(c => c.status === 'in_use');
    if (hasActive) {
      return false; // Indicate failure
    }
    setState(prev => {
      const newJornada = {
        number: prev.currentJornada,
        name,
        date,
        closedAt: Date.now()
      };
      return { 
        ...prev, 
        currentJornada: prev.currentJornada + 1,
        jornadas: [...(prev.jornadas || []), newJornada]
      };
    });
    return true;
  }, [state.courts, state.currentJornada]);

  const closeTournament = useCallback(() => {
    setState(defaultState);
  }, []);

  const startMatch = useCallback((courtId: number, matchData: Omit<Match, 'id' | 'courtId' | 'jornada' | 'startTime' | 'endTime' | 'duration'>) => {
    const newMatchId = crypto.randomUUID();
    
    setState((prev) => {
      const newMatch: Match = {
        ...matchData,
        id: newMatchId,
        courtId,
        jornada: prev.currentJornada,
        startTime: Date.now(),
        endTime: null,
        duration: null,
      };

      return {
        ...prev,
        matches: [...prev.matches, newMatch],
        courts: prev.courts.map((c) =>
          c.id === courtId ? { ...c, status: 'in_use', currentMatchId: newMatchId } : c
        ),
      };
    });
  }, []);

  const updateMatch = useCallback((matchId: string, updates: Partial<Match>) => {
    setState((prev) => ({
      ...prev,
      matches: prev.matches.map((m) => (m.id === matchId ? { ...m, ...updates } : m)),
    }));
  }, []);

  const endMatch = useCallback((courtId: number, matchId: string) => {
    setState((prev) => {
      const match = prev.matches.find((m) => m.id === matchId);
      if (!match) return prev;

      const endTime = Date.now();
      const duration = Math.floor((endTime - match.startTime) / 1000);

      return {
        ...prev,
        matches: prev.matches.map((m) =>
          m.id === matchId ? { ...m, endTime, duration } : m
        ),
        courts: prev.courts.map((c) =>
          c.id === courtId ? { ...c, status: 'available', currentMatchId: null } : c
        ),
      };
    });
  }, []);

  const cancelMatch = useCallback((courtId: number, matchId: string) => {
    setState((prev) => ({
      ...prev,
      matches: prev.matches.filter((m) => m.id !== matchId),
      courts: prev.courts.map((c) =>
        c.id === courtId ? { ...c, status: 'available', currentMatchId: null } : c
      ),
    }));
  }, []);

  return {
    state,
    setupCourts,
    closeJornada,
    closeTournament,
    startMatch,
    updateMatch,
    endMatch,
    cancelMatch,
  };
}

import { useState, useEffect, useCallback } from 'react';
import { AppState, Court, Match, Sponsor, ChecklistItem, Checklist } from '../types';

const STORAGE_KEY = 'padel_photo_app_state';

const defaultState: AppState = {
  isSetupComplete: false,
  tournamentName: '',
  totalCourts: 0,
  currentJornada: 1,
  courts: [],
  matches: [],
  jornadas: [],
  sponsors: [],
  checklists: [],
  categories: ['1ra', '2da', '3ra', '4ta', '5ta', '6ta', 'Mixto', 'Fem'],
  colors: ['Blanco', 'Negro', 'Azul', 'Celeste', 'Morado', 'Rosado', 'Rojo', 'Verde', 'Amarillo', 'Naranja', 'Gris'],
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
        if (!parsed.sponsors) parsed.sponsors = [];
        if (!parsed.checklists) parsed.checklists = [];
        if (!parsed.categories) parsed.categories = defaultState.categories;
        if (!parsed.colors) parsed.colors = defaultState.colors;
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

  const addSponsor = useCallback((name: string) => {
    setState(prev => ({
      ...prev,
      sponsors: [...(prev.sponsors || []), { id: crypto.randomUUID(), name, status: 'pending', notes: '' }]
    }));
  }, []);

  const updateSponsor = useCallback((id: string, updates: Partial<Sponsor>) => {
    setState(prev => ({
      ...prev,
      sponsors: prev.sponsors.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  }, []);

  const deleteSponsor = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      sponsors: prev.sponsors.filter(s => s.id !== id)
    }));
  }, []);

  const addChecklist = useCallback((title: string) => {
    setState(prev => ({
      ...prev,
      checklists: [...(prev.checklists || []), { id: crypto.randomUUID(), title, items: [] }]
    }));
  }, []);

  const updateChecklist = useCallback((id: string, updates: Partial<Checklist>) => {
    setState(prev => ({
      ...prev,
      checklists: prev.checklists.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  }, []);

  const deleteChecklist = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      checklists: prev.checklists.filter(c => c.id !== id)
    }));
  }, []);

  const addChecklistItem = useCallback((checklistId: string, name: string) => {
    setState(prev => ({
      ...prev,
      checklists: prev.checklists.map(c => 
        c.id === checklistId 
          ? { ...c, items: [...c.items, { id: crypto.randomUUID(), name, status: 'pending', notes: '' }] }
          : c
      )
    }));
  }, []);

  const updateChecklistItem = useCallback((checklistId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    setState(prev => ({
      ...prev,
      checklists: prev.checklists.map(c => 
        c.id === checklistId 
          ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, ...updates } : i) }
          : c
      )
    }));
  }, []);

  const deleteChecklistItem = useCallback((checklistId: string, itemId: string) => {
    setState(prev => ({
      ...prev,
      checklists: prev.checklists.map(c => 
        c.id === checklistId 
          ? { ...c, items: c.items.filter(i => i.id !== itemId) }
          : c
      )
    }));
  }, []);

  const addCourt = useCallback(() => {
    setState(prev => {
      const nextId = prev.courts.length > 0 ? Math.max(...prev.courts.map(c => c.id)) + 1 : 1;
      const newCourt: Court = {
        id: nextId,
        name: `Cancha ${nextId}`,
        status: 'available',
        currentMatchId: null,
      };
      return {
        ...prev,
        totalCourts: prev.totalCourts + 1,
        courts: [...prev.courts, newCourt],
      };
    });
  }, []);

  const addCategory = useCallback((category: string) => {
    setState(prev => ({
      ...prev,
      categories: [...prev.categories, category]
    }));
  }, []);

  const deleteCategory = useCallback((category: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  }, []);

  const addColor = useCallback((color: string) => {
    setState(prev => ({
      ...prev,
      colors: [...prev.colors, color]
    }));
  }, []);

  const deleteColor = useCallback((color: string) => {
    setState(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  }, []);

  const reorderCategories = useCallback((startIndex: number, endIndex: number) => {
    setState(prev => {
      const result = Array.from(prev.categories);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { ...prev, categories: result };
    });
  }, []);

  const reorderColors = useCallback((startIndex: number, endIndex: number) => {
    setState(prev => {
      const result = Array.from(prev.colors);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { ...prev, colors: result };
    });
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
    addSponsor,
    updateSponsor,
    deleteSponsor,
    addChecklist,
    updateChecklist,
    deleteChecklist,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    addCourt,
    addCategory,
    deleteCategory,
    reorderCategories,
    addColor,
    deleteColor,
    reorderColors,
  };
}

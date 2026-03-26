import { useState, useEffect, useCallback } from 'react';
import { AppState, Court, Match, Sponsor, ChecklistItem, Checklist, User, Tournament } from '../types';

const STORAGE_KEY = 'padel_photo_app_state_v2';
const STORAGE_KEY_OLD = 'padel_photo_app_state';

const defaultGlobalState: AppState = {
  currentUser: null,
  users: [{ id: 'admin-1', username: 'PauAdmin', password: 'P0ly2410', role: 'admin' }],
  tournaments: [],
  activeTournamentId: null,
};

const emptyTournament: Omit<Tournament, 'id' | 'userId' | 'createdAt'> = {
  viewerIds: [],
  status: 'setup',
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
  const [globalState, setGlobalState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY_OLD);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.tournaments === undefined) {
          // Migration from v1
          const migrated: Tournament = {
            id: crypto.randomUUID(),
            userId: parsed.currentUser?.id || 'admin-1',
            status: parsed.isSetupComplete ? 'active' : 'setup',
            isSetupComplete: parsed.isSetupComplete || false,
            tournamentName: parsed.tournamentName || 'Torneo de Pádel',
            tournamentLogo: parsed.tournamentLogo,
            themeColor: parsed.themeColor,
            totalCourts: parsed.totalCourts || 0,
            currentJornada: parsed.currentJornada || 1,
            courts: parsed.courts || [],
            matches: parsed.matches || [],
            jornadas: parsed.jornadas || [],
            sponsors: parsed.sponsors || [],
            checklists: parsed.checklists || [],
            categories: parsed.categories || emptyTournament.categories,
            colors: parsed.colors || emptyTournament.colors,
            createdAt: Date.now()
          };
          return {
            currentUser: parsed.currentUser || null,
            users: parsed.users || defaultGlobalState.users,
            tournaments: [migrated],
            activeTournamentId: null
          };
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse state', e);
      }
    }
    return defaultGlobalState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  }, [globalState]);

  const updateActiveTournament = useCallback((updater: (t: Tournament) => Tournament) => {
    setGlobalState(prev => {
      if (!prev.activeTournamentId) return prev;
      return {
        ...prev,
        tournaments: prev.tournaments.map(t =>
          t.id === prev.activeTournamentId ? updater(t) : t
        )
      };
    });
  }, []);

  const createTournament = useCallback(() => {
    setGlobalState(prev => {
      if (!prev.currentUser) return prev;
      const newId = crypto.randomUUID();
      const newTournament: Tournament = {
        ...emptyTournament,
        id: newId,
        userId: prev.currentUser.id,
        createdAt: Date.now()
      };
      return {
        ...prev,
        tournaments: [...prev.tournaments, newTournament],
        activeTournamentId: newId
      };
    });
  }, []);

  const selectTournament = useCallback((id: string) => {
    setGlobalState(prev => ({ ...prev, activeTournamentId: id }));
  }, []);

  const exitTournament = useCallback(() => {
    setGlobalState(prev => ({ ...prev, activeTournamentId: null }));
  }, []);

  const deleteTournament = useCallback((id: string) => {
    setGlobalState(prev => ({
      ...prev,
      tournaments: prev.tournaments.filter(t => t.id !== id),
      activeTournamentId: prev.activeTournamentId === id ? null : prev.activeTournamentId
    }));
  }, []);

  const setupCourts = useCallback((count: number, tournamentName: string, themeColor?: string, tournamentLogo?: string) => {
    updateActiveTournament(t => {
      const courts: Court[] = Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `Cancha ${i + 1}`,
        status: 'available',
        currentMatchId: null,
      }));
      return {
        ...t,
        isSetupComplete: true,
        status: 'active',
        tournamentName,
        themeColor: themeColor || t.themeColor,
        tournamentLogo: tournamentLogo || t.tournamentLogo,
        totalCourts: count,
        currentJornada: 1,
        courts,
      };
    });
  }, [updateActiveTournament]);

  const closeJornada = useCallback((name: string, date: string) => {
    let success = false;
    setGlobalState(prev => {
      if (!prev.activeTournamentId) return prev;
      const t = prev.tournaments.find(x => x.id === prev.activeTournamentId);
      if (!t) return prev;

      const hasActive = t.courts.some(c => c.status === 'in_use');
      if (hasActive) return prev;

      success = true;
      const newJornada = {
        number: t.currentJornada,
        name,
        date,
        closedAt: Date.now()
      };
      return {
        ...prev,
        tournaments: prev.tournaments.map(x => x.id === t.id ? {
          ...x,
          currentJornada: x.currentJornada + 1,
          jornadas: [...(x.jornadas || []), newJornada]
        } : x)
      };
    });
    return success;
  }, []);

  const closeTournament = useCallback(() => {
    updateActiveTournament(t => ({
      ...t,
      status: 'closed',
      closedAt: Date.now()
    }));
    exitTournament();
  }, [updateActiveTournament, exitTournament]);

  const updateTournamentSettings = useCallback((updates: Partial<Tournament>) => {
    updateActiveTournament(t => ({ ...t, ...updates }));
  }, [updateActiveTournament]);

  const startMatch = useCallback((courtId: number, matchData: Omit<Match, 'id' | 'courtId' | 'jornada' | 'startTime' | 'endTime' | 'duration'>) => {
    const newMatchId = crypto.randomUUID();
    updateActiveTournament(t => {
      const newMatch: Match = {
        ...matchData,
        id: newMatchId,
        courtId,
        jornada: t.currentJornada,
        startTime: Date.now(),
        endTime: null,
        duration: null,
      };
      return {
        ...t,
        matches: [...t.matches, newMatch],
        courts: t.courts.map((c) =>
          c.id === courtId ? { ...c, status: 'in_use', currentMatchId: newMatchId } : c
        ),
      };
    });
  }, [updateActiveTournament]);

  const updateMatch = useCallback((matchId: string, updates: Partial<Match>) => {
    updateActiveTournament(t => ({
      ...t,
      matches: t.matches.map((m) => (m.id === matchId ? { ...m, ...updates } : m)),
    }));
  }, [updateActiveTournament]);

  const endMatch = useCallback((courtId: number, matchId: string) => {
    updateActiveTournament(t => {
      const match = t.matches.find((m) => m.id === matchId);
      if (!match) return t;

      const endTime = Date.now();
      const duration = Math.floor((endTime - match.startTime) / 1000);

      return {
        ...t,
        matches: t.matches.map((m) =>
          m.id === matchId ? { ...m, endTime, duration } : m
        ),
        courts: t.courts.map((c) =>
          c.id === courtId ? { ...c, status: 'available', currentMatchId: null } : c
        ),
      };
    });
  }, [updateActiveTournament]);

  const cancelMatch = useCallback((courtId: number, matchId: string) => {
    updateActiveTournament(t => ({
      ...t,
      matches: t.matches.filter((m) => m.id !== matchId),
      courts: t.courts.map((c) =>
        c.id === courtId ? { ...c, status: 'available', currentMatchId: null } : c
      ),
    }));
  }, [updateActiveTournament]);

  const addSponsor = useCallback((name: string, notes: string = '') => {
    updateActiveTournament(t => ({
      ...t,
      sponsors: [...(t.sponsors || []), { id: crypto.randomUUID(), name, status: 'pending', notes }]
    }));
  }, [updateActiveTournament]);

  const updateSponsor = useCallback((id: string, updates: Partial<Sponsor>) => {
    updateActiveTournament(t => ({
      ...t,
      sponsors: t.sponsors.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  }, [updateActiveTournament]);

  const deleteSponsor = useCallback((id: string) => {
    updateActiveTournament(t => ({
      ...t,
      sponsors: t.sponsors.filter(s => s.id !== id)
    }));
  }, [updateActiveTournament]);

  const addChecklist = useCallback((title: string) => {
    updateActiveTournament(t => ({
      ...t,
      checklists: [...(t.checklists || []), { id: crypto.randomUUID(), title, items: [] }]
    }));
  }, [updateActiveTournament]);

  const updateChecklist = useCallback((id: string, updates: Partial<Checklist>) => {
    updateActiveTournament(t => ({
      ...t,
      checklists: t.checklists.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  }, [updateActiveTournament]);

  const deleteChecklist = useCallback((id: string) => {
    updateActiveTournament(t => ({
      ...t,
      checklists: t.checklists.filter(c => c.id !== id)
    }));
  }, [updateActiveTournament]);

  const addChecklistItem = useCallback((checklistId: string, name: string) => {
    updateActiveTournament(t => ({
      ...t,
      checklists: t.checklists.map(c => 
        c.id === checklistId 
          ? { ...c, items: [...c.items, { id: crypto.randomUUID(), name, status: 'pending', notes: '' }] }
          : c
      )
    }));
  }, [updateActiveTournament]);

  const updateChecklistItem = useCallback((checklistId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    updateActiveTournament(t => ({
      ...t,
      checklists: t.checklists.map(c => 
        c.id === checklistId 
          ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, ...updates } : i) }
          : c
      )
    }));
  }, [updateActiveTournament]);

  const deleteChecklistItem = useCallback((checklistId: string, itemId: string) => {
    updateActiveTournament(t => ({
      ...t,
      checklists: t.checklists.map(c => 
        c.id === checklistId 
          ? { ...c, items: c.items.filter(i => i.id !== itemId) }
          : c
      )
    }));
  }, [updateActiveTournament]);

  const addCourt = useCallback(() => {
    updateActiveTournament(t => {
      const nextId = t.courts.length > 0 ? Math.max(...t.courts.map(c => c.id)) + 1 : 1;
      const newCourt: Court = {
        id: nextId,
        name: `Cancha ${nextId}`,
        status: 'available',
        currentMatchId: null,
      };
      return {
        ...t,
        totalCourts: t.totalCourts + 1,
        courts: [...t.courts, newCourt],
      };
    });
  }, [updateActiveTournament]);

  const addCategory = useCallback((category: string) => {
    updateActiveTournament(t => ({
      ...t,
      categories: [...t.categories, category]
    }));
  }, [updateActiveTournament]);

  const deleteCategory = useCallback((category: string) => {
    updateActiveTournament(t => ({
      ...t,
      categories: t.categories.filter(c => c !== category)
    }));
  }, [updateActiveTournament]);

  const addColor = useCallback((color: string) => {
    updateActiveTournament(t => ({
      ...t,
      colors: [...t.colors, color]
    }));
  }, [updateActiveTournament]);

  const deleteColor = useCallback((color: string) => {
    updateActiveTournament(t => ({
      ...t,
      colors: t.colors.filter(c => c !== color)
    }));
  }, [updateActiveTournament]);

  const reorderCategories = useCallback((startIndex: number, endIndex: number) => {
    updateActiveTournament(t => {
      const result = Array.from(t.categories);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { ...t, categories: result };
    });
  }, [updateActiveTournament]);

  const reorderColors = useCallback((startIndex: number, endIndex: number) => {
    updateActiveTournament(t => {
      const result = Array.from(t.colors);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { ...t, colors: result };
    });
  }, [updateActiveTournament]);

  const login = useCallback((user: User) => {
    setGlobalState(prev => ({ ...prev, currentUser: user }));
  }, []);

  const logout = useCallback(() => {
    setGlobalState(prev => ({ ...prev, currentUser: null, activeTournamentId: null }));
  }, []);

  const addUser = useCallback((user: Omit<User, 'id'>) => {
    setGlobalState(prev => {
      const newUserId = crypto.randomUUID();
      const newUser = { ...user, id: newUserId };
      
      let newTournaments = prev.tournaments;
      
      // If a viewer is created while inside a tournament, automatically assign them to it
      if (user.role === 'viewer' && prev.activeTournamentId) {
        newTournaments = prev.tournaments.map(t => 
          t.id === prev.activeTournamentId 
            ? { ...t, viewerIds: [...(t.viewerIds || []), newUserId] }
            : t
        );
      }

      return {
        ...prev,
        users: [...prev.users, newUser],
        tournaments: newTournaments
      };
    });
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setGlobalState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === id ? { ...u, ...updates } : u)
    }));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setGlobalState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id)
    }));
  }, []);

  const activeTournament = globalState.tournaments.find(t => t.id === globalState.activeTournamentId);
  const state = activeTournament ? { ...activeTournament, currentUser: globalState.currentUser, users: globalState.users } : null;

  return {
    globalState,
    state,
    createTournament,
    selectTournament,
    exitTournament,
    deleteTournament,
    setupCourts,
    closeJornada,
    closeTournament,
    updateTournamentSettings,
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
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
  };
}

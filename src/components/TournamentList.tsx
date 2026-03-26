import React, { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { Plus, Power, Trophy, Calendar, Trash2 } from 'lucide-react';

export function TournamentList({ appState }: { appState: ReturnType<typeof useAppState> }) {
  const { globalState, createTournament, selectTournament, deleteTournament, logout } = appState;
  const { currentUser, tournaments, users } = globalState;
  const [tournamentToDelete, setTournamentToDelete] = useState<string | null>(null);

  if (!currentUser) return null;

  // Filter tournaments: Admin sees all, Viewer sees assigned, User sees only theirs
  const visibleTournaments = currentUser.role === 'admin' 
    ? tournaments 
    : currentUser.role === 'viewer'
      ? tournaments.filter(t => t.viewerIds?.includes(currentUser.id))
      : tournaments.filter(t => t.userId === currentUser.id);

  // Sort by newest first
  const sortedTournaments = [...visibleTournaments].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Mis Torneos</h1>
            <p className="text-slate-500">Bienvenido, {currentUser.username}</p>
          </div>
          <div className="flex items-center gap-3">
            {currentUser.role !== 'viewer' && (
              <button 
                onClick={createTournament}
                className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-sky-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nuevo Torneo
              </button>
            )}
            <button 
              onClick={logout}
              className="flex items-center gap-2 bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-slate-300 transition-colors"
            >
              <Power className="w-5 h-5" />
              Salir
            </button>
          </div>
        </div>

        {sortedTournaments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4 text-sky-500">
              <Trophy className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes torneos</h3>
            <p className="text-slate-500 mb-6">Comienza creando tu primer torneo para gestionar las canchas.</p>
            <button 
              onClick={createTournament}
              className="bg-sky-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Crear Torneo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTournaments.map(t => {
              const owner = users.find(u => u.id === t.userId);
              return (
                <div key={t.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 shrink-0">
                      {t.tournamentLogo ? (
                        <img src={t.tournamentLogo} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                      ) : (
                        <Trophy className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        t.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                        t.status === 'closed' ? 'bg-slate-100 text-slate-600' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {t.status === 'active' ? 'Activo' : t.status === 'closed' ? 'Cerrado' : 'Configurando'}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-1 truncate">
                    {t.tournamentName || 'Torneo sin nombre'}
                  </h3>
                  
                  {currentUser.role === 'admin' && (
                    <p className="text-xs text-slate-500 mb-4">
                      Creado por: <span className="font-bold">{owner?.username || 'Desconocido'}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 mt-auto pt-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Creado el: {new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-700">{t.totalCourts}</span>
                      <span>Canchas</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => selectTournament(t.id)}
                      className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                    >
                      {t.status === 'setup' ? 'Continuar' : 'Ver Torneo'}
                    </button>
                    {(currentUser.role === 'admin' || t.userId === currentUser.id) && (
                      <button 
                        onClick={() => setTournamentToDelete(t.id)}
                        className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                        title="Eliminar torneo"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {tournamentToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Eliminar Torneo</h3>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar este torneo? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTournamentToDelete(null)}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteTournament(tournamentToDelete);
                  setTournamentToDelete(null);
                }}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

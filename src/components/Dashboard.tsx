import { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { Court, Checklist } from '../types';
import { CourtCard } from './CourtCard';
import { MatchModal } from './MatchModal';
import { StatsView } from './StatsView';
import { ConfirmDialog } from './ConfirmDialog';
import { SponsorsModal } from './SponsorsModal';
import { ChecklistModal } from './ChecklistModal';
import { LayoutGrid, BarChart2, Settings, X, CalendarCheck, AlertTriangle, Star, Plus, ListTodo } from 'lucide-react';

export function Dashboard({ appState }: { appState: ReturnType<typeof useAppState> }) {
  const { state, startMatch, updateMatch, endMatch, cancelMatch, closeJornada, closeTournament, addSponsor, updateSponsor, deleteSponsor, addCourt, addChecklist, updateChecklist, deleteChecklist, addChecklistItem, updateChecklistItem, deleteChecklistItem } = appState;
  const [activeTab, setActiveTab] = useState<'courts' | 'stats'>('courts');
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSponsorsModal, setShowSponsorsModal] = useState(false);
  const [activeChecklist, setActiveChecklist] = useState<Checklist | null>(null);
  const [showAddChecklistModal, setShowAddChecklistModal] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    onConfirm: () => {},
  });

  const activeMatch = selectedCourt?.currentMatchId 
    ? state.matches.find(m => m.id === selectedCourt.currentMatchId)
    : undefined;

  const [showCloseJornadaModal, setShowCloseJornadaModal] = useState(false);
  const [jornadaForm, setJornadaForm] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  });

  const handleCloseJornada = () => {
    const hasActive = state.courts.some(c => c.status === 'in_use');
    if (hasActive) {
      setConfirmDialog({
        isOpen: true,
        title: 'Canchas en uso',
        message: 'Hay canchas en uso. Finaliza todos los partidos antes de cerrar la jornada.',
        confirmText: 'Entendido',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    setJornadaForm({
      name: `Jornada ${state.currentJornada}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    });
    setShowCloseJornadaModal(true);
    setShowSettings(false);
  };

  const confirmCloseJornada = () => {
    closeJornada(jornadaForm.name, `${jornadaForm.date} ${jornadaForm.time}`);
    setShowCloseJornadaModal(false);
  };

  const handleCloseTournament = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cerrar Torneo',
      message: '¿Estás seguro de cerrar el torneo? Se borrarán todos los datos. ¡Asegúrate de haber exportado tus estadísticas primero!',
      confirmText: 'Sí, borrar todo',
      isDestructive: true,
      onConfirm: () => {
        closeTournament();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setShowSettings(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <span className="text-white font-black text-sm">PP</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-xl font-bold text-slate-800 leading-tight truncate max-w-[200px] sm:max-w-[300px]">
              {state.tournamentName || 'PadelPhoto'}
            </h1>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              Jornada {state.currentJornada}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95 shrink-0"
          title="Opciones del Torneo"
        >
          <Settings className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'courts' ? (
          <div className="p-4 pb-24 max-w-5xl mx-auto space-y-8">
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">Canchas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {state.courts.map(court => (
                  <CourtCard 
                    key={court.id} 
                    court={court} 
                    activeMatch={court.currentMatchId ? state.matches.find(m => m.id === court.currentMatchId) : undefined}
                    onClick={setSelectedCourt} 
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">Registros Adicionales</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                <button
                  onClick={() => setShowSponsorsModal(true)}
                  className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 aspect-square group"
                >
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <Star className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-slate-800">Auspiciadores</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {state.sponsors?.filter(s => s.status === 'completed').length || 0} / {state.sponsors?.length || 0} listos
                    </span>
                  </div>
                </button>

                {state.checklists?.map(checklist => (
                  <button
                    key={checklist.id}
                    onClick={() => setActiveChecklist(checklist)}
                    className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 aspect-square group"
                  >
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <ListTodo className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-slate-800 truncate w-full px-2">{checklist.title}</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {checklist.items?.filter(i => i.status === 'completed').length || 0} / {checklist.items?.length || 0} listos
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <StatsView state={state} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 pb-safe z-20">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <button 
            onClick={() => setActiveTab('courts')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'courts' ? 'text-sky-600' : 'text-slate-400'}`}
          >
            <LayoutGrid className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Canchas</span>
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'stats' ? 'text-sky-600' : 'text-slate-400'}`}
          >
            <BarChart2 className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Estadísticas</span>
          </button>
        </div>
      </nav>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-slate-800">Configuraciones</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  addCourt();
                  setShowSettings(false);
                }} 
                className="w-full bg-emerald-50 text-emerald-700 py-4 rounded-2xl font-bold hover:bg-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Agregar Otra Cancha
              </button>
              
              <button 
                onClick={() => {
                  setShowAddChecklistModal(true);
                  setShowSettings(false);
                }} 
                className="w-full bg-indigo-50 text-indigo-700 py-4 rounded-2xl font-bold hover:bg-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <ListTodo className="w-5 h-5" />
                Agregar Recuadro
              </button>
            </div>

            <div className="pt-4 border-t space-y-3">
              <button 
                onClick={handleCloseJornada} 
                className="w-full bg-sky-100 text-sky-700 py-4 rounded-2xl font-bold hover:bg-sky-200 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CalendarCheck className="w-5 h-5" />
                Cerrar Jornada {state.currentJornada}
              </button>
              <p className="text-xs text-slate-500 text-center px-4">
                Avanza a la siguiente jornada manteniendo el historial.
              </p>
            </div>

            <div className="pt-4 border-t space-y-3">
              <button 
                onClick={handleCloseTournament} 
                className="w-full bg-red-50 text-red-600 border border-red-200 py-4 rounded-2xl font-bold hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Cerrar Torneo (Borrar Todo)
              </button>
              <p className="text-xs text-red-400 text-center px-4">
                ¡Atención! Esto eliminará todos los datos. Exporta tus estadísticas primero.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Checklist Modal */}
      {showAddChecklistModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-slate-800">Nuevo Recuadro</h3>
              <button 
                onClick={() => {
                  setShowAddChecklistModal(false);
                  setNewChecklistName('');
                }} 
                className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre del Recuadro</label>
                <input 
                  type="text" 
                  value={newChecklistName}
                  onChange={(e) => setNewChecklistName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Ej: Fotógrafos, Premios..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newChecklistName.trim()) {
                      addChecklist(newChecklistName.trim());
                      setShowAddChecklistModal(false);
                      setNewChecklistName('');
                    }
                  }}
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => {
                  if (newChecklistName.trim()) {
                    addChecklist(newChecklistName.trim());
                    setShowAddChecklistModal(false);
                    setNewChecklistName('');
                  }
                }}
                disabled={!newChecklistName.trim()}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Recuadro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Jornada Modal */}
      {showCloseJornadaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-slate-800">Cerrar Jornada {state.currentJornada}</h3>
              <button onClick={() => setShowCloseJornadaModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre de la Jornada</label>
                <input 
                  type="text" 
                  value={jornadaForm.name}
                  onChange={(e) => setJornadaForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  placeholder="Ej: Sábado Mañana"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Fecha</label>
                  <input 
                    type="date" 
                    value={jornadaForm.date}
                    onChange={(e) => setJornadaForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Hora Cierre</label>
                  <input 
                    type="time" 
                    value={jornadaForm.time}
                    onChange={(e) => setJornadaForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={confirmCloseJornada} 
                className="w-full bg-sky-600 text-white py-4 rounded-2xl font-bold hover:bg-sky-700 active:scale-95 transition-all shadow-lg shadow-sky-600/20"
              >
                Confirmar Cierre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Modal */}
      {selectedCourt && (
        <MatchModal
          court={selectedCourt}
          activeMatch={activeMatch}
          onClose={() => setSelectedCourt(null)}
          onStart={startMatch}
          onUpdate={updateMatch}
          onEnd={endMatch}
          onCancel={(courtId, matchId) => {
            setConfirmDialog({
              isOpen: true,
              title: 'Cancelar Registro',
              message: '¿Cancelar este registro? No se guardará en el historial.',
              confirmText: 'Sí, cancelar',
              isDestructive: true,
              onConfirm: () => {
                cancelMatch(courtId, matchId);
                setSelectedCourt(null);
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
              }
            });
          }}
        />
      )}

      {/* Sponsors Modal */}
      {showSponsorsModal && (
        <SponsorsModal
          sponsors={state.sponsors || []}
          onClose={() => setShowSponsorsModal(false)}
          onAdd={addSponsor}
          onUpdate={updateSponsor}
          onDelete={deleteSponsor}
        />
      )}

      {/* Checklist Modal */}
      {activeChecklist && (
        <ChecklistModal
          checklist={state.checklists.find(c => c.id === activeChecklist.id) || activeChecklist}
          onClose={() => setActiveChecklist(null)}
          onAdd={addChecklistItem}
          onUpdate={updateChecklistItem}
          onDelete={deleteChecklistItem}
          onUpdateChecklist={(id, title) => updateChecklist(id, { title })}
          onDeleteChecklist={(id) => {
            setConfirmDialog({
              isOpen: true,
              title: 'Eliminar Recuadro',
              message: '¿Estás seguro de eliminar este recuadro y todos sus items?',
              confirmText: 'Sí, eliminar',
              isDestructive: true,
              onConfirm: () => {
                deleteChecklist(id);
                setActiveChecklist(null);
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
              }
            });
          }}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        {...confirmDialog}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

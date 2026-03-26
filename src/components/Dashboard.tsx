import { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { Court, Checklist } from '../types';
import { CourtCard } from './CourtCard';
import { MatchModal } from './MatchModal';
import { StatsView } from './StatsView';
import { ConfirmDialog } from './ConfirmDialog';
import { SponsorsModal } from './SponsorsModal';
import { ChecklistModal } from './ChecklistModal';
import { UserManagementModal } from './UserManagementModal';
import { ViewerManagementModal } from './ViewerManagementModal';
import { LayoutGrid, BarChart2, Settings, X, CalendarCheck, AlertTriangle, Star, Plus, ListTodo, Power, Palette, Tags, GripVertical, Users, Eye } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export function Dashboard({ appState }: { appState: ReturnType<typeof useAppState> }) {
  const { state, updateTournamentSettings, startMatch, updateMatch, endMatch, cancelMatch, closeJornada, closeTournament, addSponsor, updateSponsor, deleteSponsor, addCourt, addChecklist, updateChecklist, deleteChecklist, addChecklistItem, updateChecklistItem, deleteChecklistItem, addCategory, deleteCategory, reorderCategories, addColor, deleteColor, reorderColors, logout, addUser, deleteUser } = appState;
  const [activeTab, setActiveTab] = useState<'courts' | 'stats'>('courts');
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showViewerManagement, setShowViewerManagement] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showSponsorsModal, setShowSponsorsModal] = useState(false);
  const [activeChecklist, setActiveChecklist] = useState<Checklist | null>(null);
  const [showAddChecklistModal, setShowAddChecklistModal] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');
  
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [showAddColorModal, setShowAddColorModal] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  
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
      message: '¿Estás seguro de cerrar el torneo? Ya no podrás modificar sus datos, pero quedará guardado en tu historial.',
      confirmText: 'Sí, cerrar torneo',
      isDestructive: true,
      onConfirm: () => {
        closeTournament();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setShowSettings(false);
      }
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'colors') {
      reorderColors(source.index, destination.index);
    } else if (type === 'categories') {
      reorderCategories(source.index, destination.index);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/1/17/Mejorset_Full_Panoramic_Padel_Court_Delivered_by_SG_Padel.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-slate-100/85 backdrop-blur-[4px]"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1 pb-20">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={appState.exitTournament}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95 shrink-0"
              title="Volver a mis torneos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          {state.tournamentLogo ? (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 overflow-hidden bg-slate-50 border border-slate-100">
              <img src={state.tournamentLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <span className="text-white font-black text-sm">PP</span>
            </div>
          )}
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-xl font-bold text-slate-800 leading-tight truncate max-w-[200px] sm:max-w-[300px]">
              {state.tournamentName || 'PadelPhoto'}
            </h1>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              Jornada {state.currentJornada}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {state.currentUser?.role === 'admin' && (
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95 shrink-0"
              title="Configuraciones"
            >
              <Settings className="w-6 h-6" />
            </button>
          )}
          <button 
            onClick={() => {
              setConfirmDialog({
                isOpen: true,
                title: 'Cerrar Sesión',
                message: '¿Estás seguro de que deseas cerrar sesión?',
                confirmText: 'Sí, cerrar sesión',
                onConfirm: () => {
                  logout();
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }
              });
            }}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95 shrink-0"
            title="Cerrar Sesión"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
          </button>
          {state.status !== 'closed' && state.currentUser?.role !== 'viewer' && (
            <button 
              onClick={() => setShowCloseModal(true)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors active:scale-95 shrink-0"
              title="Cerrar Torneo"
            >
              <Power className="w-6 h-6" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10">
        {activeTab === 'courts' ? (
          <div className="p-4 pb-24 max-w-5xl mx-auto space-y-8">
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4 px-1 drop-shadow-sm">Canchas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {state.courts.map(court => (
                  <CourtCard 
                    key={court.id} 
                    court={court} 
                    activeMatch={court.currentMatchId ? state.matches.find(m => m.id === court.currentMatchId) : undefined}
                    onClick={state.status === 'closed' || state.currentUser?.role === 'viewer' ? () => {} : setSelectedCourt} 
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4 px-1 drop-shadow-sm">Registros Adicionales</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                <button
                  onClick={() => setShowSponsorsModal(true)}
                  className="bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-slate-200/50 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 aspect-square group"
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
                    onClick={state.currentUser?.role === 'viewer' ? () => {} : () => setActiveChecklist(checklist)}
                    className="bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-slate-200/50 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 aspect-square group"
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
      <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-200/50 pb-safe z-20">
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
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
              <h3 className="text-xl font-bold text-slate-800">Configuraciones</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <DragDropContext onDragEnd={handleDragEnd}>
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

                <button 
                  onClick={() => {
                    setShowUserManagement(true);
                    setShowSettings(false);
                  }} 
                  className="w-full bg-amber-50 text-amber-700 py-4 rounded-2xl font-bold hover:bg-amber-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Gestión de Usuarios
                </button>

                <button 
                  onClick={() => {
                    setShowViewerManagement(true);
                    setShowSettings(false);
                  }} 
                  className="w-full bg-purple-50 text-purple-700 py-4 rounded-2xl font-bold hover:bg-purple-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Asignar Visualizadores
                </button>

                <div className="pt-2 border-t border-slate-200/50">
                  <h4 className="text-sm font-bold text-slate-700 mb-3">Personalización</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Color del Tema</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={state.themeColor || '#214ed3'} 
                          onChange={(e) => updateTournamentSettings({ themeColor: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-sm text-slate-600 font-mono">{state.themeColor || '#214ed3'}</span>
                        <button 
                          onClick={() => updateTournamentSettings({ themeColor: '#214ed3' })}
                          className="text-xs text-slate-400 hover:text-indigo-600 underline ml-auto"
                        >
                          Restaurar
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Logo del Torneo</label>
                      <div className="flex items-center gap-3">
                        {state.tournamentLogo ? (
                          <div className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                            <img src={state.tournamentLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                            <button 
                              onClick={() => updateTournamentSettings({ tournamentLogo: undefined })}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center shrink-0">
                            <span className="text-xs text-slate-400">Logo</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          id="logo-upload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                updateTournamentSettings({ tournamentLogo: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <label 
                          htmlFor="logo-upload"
                          className="text-sm bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-medium cursor-pointer hover:bg-slate-200 transition-colors"
                        >
                          {state.tournamentLogo ? 'Cambiar logo' : 'Subir logo'}
                        </label>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Recomendado: PNG transparente, máx 1MB.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-700">Colores</h4>
                    <button 
                      onClick={() => {
                        setShowAddColorModal(true);
                        setShowSettings(false);
                      }} 
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Agregar
                    </button>
                  </div>
                  <Droppable droppableId="colors-list" type="colors" direction="horizontal">
                    {(provided) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex flex-wrap gap-2 min-h-[32px]"
                      >
                        {state.colors.map((color, index) => (
                          // @ts-expect-error - React 19 types issue with @hello-pangea/dnd
                          <Draggable key={color} draggableId={`color-${color}`} index={index}>
                            {(provided, snapshot) => (
                              <span 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${snapshot.isDragging ? 'bg-blue-100 text-blue-800 shadow-md' : 'bg-slate-100 text-slate-700'}`}
                              >
                                <span {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                                  <GripVertical className="w-3 h-3" />
                                </span>
                                {color}
                                <button onClick={() => deleteColor(color)} className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {state.colors.length === 0 && <span className="text-xs text-slate-400 italic">No hay colores</span>}
                      </div>
                    )}
                  </Droppable>
                </div>

                <div className="pt-2 border-t border-slate-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-700">Categorías</h4>
                    <button 
                      onClick={() => {
                        setShowAddCategoryModal(true);
                        setShowSettings(false);
                      }} 
                      className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Agregar
                    </button>
                  </div>
                  <Droppable droppableId="categories-list" type="categories" direction="horizontal">
                    {(provided) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex flex-wrap gap-2 min-h-[32px]"
                      >
                        {state.categories.map((cat, index) => (
                          // @ts-expect-error - React 19 types issue with @hello-pangea/dnd
                          <Draggable key={cat} draggableId={`cat-${cat}`} index={index}>
                            {(provided, snapshot) => (
                              <span 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${snapshot.isDragging ? 'bg-fuchsia-100 text-fuchsia-800 shadow-md' : 'bg-slate-100 text-slate-700'}`}
                              >
                                <span {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                                  <GripVertical className="w-3 h-3" />
                                </span>
                                {cat}
                                <button onClick={() => deleteCategory(cat)} className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {state.categories.length === 0 && <span className="text-xs text-slate-400 italic">No hay categorías</span>}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            </DragDropContext>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
              <h3 className="text-xl font-bold text-slate-800">Cerrar</h3>
              <button onClick={() => setShowCloseModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  handleCloseJornada();
                  setShowCloseModal(false);
                }} 
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
                onClick={() => {
                  handleCloseTournament();
                  setShowCloseModal(false);
                }} 
                className="w-full bg-red-50 text-red-600 border border-red-200 py-4 rounded-2xl font-bold hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Cerrar Torneo Definitivamente
              </button>
              <p className="text-xs text-red-400 text-center px-4">
                El torneo se marcará como cerrado y no podrás modificarlo más.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Checklist Modal */}
      {showAddChecklistModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
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

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
              <h3 className="text-xl font-bold text-slate-800">Nueva Categoría</h3>
              <button 
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryName('');
                }} 
                className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre de la Categoría</label>
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Ej: 7ma, Junior..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCategoryName.trim()) {
                      addCategory(newCategoryName.trim());
                      setShowAddCategoryModal(false);
                      setNewCategoryName('');
                    }
                  }}
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => {
                  if (newCategoryName.trim()) {
                    addCategory(newCategoryName.trim());
                    setShowAddCategoryModal(false);
                    setNewCategoryName('');
                  }
                }}
                disabled={!newCategoryName.trim()}
                className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-lg font-bold py-4 rounded-2xl shadow-lg shadow-fuchsia-600/30 active:scale-95 transition-all"
              >
                Agregar Categoría
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Color Modal */}
      {showAddColorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
              <h3 className="text-xl font-bold text-slate-800">Nuevo Color</h3>
              <button 
                onClick={() => {
                  setShowAddColorModal(false);
                  setNewColorName('');
                }} 
                className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre del Color</label>
                <input 
                  type="text" 
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Ej: Turquesa, Fucsia..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newColorName.trim()) {
                      addColor(newColorName.trim());
                      setShowAddColorModal(false);
                      setNewColorName('');
                    }
                  }}
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => {
                  if (newColorName.trim()) {
                    addColor(newColorName.trim());
                    setShowAddColorModal(false);
                    setNewColorName('');
                  }
                }}
                disabled={!newColorName.trim()}
                className="w-full bg-royal-blue hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-lg font-bold py-4 rounded-2xl shadow-lg shadow-royal-blue/30 active:scale-95 transition-all"
              >
                Agregar Color
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Jornada Modal */}
      {showCloseJornadaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
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
          categories={state.categories}
          colors={state.colors}
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
          isViewer={state.currentUser?.role === 'viewer'}
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

      {/* User Management Modal */}
      {showUserManagement && state.currentUser && (
        <UserManagementModal
          users={state.users}
          onAddUser={addUser}
          onDeleteUser={deleteUser}
          onClose={() => setShowUserManagement(false)}
          currentUserId={state.currentUser.id}
        />
      )}

      {/* Viewer Management Modal */}
      {showViewerManagement && state.currentUser && (
        <ViewerManagementModal
          users={state.users}
          tournament={state}
          onUpdateTournament={updateTournamentSettings}
          onClose={() => setShowViewerManagement(false)}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        {...confirmDialog}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
      </div>
    </div>
  );
}

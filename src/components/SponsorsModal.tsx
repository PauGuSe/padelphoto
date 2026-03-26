import React, { useState } from 'react';
import { Sponsor } from '../types';
import { X, Plus, CheckCircle2, Circle, Trash2, Edit2, MessageSquare } from 'lucide-react';

interface SponsorsModalProps {
  sponsors: Sponsor[];
  onClose: () => void;
  onAdd: (name: string, notes?: string) => void;
  onUpdate: (id: string, updates: Partial<Sponsor>) => void;
  onDelete: (id: string) => void;
  isViewer?: boolean;
}

export function SponsorsModal({ sponsors, onClose, onAdd, onUpdate, onDelete, isViewer = false }: SponsorsModalProps) {
  const [newSponsorName, setNewSponsorName] = useState('');
  const [newSponsorNotes, setNewSponsorNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSponsorName.trim()) {
      onAdd(newSponsorName.trim(), newSponsorNotes.trim());
      setNewSponsorName('');
      setNewSponsorNotes('');
    }
  };

  const startEdit = (sponsor: Sponsor) => {
    setEditingId(sponsor.id);
    setEditName(sponsor.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onUpdate(editingId, { name: editName.trim() });
      setEditingId(null);
    }
  };

  const startEditNotes = (sponsor: Sponsor) => {
    setEditingNotesId(sponsor.id);
    setEditNotes(sponsor.notes || '');
  };

  const saveNotes = () => {
    if (editingNotesId) {
      onUpdate(editingNotesId, { notes: editNotes.trim() });
      setEditingNotesId(null);
    }
  };

  const toggleStatus = (sponsor: Sponsor) => {
    onUpdate(sponsor.id, { 
      status: sponsor.status === 'completed' ? 'pending' : 'completed' 
    });
  };

  const pendingSponsors = sponsors.filter(s => s.status === 'pending');
  const completedSponsors = sponsors.filter(s => s.status === 'completed');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/50 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Auspiciadores</h3>
            <p className="text-sm text-slate-500 font-medium">Registro de fotos</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Add Form */}
          <form onSubmit={handleAdd} className="flex flex-col gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-700 mb-1">Nuevo Auspiciador</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSponsorName}
                onChange={(e) => setNewSponsorName(e.target.value)}
                placeholder="Nombre del auspiciador..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                disabled={!newSponsorName.trim()}
                className="bg-indigo-600 text-white px-4 rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={newSponsorNotes}
              onChange={(e) => setNewSponsorNotes(e.target.value)}
              placeholder="Nota (opcional)..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none h-20"
            />
          </form>

          {/* Lists */}
          <div className="space-y-6">
            
            {/* Pending */}
            <div>
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Pendientes</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{pendingSponsors.length}</span>
              </h4>
              
              {pendingSponsors.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No hay auspiciadores pendientes
                </p>
              ) : (
                <div className="space-y-2">
                  {pendingSponsors.map(sponsor => (
                    <div key={sponsor.id} className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors group">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={isViewer ? undefined : () => toggleStatus(sponsor)}
                          className={`shrink-0 ${isViewer ? 'text-slate-300 cursor-default' : 'text-slate-300 hover:text-indigo-600 transition-colors'}`}
                        >
                          <Circle className="w-6 h-6" />
                        </button>
                        
                        {editingId === sponsor.id && !isViewer ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                            autoFocus
                            className="flex-1 bg-slate-50 border border-indigo-200 rounded px-2 py-1 text-sm font-bold text-slate-800 focus:outline-none"
                          />
                        ) : (
                          <span className="flex-1 font-bold text-slate-700 truncate">{sponsor.name}</span>
                        )}

                        {!isViewer && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => startEditNotes(sponsor)}
                              className={`p-1.5 rounded-lg ${sponsor.notes ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                              title="Agregar/Editar notas"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => startEdit(sponsor)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                              title="Editar nombre"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => onDelete(sponsor.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Notes Section */}
                      {(editingNotesId === sponsor.id || sponsor.notes) && (
                        <div className="pl-9 pr-2 pb-1">
                          {editingNotesId === sponsor.id ? (
                            <div className="flex gap-2">
                              <textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Agregar notas (ej. fotos en cancha 2, con jugador X)..."
                                className="flex-1 bg-slate-50 border border-indigo-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[60px] resize-y"
                                autoFocus
                              />
                              <div className="flex flex-col gap-1 shrink-0">
                                <button onClick={saveNotes} className="p-1.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200" title="Guardar notas">
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingNotesId(null)} className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200" title="Cancelar">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p 
                              className={`text-sm text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 whitespace-pre-wrap ${isViewer ? '' : 'cursor-pointer hover:bg-slate-100 transition-colors'}`}
                              onClick={isViewer ? undefined : () => startEditNotes(sponsor)}
                              title={isViewer ? undefined : "Click para editar notas"}
                            >
                              {sponsor.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed */}
            {completedSponsors.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Completados</span>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">{completedSponsors.length}</span>
                </h4>
                <div className="space-y-2">
                  {completedSponsors.map(sponsor => (
                    <div key={sponsor.id} className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl group">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={isViewer ? undefined : () => toggleStatus(sponsor)}
                          className={`shrink-0 ${isViewer ? 'text-emerald-500 cursor-default' : 'text-emerald-500 hover:text-slate-400 transition-colors'}`}
                        >
                          <CheckCircle2 className="w-6 h-6" />
                        </button>
                        
                        <span className="flex-1 font-bold text-slate-500 line-through truncate">{sponsor.name}</span>

                        {!isViewer && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => startEditNotes(sponsor)}
                              className={`p-1.5 rounded-lg ${sponsor.notes ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                              title="Agregar/Editar notas"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => onDelete(sponsor.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Notes Section for Completed */}
                      {(editingNotesId === sponsor.id || sponsor.notes) && (
                        <div className="pl-9 pr-2 pb-1">
                          {editingNotesId === sponsor.id ? (
                            <div className="flex gap-2">
                              <textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Agregar notas..."
                                className="flex-1 bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[60px] resize-y"
                                autoFocus
                              />
                              <div className="flex flex-col gap-1 shrink-0">
                                <button onClick={saveNotes} className="p-1.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200" title="Guardar notas">
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingNotesId(null)} className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300" title="Cancelar">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p 
                              className={`text-sm text-slate-400 bg-white/50 p-2 rounded-lg border border-slate-200 whitespace-pre-wrap ${isViewer ? '' : 'cursor-pointer hover:bg-white transition-colors'}`}
                              onClick={isViewer ? undefined : () => startEditNotes(sponsor)}
                              title={isViewer ? undefined : "Click para editar notas"}
                            >
                              {sponsor.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

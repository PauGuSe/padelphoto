import React, { useState } from 'react';
import { Sponsor } from '../types';
import { X, Plus, CheckCircle2, Circle, Trash2, Edit2 } from 'lucide-react';

interface SponsorsModalProps {
  sponsors: Sponsor[];
  onClose: () => void;
  onAdd: (name: string) => void;
  onUpdate: (id: string, updates: Partial<Sponsor>) => void;
  onDelete: (id: string) => void;
}

export function SponsorsModal({ sponsors, onClose, onAdd, onUpdate, onDelete }: SponsorsModalProps) {
  const [newSponsorName, setNewSponsorName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSponsorName.trim()) {
      onAdd(newSponsorName.trim());
      setNewSponsorName('');
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

  const toggleStatus = (sponsor: Sponsor) => {
    onUpdate(sponsor.id, { 
      status: sponsor.status === 'completed' ? 'pending' : 'completed' 
    });
  };

  const pendingSponsors = sponsors.filter(s => s.status === 'pending');
  const completedSponsors = sponsors.filter(s => s.status === 'completed');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
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
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newSponsorName}
              onChange={(e) => setNewSponsorName(e.target.value)}
              placeholder="Nombre del auspiciador..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={!newSponsorName.trim()}
              className="bg-indigo-600 text-white px-4 rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
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
                    <div key={sponsor.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors group">
                      <button 
                        onClick={() => toggleStatus(sponsor)}
                        className="text-slate-300 hover:text-indigo-600 transition-colors shrink-0"
                      >
                        <Circle className="w-6 h-6" />
                      </button>
                      
                      {editingId === sponsor.id ? (
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

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(sponsor)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(sponsor.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                    <div key={sponsor.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl group">
                      <button 
                        onClick={() => toggleStatus(sponsor)}
                        className="text-emerald-500 hover:text-slate-400 transition-colors shrink-0"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                      
                      <span className="flex-1 font-bold text-slate-500 line-through truncate">{sponsor.name}</span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onDelete(sponsor.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

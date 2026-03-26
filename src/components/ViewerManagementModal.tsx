import React, { useState } from 'react';
import { User, Tournament } from '../types';
import { X, Eye, Shield } from 'lucide-react';

interface ViewerManagementModalProps {
  users: User[];
  tournament: Tournament;
  onUpdateTournament: (updates: Partial<Tournament>) => void;
  onClose: () => void;
}

export function ViewerManagementModal({ users, tournament, onUpdateTournament, onClose }: ViewerManagementModalProps) {
  const viewers = users.filter(u => u.role === 'viewer');
  const [selectedViewerIds, setSelectedViewerIds] = useState<string[]>(tournament.viewerIds || []);

  const toggleViewer = (userId: string) => {
    setSelectedViewerIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = () => {
    onUpdateTournament({ viewerIds: selectedViewerIds });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Visualizadores</h2>
              <p className="text-sm text-slate-500">Asigna visualizadores al torneo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {viewers.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No hay usuarios con rol de visualizador.</p>
              <p className="text-sm mt-1">Crea uno en la Gestión de Usuarios.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {viewers.map(viewer => (
                <label 
                  key={viewer.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                      {viewer.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{viewer.username}</p>
                      <p className="text-xs text-slate-500">Visualizador</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={selectedViewerIds.includes(viewer.id)}
                    onChange={() => toggleViewer(viewer.id)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 active:scale-95 transition-all shadow-md shadow-purple-200"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}

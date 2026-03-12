import { useState } from 'react';
import { Court, Match } from '../types';
import { X, Camera, Save, Trash2, Clock } from 'lucide-react';
import { LiveTimer } from './LiveTimer';

interface MatchModalProps {
  court: Court;
  activeMatch?: Match;
  onClose: () => void;
  onStart: (courtId: number, data: any) => void;
  onUpdate: (matchId: string, data: Partial<Match>) => void;
  onEnd: (courtId: number, matchId: string) => void;
  onCancel: (courtId: number, matchId: string) => void;
}

const CATEGORIES = ['1ra', '2da', '3ra', '4ta', '5ta', '6ta', 'Mixto', 'Fem'];

export function MatchModal({ court, activeMatch, onClose, onStart, onUpdate, onEnd, onCancel }: MatchModalProps) {
  const isNew = !activeMatch;
  
  const [players, setPlayers] = useState(activeMatch?.players || '');
  const [category, setCategory] = useState(activeMatch?.category || '');
  const [notes, setNotes] = useState(activeMatch?.notes || '');
  const [photoBursts, setPhotoBursts] = useState(activeMatch?.photoBursts || 0);

  const handleStart = () => {
    onStart(court.id, { players, category, notes, photoBursts });
    onClose();
  };

  const handleUpdate = () => {
    if (activeMatch) {
      onUpdate(activeMatch.id, { players, category, notes, photoBursts });
    }
  };

  // Auto-save when modifying active match
  const handlePhotoChange = (delta: number) => {
    const newVal = Math.max(0, photoBursts + delta);
    setPhotoBursts(newVal);
    if (activeMatch) {
      onUpdate(activeMatch.id, { photoBursts: newVal });
    }
  };

  const handleEnd = () => {
    if (activeMatch) {
      onUpdate(activeMatch.id, { players, category, notes, photoBursts }); // Final save
      onEnd(court.id, activeMatch.id);
      onClose();
    }
  };

  const handleCancel = () => {
    if (activeMatch) {
      onCancel(court.id, activeMatch.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{court.name}</h2>
            {activeMatch && (
              <div className="flex items-center gap-1.5 text-sky-600 font-semibold mt-1">
                <Clock className="w-4 h-4" />
                <LiveTimer startTime={activeMatch.startTime} />
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          
          {/* Players */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Jugadores / Equipos</label>
            <input
              type="text"
              placeholder="Ej. Juan/Pedro vs Luis/Carlos"
              value={players}
              onChange={(e) => setPlayers(e.target.value)}
              onBlur={handleUpdate}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    if (activeMatch) onUpdate(activeMatch.id, { category: cat });
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    category === cat 
                      ? 'bg-sky-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Photos Counter */}
          <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100">
            <label className="block text-sm font-semibold text-sky-900 mb-3 text-center">Ráfagas de Fotos Tomadas</label>
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={() => handlePhotoChange(-1)}
                className="w-14 h-14 rounded-full bg-white text-sky-600 font-bold text-2xl shadow-sm border border-sky-200 active:scale-90 flex items-center justify-center"
              >-</button>
              <div className="flex flex-col items-center w-20">
                <span className="text-4xl font-black text-sky-700">{photoBursts}</span>
                <Camera className="w-5 h-5 text-sky-400 mt-1" />
              </div>
              <button 
                onClick={() => handlePhotoChange(1)}
                className="w-14 h-14 rounded-full bg-sky-600 text-white font-bold text-2xl shadow-md shadow-sky-600/30 active:scale-90 flex items-center justify-center"
              >+</button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Notas del Fotógrafo</label>
            <textarea
              rows={3}
              placeholder="Ej. Final muy buena, tomar más fotos al de rojo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleUpdate}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none resize-none"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-slate-50 flex flex-col gap-3 pb-safe">
          {isNew ? (
            <button
              onClick={handleStart}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
            >
              Iniciar Cobertura
            </button>
          ) : (
            <>
              <button
                onClick={handleEnd}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-slate-800/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Finalizar y Guardar
              </button>
              <button
                onClick={handleCancel}
                className="w-full bg-white border border-red-200 text-red-600 text-base font-bold py-3 rounded-xl hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Cancelar Registro
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

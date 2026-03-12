import React, { useState } from 'react';
import { Camera } from 'lucide-react';

interface SetupScreenProps {
  onSetup: (courts: number, tournamentName: string) => void;
}

export function SetupScreen({ onSetup }: SetupScreenProps) {
  const [courts, setCourts] = useState<string>('8');
  const [tournamentName, setTournamentName] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(courts, 10);
    if (count > 0 && count <= 50 && tournamentName.trim() !== '') {
      onSetup(count, tournamentName.trim());
    } else {
      alert('Por favor, ingresa un nombre de torneo y un número válido de canchas.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Camera className="w-10 h-10 text-sky-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">PadelPhoto Pro</h1>
        <p className="text-slate-500 mb-8">Configura tu jornada de torneo</p>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nombre del Torneo
            </label>
            <input
              type="text"
              placeholder="Ej. Master Final 2026"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              className="w-full text-lg font-medium p-4 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ¿Cuántas canchas tiene el club?
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={courts}
              onChange={(e) => setCourts(e.target.value)}
              className="w-full text-center text-4xl font-bold p-4 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 outline-none transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white text-lg font-bold py-4 rounded-2xl shadow-lg shadow-sky-600/30 transition-all active:scale-95"
          >
            Comenzar Torneo
          </button>
        </form>
      </div>
    </div>
  );
}

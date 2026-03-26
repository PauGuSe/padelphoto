import React, { useState } from 'react';
import { Camera, X, Power } from 'lucide-react';

interface SetupScreenProps {
  onSetup: (courts: number, tournamentName: string, themeColor?: string, tournamentLogo?: string) => void;
  onLogout: () => void;
}

export function SetupScreen({ onSetup, onLogout }: SetupScreenProps) {
  const [courts, setCourts] = useState<string>('8');
  const [tournamentName, setTournamentName] = useState<string>('');
  const [themeColor, setThemeColor] = useState<string>('#214ed3');
  const [tournamentLogo, setTournamentLogo] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(courts, 10);
    if (count > 0 && count <= 50 && tournamentName.trim() !== '') {
      onSetup(count, tournamentName.trim(), themeColor, tournamentLogo);
    } else {
      alert('Por favor, ingresa un nombre de torneo y un número válido de canchas.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A192F] p-6 relative overflow-hidden font-sans">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#214ed3] opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600 opacity-20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-xl backdrop-blur-sm border border-slate-700 transition-colors"
        >
          <Power className="w-4 h-4" />
          <span className="text-sm font-bold">Volver</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/10 p-8 text-center relative z-10">
        <div className="w-24 h-24 bg-[#214ed3] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(33,78,211,0.3)]">
          <Camera className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter italic uppercase">
          Padel<span className="text-[#214ed3]">Photo</span>
        </h1>
        <p className="text-slate-300 mb-8 font-medium">Configura tu jornada de torneo</p>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2 uppercase tracking-wide">
              Nombre del Torneo
            </label>
            <input
              type="text"
              placeholder="Ej. Master Final 2026"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              className="w-full text-lg font-medium p-4 bg-slate-900/50 border-2 border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:border-[#214ed3] focus:ring-4 focus:ring-[#214ed3]/20 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2 uppercase tracking-wide">
              ¿Cuántas canchas tiene el club?
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={courts}
              onChange={(e) => setCourts(e.target.value)}
              className="w-full text-center text-4xl font-black p-4 bg-slate-900/50 border-2 border-slate-700 rounded-2xl text-[#214ed3] focus:border-[#214ed3] focus:ring-4 focus:ring-[#214ed3]/20 outline-none transition-all"
              required
            />
          </div>
          
          <div className="pt-4 border-t border-slate-700/50">
            <h4 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wide">Personalización</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">COLOR DEL TEMA</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-700 focus-within:border-[#214ed3] transition-colors">
                    <input 
                      type="color" 
                      value={themeColor} 
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] cursor-pointer border-0 p-0"
                    />
                  </div>
                  <span className="text-sm text-slate-300 font-mono bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700">{themeColor.toUpperCase()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">LOGO DEL TORNEO</label>
                <div className="flex items-center gap-3">
                  {tournamentLogo ? (
                    <div className="relative w-14 h-14 rounded-xl border-2 border-slate-700 overflow-hidden bg-slate-900/50 flex items-center justify-center shrink-0">
                      <img src={tournamentLogo} alt="Logo" className="max-w-full max-h-full object-contain p-1" />
                      <button 
                        type="button"
                        onClick={() => setTournamentLogo(undefined)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 flex items-center justify-center shrink-0">
                      <span className="text-xs text-slate-500 font-medium">Logo</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    id="setup-logo-upload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setTournamentLogo(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label 
                    htmlFor="setup-logo-upload"
                    className="text-sm bg-slate-800 text-slate-200 px-4 py-2.5 rounded-xl font-bold cursor-pointer hover:bg-slate-700 transition-colors border border-slate-600"
                  >
                    {tournamentLogo ? 'Cambiar logo' : 'Subir logo'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#214ed3] hover:bg-[#1e3a8a] text-white text-xl font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(33,78,211,0.4)] transition-all active:scale-95 mt-4 uppercase tracking-wide"
          >
            Comenzar Torneo
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Tournament, User } from '../types';
import { exportToCSV } from '../lib/utils';
import { generatePDFReport } from '../lib/pdfGenerator';
import { Download, Camera, Clock, Activity, Calendar, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function StatsView({ state }: { state: Tournament & { currentUser: User | null, users: User[] } }) {
  const [selectedJornada, setSelectedJornada] = useState<number | 'all'>('all');

  // Get unique jornadas that have matches
  const availableJornadas = useMemo(() => {
    const jornadas = Array.from(new Set(state.matches.map(m => m.jornada))).sort((a, b) => a - b);
    return jornadas;
  }, [state.matches]);

  const filteredMatches = useMemo(() => {
    if (selectedJornada === 'all') return state.matches;
    return state.matches.filter(m => m.jornada === selectedJornada);
  }, [state.matches, selectedJornada]);

  const completedMatches = filteredMatches.filter(m => m.endTime !== null);
  const totalPhotos = filteredMatches.reduce((acc, m) => acc + m.photoBursts, 0);
  
  const totalDurationSeconds = completedMatches.reduce((acc, m) => acc + (m.duration || 0), 0);
  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);

  // Stats by court for the filtered matches
  const courtStats = state.courts.map(c => {
    const matchesInCourt = completedMatches.filter(m => m.courtId === c.id);
    return {
      name: `C${c.id}`,
      partidos: matchesInCourt.length,
      fotos: matchesInCourt.reduce((acc, m) => acc + m.photoBursts, 0)
    };
  }).filter(c => c.partidos > 0);

  return (
    <div className="p-4 pb-24 space-y-6 max-w-3xl mx-auto w-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Estadísticas</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => generatePDFReport(state, selectedJornada, filteredMatches, courtStats)}
              className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold hover:bg-indigo-200 active:scale-95 transition-all text-sm"
              title="Descargar PDF"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button 
              onClick={() => exportToCSV(filteredMatches, state.jornadas, `${state.tournamentName}${selectedJornada === 'all' ? '' : `_jornada_${selectedJornada}`}`)}
              className="flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-xl font-bold hover:bg-sky-200 active:scale-95 transition-all text-sm"
              title="Exportar CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>

        {/* Jornada Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSelectedJornada('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              selectedJornada === 'all' 
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' 
                : 'bg-white text-slate-500 border border-slate-200 hover:border-sky-300'
            }`}
          >
            Resumen Total
          </button>
          {availableJornadas.map(j => {
            const jornadaData = state.jornadas.find(jd => jd.number === j);
            return (
              <button
                key={j}
                onClick={() => setSelectedJornada(j)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedJornada === j 
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-sky-300'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {jornadaData?.name || `Jornada ${j}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100/50 flex flex-col">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-3xl font-black text-slate-800">{completedMatches.length}</span>
          <span className="text-sm font-semibold text-slate-500">Partidos Cubiertos</span>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100/50 flex flex-col">
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mb-3">
            <Camera className="w-5 h-5 text-sky-600" />
          </div>
          <span className="text-3xl font-black text-slate-800">{totalPhotos}</span>
          <span className="text-sm font-semibold text-slate-500">Ráfagas de Fotos</span>
        </div>

        <div className={`bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100/50 flex flex-col ${selectedJornada !== 'all' ? 'col-span-2 sm:col-span-1' : ''}`}>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-3xl font-black text-slate-800">
            {totalHours > 0 ? `${totalHours}h ` : ''}{totalMinutes}m
          </span>
          <span className="text-sm font-semibold text-slate-500">Tiempo de Cobertura</span>
        </div>

        {selectedJornada === 'all' && (
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100/50 flex flex-col">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-3xl font-black text-slate-800">{availableJornadas.length}</span>
            <span className="text-sm font-semibold text-slate-500">Jornadas Totales</span>
          </div>
        )}
      </div>

      {/* Chart */}
      {courtStats.length > 0 ? (
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-100/50">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {selectedJornada === 'all' ? 'Partidos por Cancha (Total)' : `Partidos por Cancha (Jornada ${selectedJornada})`}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courtStats}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="partidos" radius={[6, 6, 0, 0]}>
                  {courtStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#0ea5e9" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-slate-100/50 text-center">
          <p className="text-slate-500">No hay partidos registrados en esta vista.</p>
        </div>
      )}

      {/* Jornada Breakdown (Only in Global View) */}
      {selectedJornada === 'all' && availableJornadas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 px-1">Resumen por Jornada</h3>
          <div className="grid gap-3">
            {availableJornadas.map(j => {
              const jMatches = state.matches.filter(m => m.jornada === j && m.endTime !== null);
              const jPhotos = state.matches.filter(m => m.jornada === j).reduce((acc, m) => acc + m.photoBursts, 0);
              const jDuration = jMatches.reduce((acc, m) => acc + (m.duration || 0), 0);
              const h = Math.floor(jDuration / 3600);
              const m = Math.floor((jDuration % 3600) / 60);
              const jornadaData = state.jornadas.find(jd => jd.number === j);

              return (
                <button 
                  key={j} 
                  onClick={() => setSelectedJornada(j)}
                  className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100/50 flex items-center justify-between hover:border-sky-300 transition-all group text-left w-full"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors">
                      J{j}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{jornadaData?.name || `Jornada ${j}`}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {jornadaData?.date ? `${jornadaData.date} • ` : ''}
                        {jMatches.length} partidos • {h > 0 ? `${h}h ` : ''}{m}m cobertura
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-sky-600">{jPhotos}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fotos</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

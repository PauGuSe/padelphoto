import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function exportToCSV(matches: any[], jornadas: any[], tournamentName: string = 'torneo') {
  if (matches.length === 0) {
    alert('No hay partidos para exportar.');
    return;
  }

  const headers = ['ID', 'Jornada', 'Cancha', 'Jugadores', 'Categoría', 'Ráfagas Fotos', 'Notas', 'Inicio', 'Fin', 'Duración (min)'];
  
  const rows = matches.map(m => {
    const jornadaData = jornadas.find(j => j.number === m.jornada);
    const jName = jornadaData?.name || `Jornada ${m.jornada}`;
    const jDate = jornadaData?.date || new Date(m.startTime).toLocaleDateString();
    
    const start = new Date(m.startTime).toLocaleTimeString();
    const end = m.endTime ? new Date(m.endTime).toLocaleTimeString() : 'En curso';
    
    let dur = '-';
    if (m.endTime) {
      const diffMs = new Date(m.endTime).getTime() - new Date(m.startTime).getTime();
      dur = Math.round(diffMs / 60000).toString();
    } else if (m.duration) {
      dur = (m.duration / 60).toFixed(1);
    }
    
    const generatedId = `"${jName}/${jDate}/${start}"`;
    
    return [
      generatedId,
      m.jornada,
      m.courtId,
      `"${m.players.replace(/"/g, '""')}"`,
      `"${m.category}"`,
      m.photoBursts,
      `"${m.notes.replace(/"/g, '""')}"`,
      start,
      end,
      dur
    ].join(',');
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  
  const safeName = tournamentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.setAttribute("download", `reporte_${safeName}_${new Date().toISOString().split('T')[0]}.csv`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

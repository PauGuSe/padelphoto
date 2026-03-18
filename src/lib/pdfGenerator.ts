import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppState, Match } from '../types';

export function generatePDFReport(
  state: AppState,
  selectedJornada: number | 'all',
  filteredMatches: Match[],
  courtStats: { name: string; partidos: number; fotos: number }[]
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const title = state.tournamentName || 'Torneo de Pádel';
  const subtitle = selectedJornada === 'all' ? 'Reporte de Análisis General' : `Reporte de Análisis - Jornada ${selectedJornada}`;
  
  // --- HEADER ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 15, 22);
  
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, 15, 30);
  
  // --- KPIs ---
  const completedMatches = filteredMatches.filter(m => m.endTime !== null);
  const totalPhotos = filteredMatches.reduce((acc, m) => acc + m.photoBursts, 0);
  const totalDurationSeconds = completedMatches.reduce((acc, m) => acc + (m.duration || 0), 0);
  const h = Math.floor(totalDurationSeconds / 3600);
  const m = Math.floor((totalDurationSeconds % 3600) / 60);
  const timeString = `${h > 0 ? `${h}h ` : ''}${m}m`;
  const estimatedPhotos = totalPhotos * 20;

  let currentY = 50;
  
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen de Impacto', 15, currentY);
  currentY += 8;

  const boxW = (pageWidth - 34) / 2; // 15 margin left, 15 right, 4 gap = 34. 210-34 = 176 / 2 = 88
  const boxH = 26;
  
  function drawKPI(x: number, y: number, w: number, h: number, boxTitle: string, value: string, isHighlighted = false) {
    if (isHighlighted) {
      doc.setFillColor(99, 102, 241); // indigo-500
      doc.setDrawColor(99, 102, 241);
    } else {
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
    }
    doc.roundedRect(x, y, w, h, 3, 3, 'FD');
    
    if (isHighlighted) {
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setTextColor(15, 23, 42); // slate-900
    }
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x + w/2, y + 12, { align: 'center' });
    
    if (isHighlighted) {
      doc.setTextColor(224, 231, 255); // indigo-100
    } else {
      doc.setTextColor(100, 116, 139); // slate-500
    }
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(boxTitle, x + w/2, y + 20, { align: 'center' });
  }

  drawKPI(15, currentY, boxW, boxH, 'Partidos Cubiertos', completedMatches.length.toString());
  drawKPI(15 + boxW + 4, currentY, boxW, boxH, 'Tiempo de Cobertura', timeString);
  currentY += boxH + 4;
  drawKPI(15, currentY, boxW, boxH, 'Ráfagas de Fotos', totalPhotos.toString());
  drawKPI(15 + boxW + 4, currentY, boxW, boxH, 'Fotos en Memoria (Aprox)', `~${estimatedPhotos.toLocaleString()}`, true);
  
  currentY += boxH + 15;

  // --- CHARTS: Actividad por Cancha ---
  if (courtStats.length > 0) {
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Rendimiento por Cancha', 15, currentY);
    currentY += 10;

    const maxPartidos = Math.max(...courtStats.map(c => c.partidos));
    const chartX = 15;
    const labelWidth = 25;
    const maxBarWidth = pageWidth - 30 - labelWidth - 30; // 30 for value text

    courtStats.forEach((c) => {
      // Check page break
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      const barWidth = maxPartidos > 0 ? (c.partidos / maxPartidos) * maxBarWidth : 0;
      
      // Label
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(c.name, chartX, currentY + 5);
      
      // Bar
      doc.setFillColor(56, 189, 248); // sky-400
      doc.roundedRect(chartX + labelWidth, currentY, Math.max(barWidth, 2), 7, 1, 1, 'F');
      
      // Value
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(`${c.partidos} partidos`, chartX + labelWidth + Math.max(barWidth, 2) + 3, currentY + 5);
      
      currentY += 12;
    });
    
    currentY += 10;
  }

  // --- JORNADAS BREAKDOWN ---
  if (selectedJornada === 'all' && state.jornadas.length > 0) {
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Análisis por Jornada', 15, currentY);
    
    const jornadasData = state.jornadas.map(j => {
      const jMatches = state.matches.filter(m => m.jornada === j.number && m.endTime !== null);
      const jPhotos = state.matches.filter(m => m.jornada === j.number).reduce((acc, m) => acc + m.photoBursts, 0);
      const jDuration = jMatches.reduce((acc, m) => acc + (m.duration || 0), 0);
      const jh = Math.floor(jDuration / 3600);
      const jm = Math.floor((jDuration % 3600) / 60);
      const jEstPhotos = jPhotos * 20;
      
      return [
        j.name || `Jornada ${j.number}`,
        jMatches.length.toString(),
        `${jh > 0 ? `${jh}h ` : ''}${jm}m`,
        jPhotos.toString(),
        `~${jEstPhotos.toLocaleString()}`
      ];
    }).filter(row => parseInt(row[1]) > 0); // Only show jornadas with matches

    if (jornadasData.length > 0) {
      autoTable(doc, {
        startY: currentY + 6,
        head: [['Jornada', 'Partidos', 'Tiempo', 'Ráfagas', 'Fotos Estimadas']],
        body: jornadasData,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
        styles: { fontSize: 10, cellPadding: 4 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      currentY += 10;
    }
  }

  // --- SPONSORS ---
  if (state.sponsors && state.sponsors.length > 0) {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Estado de Auspiciadores', 15, currentY);
    
    const completedSponsors = state.sponsors.filter(s => s.status === 'completed').length;
    const totalSponsors = state.sponsors.length;
    
    autoTable(doc, {
      startY: currentY + 6,
      head: [['Auspiciador', 'Estado']],
      body: state.sponsors.map(s => [s.name, s.status === 'completed' ? 'Completado' : 'Pendiente']),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // indigo-600
      styles: { fontSize: 10, cellPadding: 4 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      foot: [[`Total: ${totalSponsors}`, `Completados: ${completedSponsors}`]],
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
    });
  }

  // Footer with timestamp
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Generado el ${new Date().toLocaleString()} - Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const fileName = `${title.replace(/\s+/g, '_')}_${selectedJornada === 'all' ? 'Analisis_Total' : `Analisis_J${selectedJornada}`}.pdf`;
  doc.save(fileName);
}

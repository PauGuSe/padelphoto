import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Tournament, Match, User } from '../types';

export function generatePDFReport(
  state: Tournament & { currentUser: User | null, users: User[] },
  selectedJornada: number | 'all',
  filteredMatches: Match[],
  courtStats: { name: string; partidos: number; fotos: number }[]
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const title = state.tournamentName || 'Torneo de Pádel';
  const jornadaData = selectedJornada !== 'all' ? state.jornadas.find(j => j.number === selectedJornada) : null;
  const subtitle = selectedJornada === 'all' 
    ? 'Reporte de Análisis General' 
    : `Reporte de Análisis - ${jornadaData?.name || `Jornada ${selectedJornada}`}${jornadaData?.date ? ` (${jornadaData.date})` : ''}`;
  
  // Helper to convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [33, 78, 211];
  };

  // Colors
  const royalBlue: [number, number, number] = state.themeColor ? hexToRgb(state.themeColor) : [33, 78, 211];
  const slate900: [number, number, number] = [15, 23, 42];
  const slate50: [number, number, number] = [248, 250, 252];

  // --- PAGE 1: HEADER & IMPACT SUMMARY ---
  doc.setFillColor(slate900[0], slate900[1], slate900[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  
  // Adjust title width if logo is present
  const maxTitleWidth = state.tournamentLogo ? pageWidth - 60 : pageWidth - 30;
  const splitTitle = doc.splitTextToSize(title.toUpperCase(), maxTitleWidth);
  doc.text(splitTitle, 15, 25);
  
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, 15, 25 + (splitTitle.length * 10));

  if (state.tournamentLogo) {
    try {
      // Add logo to the top right
      doc.addImage(state.tournamentLogo, 'PNG', pageWidth - 45, 10, 30, 30, undefined, 'FAST');
    } catch (e) {
      console.error('Failed to add logo to PDF', e);
    }
  }

  const completedMatches = filteredMatches.filter(m => m.endTime !== null);
  const totalPhotos = filteredMatches.reduce((acc, m) => acc + m.photoBursts, 0);
  const totalDurationSeconds = completedMatches.reduce((acc, m) => acc + (m.duration || 0), 0);
  const totalMinutes = Math.floor(totalDurationSeconds / 60);
  const totalHours = (totalDurationSeconds / 3600).toFixed(1);
  
  // FIX: Calculate unique dates from jornadas (if 'all', use all jornadas; if specific, use that one)
  const jornadasToCount = selectedJornada === 'all' 
    ? state.jornadas 
    : state.jornadas.filter(j => j.number === selectedJornada);
  
  // Extract only the date part (YYYY-MM-DD) ignoring the time part if present
  const uniqueDates = new Set(
    jornadasToCount
      .map(j => j.date ? j.date.split(' ')[0] : null)
      .filter(Boolean)
  );
  // Strictly use the number of unique dates. If none are set, default to 1.
  const totalDays = uniqueDates.size > 0 ? uniqueDates.size : 1;
  const categoriesCovered = Array.from(new Set(completedMatches.map(m => m.category))).filter(Boolean);

  let currentY = 65;
  doc.setTextColor(slate900[0], slate900[1], slate900[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('1. RESUMEN DE IMPACTO', 15, currentY);
  currentY += 12;

  const boxW = (pageWidth - 40) / 2;
  const boxH = 35;

  function drawImpactBox(x: number, y: number, value: string, label: string, sublabel?: string) {
    doc.setFillColor(slate50[0], slate50[1], slate50[2]);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, boxW, boxH, 4, 4, 'FD');
    
    doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x + boxW/2, y + 15, { align: 'center' });
    
    doc.setTextColor(slate900[0], slate900[1], slate900[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(label, x + boxW/2, y + 23, { align: 'center' });
    
    if (sublabel) {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(sublabel, x + boxW/2, y + 29, { align: 'center' });
    }
  }

  drawImpactBox(15, currentY, completedMatches.length.toString(), 'Partidos documentados', 'Sin interrupciones');
  drawImpactBox(15 + boxW + 10, currentY, `~${totalMinutes}`, 'Minutos netos de juego', `Casi ${totalHours} horas de acción`);
  currentY += boxH + 10;
  drawImpactBox(15, currentY, totalDays.toString(), 'Días de cobertura', `Jornadas registradas`);
  
  // Categories box
  doc.setFillColor(slate50[0], slate50[1], slate50[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15 + boxW + 10, currentY, boxW, boxH, 4, 4, 'FD');
  doc.setTextColor(slate900[0], slate900[1], slate900[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Cobertura Transversal', 15 + boxW + 10 + boxW/2, currentY + 10, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const catText = categoriesCovered.length > 0 ? categoriesCovered.join(', ') : 'Todas las categorías';
  doc.text(doc.splitTextToSize(catText, boxW - 10), 15 + boxW + 10 + boxW/2, currentY + 18, { align: 'center' });

  currentY += boxH + 20;

  // --- 2. RENDIMIENTO POR CANCHA ---
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('2. RENDIMIENTO POR CANCHA', 15, currentY);
  currentY += 10;

  // Heatmap Grid
  const gridX = 15;
  const gridW = pageWidth - 30;
  const courtW = (gridW - 15) / 4;
  const courtH = 25;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Mapa de calor de la acción (Distribución por pista)', 15, currentY);
  currentY += 5;

  const maxMatches = Math.max(...courtStats.map(c => c.partidos), 1);
  
  state.courts.forEach((court, idx) => {
    const row = Math.floor(idx / 4);
    const col = idx % 4;
    const x = gridX + col * (courtW + 5);
    const y = currentY + row * (courtH + 5);
    
    const stats = courtStats.find(s => s.name === `C${court.id}`);
    const matches = stats?.partidos || 0;
    const intensity = matches / maxMatches;
    
    if (matches === 0) {
      doc.setFillColor(241, 245, 249);
    } else {
      const r = Math.round(219 - (219 - 33) * intensity);
      const g = Math.round(234 - (234 - 78) * intensity);
      const b = Math.round(254 - (254 - 211) * intensity);
      doc.setFillColor(r, g, b);
    }
    
    doc.roundedRect(x, y, courtW, courtH, 2, 2, 'F');
    doc.setTextColor(matches > maxMatches / 2 ? 255 : 15, matches > maxMatches / 2 ? 255 : 23, matches > maxMatches / 2 ? 255 : 42);
    doc.setFontSize(8);
    doc.text(court.name, x + courtW/2, y + 8, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${matches}`, x + courtW/2, y + 18, { align: 'center' });
  });

  currentY += (Math.ceil(state.courts.length / 4) * (courtH + 5)) + 15;

  // Top 3 Courts
  const top3 = [...courtStats].sort((a, b) => b.partidos - a.partidos).slice(0, 3);
  if (top3.length > 0) {
    doc.setTextColor(slate900[0], slate900[1], slate900[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Top 3 Canchas con más actividad', 15, currentY);
    currentY += 8;

    top3.forEach((c) => {
      const barMaxW = pageWidth - 60;
      const barW = (c.partidos / maxMatches) * barMaxW;
      doc.setFillColor(royalBlue[0], royalBlue[1], royalBlue[2]);
      doc.rect(15, currentY, barW, 6, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`${c.name}: ${c.partidos} partidos`, 15 + barW + 5, currentY + 5);
      currentY += 10;
    });
  }

  // --- PAGE 2: JORNADAS & CATEGORIES ---
  doc.addPage();
  currentY = 25;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(slate900[0], slate900[1], slate900[2]);
  doc.text('3. ANÁLISIS POR JORNADA', 15, currentY);
  currentY += 8;

  // FIX: Ensure all jornadas from the state are listed when in 'all' view
  const jornadasToShow = selectedJornada === 'all' 
    ? state.jornadas 
    : state.jornadas.filter(j => j.number === selectedJornada);

  const jornadasData = jornadasToShow.map(j => {
    const jMatches = state.matches.filter(m => m.jornada === j.number && m.endTime !== null);
    const jPhotos = state.matches.filter(m => m.jornada === j.number).reduce((acc, m) => acc + m.photoBursts, 0);
    const jDuration = jMatches.reduce((acc, m) => acc + (m.duration || 0), 0);
    const jh = Math.floor(jDuration / 3600);
    const jm = Math.floor((jDuration % 3600) / 60);
    
    return [
      j.name || `Jornada ${j.number}`,
      j.date || '-',
      jMatches.length.toString(),
      `${jh > 0 ? `${jh}h ` : ''}${jm}m`,
      jPhotos.toString()
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Jornada', 'Fecha', 'Partidos', 'Minutos', 'Ráfagas']],
    body: jornadasData,
    theme: 'grid',
    headStyles: { fillColor: slate900 },
    styles: { fontSize: 10, cellPadding: 4 },
    alternateRowStyles: { fillColor: slate50 }
  });
  currentY = (doc as any).lastAutoTable.finalY + 20;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('4. ANÁLISIS POR CATEGORÍA', 15, currentY);
  currentY += 8;

  const categoryStats = state.categories.map(cat => {
    const matchesInCat = completedMatches.filter(m => m.category === cat);
    const photosInCat = matchesInCat.reduce((acc, m) => acc + m.photoBursts, 0);
    return [cat, matchesInCat.length.toString(), photosInCat.toString()];
  }).filter(row => parseInt(row[1]) > 0);

  autoTable(doc, {
    startY: currentY,
    head: [['Categoría', 'Partidos', 'Ráfagas']],
    body: categoryStats,
    theme: 'grid',
    headStyles: { fillColor: royalBlue },
    styles: { fontSize: 10, cellPadding: 4 },
    alternateRowStyles: { fillColor: slate50 }
  });
  currentY = (doc as any).lastAutoTable.finalY + 20;

  // --- 5. AUSPICIADORES ---
  if (state.sponsors && state.sponsors.length > 0) {
    // Check if we need a new page
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 25;
    }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(slate900[0], slate900[1], slate900[2]);
    doc.text('5. ESTADO DE AUSPICIADORES', 15, currentY);
    currentY += 8;

    const sponsorsData = state.sponsors.map(s => [
      s.name,
      s.status === 'completed' ? 'Completado' : 'Pendiente',
      s.notes || '-'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Auspiciador', 'Estado', 'Notas']],
      body: sponsorsData,
      theme: 'grid',
      headStyles: { fillColor: slate900 },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { textColor: [100, 116, 139] },
        2: { cellWidth: 'auto' }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 1) {
          if (data.cell.raw === 'Completado') {
            data.cell.styles.textColor = [16, 185, 129]; // emerald-500
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [245, 158, 11]; // amber-500
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      alternateRowStyles: { fillColor: slate50 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 20;
  }

  // --- PAGE: FINAL RESULTS (VERTICAL LAYOUT) ---
  doc.addPage();
  doc.setFillColor(slate900[0], slate900[1], slate900[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  currentY = 40;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('EL RESULTADO FINAL', pageWidth/2, currentY, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Transformando el esfuerzo en un archivo histórico', pageWidth/2, currentY + 12, { align: 'center' });
  
  currentY += 40;
  
  const photoPerDay = jornadasToShow.map(j => {
    const count = state.matches.filter(m => m.jornada === j.number).reduce((acc, m) => acc + m.photoBursts, 0);
    return { name: j.name || `J${j.number}`, count };
  }).filter(d => d.count > 0);

  // Vertical layout for final summary
  let photoListY = currentY;
  doc.setFontSize(18);
  photoPerDay.forEach(d => {
    doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(d.count.toString(), 60, photoListY);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text(d.name, 90, photoListY);
    photoListY += 14;
  });
  doc.setFontSize(12);
  doc.text('FOTOGRAFÍAS X DÍA', pageWidth/2, photoListY + 5, { align: 'center' });

  currentY = photoListY + 25;
  
  // Multiplication visual (Vertical)
  doc.setFontSize(40);
  doc.setTextColor(255, 255, 255);
  doc.text('X', pageWidth/2, currentY, { align: 'center' });
  
  currentY += 25;
  doc.setFontSize(60);
  doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
  doc.text(totalDays.toString(), pageWidth/2, currentY, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('DÍAS DE COBERTURA', pageWidth/2, currentY + 12, { align: 'center' });

  currentY += 35;
  doc.setFontSize(50);
  doc.text('=', pageWidth/2, currentY, { align: 'center' });

  currentY += 15;
  // Final Box (Centered)
  const finalBoxW = 100;
  const finalBoxH = 60;
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.rect((pageWidth - finalBoxW)/2, currentY, finalBoxW, finalBoxH);
  
  doc.setFontSize(42);
  doc.setTextColor(255, 255, 255);
  doc.text(totalPhotos.toLocaleString(), pageWidth/2, currentY + 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text('RÁFAGAS TOTALES', pageWidth/2, currentY + 32, { align: 'center' });
  doc.setFontSize(18);
  doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
  doc.text(`~${(totalPhotos * 20).toLocaleString()} FOTOS ENTREGADAS`, pageWidth/2, currentY + 48, { align: 'center' });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Generado el ${new Date().toLocaleString()} - Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  const fileName = `${title.replace(/\s+/g, '_')}_Reporte.pdf`;
  doc.save(fileName);
}

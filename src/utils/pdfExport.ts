import { jsPDF } from 'jspdf';
import { PuzzlePage, KdpMarginConfig } from '../types';
import { drawMandalaToCanvas } from '../generators/mandala';

export interface ExportProgress {
  currentPage: number;
  totalPages: number;
  status: string;
}

export async function exportBookToPdf(
  pages: PuzzlePage[],
  config: KdpMarginConfig,
  themeName: string,
  includeSolutions = true,
  onProgress?: (progress: ExportProgress) => void
): Promise<Blob> {
  // 8.5 x 11 inches in points (72 points per inch)
  const baseWidthInches = 8.5;
  const baseHeightInches = 11.0;
  const bleedInches = config.bleed ? config.bleedInches : 0; // 0.125"

  const pageWidth = (baseWidthInches + (config.bleed ? bleedInches : 0)) * 72;
  const pageHeight = (baseHeightInches + (config.bleed ? bleedInches * 2 : 0)) * 72;

  // Initialize jsPDF document in points
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [pageWidth, pageHeight],
    compress: true,
  });

  const totalPages = pages.length;

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) {
      doc.addPage([pageWidth, pageHeight], 'portrait');
    }

    const pageIndex = i + 1;
    const page = pages[i];
    const isOdd = pageIndex % 2 !== 0;

    // Gutter margin: spine is on Left for odd pages, Right for even pages
    const gutter = config.gutterMarginInches * 72;
    const safeMargin = config.safeMarginInches * 72;
    const bleedOffset = bleedInches * 72;

    const leftMargin = (isOdd ? safeMargin + gutter : safeMargin) + (config.bleed ? bleedOffset : 0);
    const rightMargin = (isOdd ? safeMargin : safeMargin + gutter) + (config.bleed ? bleedOffset : 0);
    const topMargin = safeMargin + 30 + (config.bleed ? bleedOffset : 0);
    const bottomMargin = safeMargin + 30 + (config.bleed ? bleedOffset : 0);

    const contentWidth = pageWidth - leftMargin - rightMargin;
    const contentHeight = pageHeight - topMargin - bottomMargin;

    if (onProgress) {
      onProgress({
        currentPage: pageIndex,
        totalPages: totalPages + (includeSolutions ? 19 : 0),
        status: `Rendering Page ${pageIndex} of ${totalPages} (${page.type.toUpperCase()})...`,
      });
    }

    // Header & Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(20, 20, 20);

    let headerTitle = '';
    if (page.type === 'sudoku') {
      headerTitle = `Sudoku #${page.data.puzzleNumber} - ${page.data.difficulty}`;
    } else if (page.type === 'wordsearch') {
      headerTitle = `Word Search #${page.data.puzzleNumber}: ${page.data.subtheme}`;
    } else if (page.type === 'maze') {
      headerTitle = `Maze Challenge #${page.data.puzzleNumber}`;
    } else if (page.type === 'coloring') {
      headerTitle = `Coloring Art #${page.data.puzzleNumber}: ${page.data.title}`;
    }

    // Center header text in content area
    const titleX = leftMargin + contentWidth / 2;
    doc.text(headerTitle, titleX, topMargin - 8, { align: 'center' });

    // Running theme sub-header
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(themeName.toUpperCase(), titleX, topMargin - 22, { align: 'center' });

    // Render Page Content based on puzzle type
    if (page.type === 'sudoku') {
      renderSudokuToPdf(doc, page.data.grid, leftMargin, topMargin, contentWidth, contentHeight);
    } else if (page.type === 'wordsearch') {
      renderWordSearchToPdf(
        doc,
        page.data.grid,
        page.data.words,
        leftMargin,
        topMargin,
        contentWidth,
        contentHeight
      );
    } else if (page.type === 'maze') {
      renderMazeToPdf(
        doc,
        page.data.grid,
        page.data.start,
        page.data.finish,
        leftMargin,
        topMargin,
        contentWidth,
        contentHeight
      );
    } else if (page.type === 'coloring') {
      await renderColoringToPdf(
        doc,
        page.data,
        leftMargin,
        topMargin,
        contentWidth,
        contentHeight
      );
    }

    // Page Number Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `- ${pageIndex} -`,
      titleX,
      pageHeight - (config.bleed ? bleedOffset : 0) - (safeMargin / 2),
      { align: 'center' }
    );

    // Yield control briefly for smooth UI updates
    if (i % 5 === 0) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  // Render Solutions Appendix if enabled
  if (includeSolutions) {
    await renderSolutionsAppendix(doc, pages, config, themeName, pageWidth, pageHeight, onProgress);
  }

  return doc.output('blob');
}

// -------------------------------------------------------------
// Vector Renderers for PDF
// -------------------------------------------------------------

function renderSudokuToPdf(
  doc: jsPDF,
  grid: number[][],
  x: number,
  y: number,
  availWidth: number,
  availHeight: number
) {
  const boardSize = Math.min(availWidth, availHeight * 0.85);
  const startX = x + (availWidth - boardSize) / 2;
  const startY = y + (availHeight - boardSize) / 2 - 20;
  const cellSize = boardSize / 9;

  // Background box
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(2.5);
  doc.rect(startX, startY, boardSize, boardSize);

  // Grid lines
  for (let i = 1; i < 9; i++) {
    const isMajor = i % 3 === 0;
    doc.setLineWidth(isMajor ? 2.0 : 0.75);
    // Vertical line
    doc.line(startX + i * cellSize, startY, startX + i * cellSize, startY + boardSize);
    // Horizontal line
    doc.line(startX, startY + i * cellSize, startX + boardSize, startY + i * cellSize);
  }

  // Numbers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(cellSize * 0.55);
  doc.setTextColor(0, 0, 0);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val !== 0) {
        const textX = startX + c * cellSize + cellSize / 2;
        const textY = startY + r * cellSize + cellSize * 0.7;
        doc.text(String(val), textX, textY, { align: 'center' });
      }
    }
  }

  // Instructions note at bottom
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(
    'Fill in the 9x9 grid so that every row, column, and 3x3 box contains numbers 1-9.',
    x + availWidth / 2,
    startY + boardSize + 35,
    { align: 'center' }
  );
}

function renderWordSearchToPdf(
  doc: jsPDF,
  grid: string[][],
  words: string[],
  x: number,
  y: number,
  availWidth: number,
  availHeight: number
) {
  const gridSize = grid.length;
  const gridPixelSize = Math.min(availWidth * 0.9, availHeight * 0.58);
  const startX = x + (availWidth - gridPixelSize) / 2;
  const startY = y + 10;
  const cellSize = gridPixelSize / gridSize;

  // Outer border
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(1.5);
  doc.rect(startX, startY, gridPixelSize, gridPixelSize);

  // Subtle interior grid lines
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.5);
  for (let i = 1; i < gridSize; i++) {
    doc.line(startX + i * cellSize, startY, startX + i * cellSize, startY + gridPixelSize);
    doc.line(startX, startY + i * cellSize, startX + gridPixelSize, startY + i * cellSize);
  }

  // Letters
  doc.setFont('courier', 'bold');
  doc.setFontSize(cellSize * 0.56);
  doc.setTextColor(10, 10, 10);

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const char = grid[r][c];
      const charX = startX + c * cellSize + cellSize / 2;
      const charY = startY + r * cellSize + cellSize * 0.72;
      doc.text(char, charX, charY, { align: 'center' });
    }
  }

  // Word List Box at bottom
  const wordBoxY = startY + gridPixelSize + 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('WORDS TO FIND:', x + availWidth / 2, wordBoxY, { align: 'center' });

  // 3-column or 4-column layout for words
  const cols = words.length > 9 ? 3 : 2;
  const colWidth = availWidth / cols;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);

  words.forEach((word, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const wordX = x + col * colWidth + colWidth / 2;
    const wordY = wordBoxY + 18 + row * 16;
    doc.text(`[  ] ${word}`, wordX, wordY, { align: 'center' });
  });
}

function renderMazeToPdf(
  doc: jsPDF,
  grid: number[][],
  start: [number, number],
  finish: [number, number],
  x: number,
  y: number,
  availWidth: number,
  availHeight: number
) {
  const rows = grid.length;
  const cols = grid[0].length;
  const mazeSize = Math.min(availWidth * 0.9, availHeight * 0.82);
  const startX = x + (availWidth - mazeSize) / 2;
  const startY = y + (availHeight - mazeSize) / 2 - 10;
  const cellW = mazeSize / cols;
  const cellH = mazeSize / rows;

  doc.setFillColor(20, 20, 20);
  doc.setDrawColor(20, 20, 20);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        doc.rect(startX + c * cellW, startY + r * cellH, cellW + 0.1, cellH + 0.1, 'F');
      }
    }
  }

  // START & FINISH labels
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 140, 50);
  doc.text('START ->', startX + start[1] * cellW - 8, startY + start[0] * cellH + cellH / 2 + 4, {
    align: 'right',
  });

  doc.setTextColor(200, 20, 20);
  doc.text('-> FINISH', startX + finish[1] * cellW + cellW + 8, startY + finish[0] * cellH + cellH / 2 + 4, {
    align: 'left',
  });
}

async function renderColoringToPdf(
  doc: jsPDF,
  mandala: any,
  x: number,
  y: number,
  availWidth: number,
  availHeight: number
) {
  // If AI line art image is present, embed image directly
  if (mandala.aiImageUrl) {
    const imgSize = Math.min(availWidth, availHeight * 0.88);
    const startX = x + (availWidth - imgSize) / 2;
    const startY = y + (availHeight - imgSize) / 2;
    try {
      doc.addImage(mandala.aiImageUrl, 'PNG', startX, startY, imgSize, imgSize);
      return;
    } catch (e) {
      console.warn('Failed to embed AI image in PDF, falling back to algorithmic vector mandala:', e);
    }
  }

  // Draw high-resolution mandala to offscreen canvas
  const canvas = document.createElement('canvas');
  const resolution = 1800; // 300 DPI high-definition canvas
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d')!;

  drawMandalaToCanvas(ctx, resolution, resolution, mandala);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const targetSize = Math.min(availWidth, availHeight * 0.88);
  const startX = x + (availWidth - targetSize) / 2;
  const startY = y + (availHeight - targetSize) / 2;

  doc.addImage(dataUrl, 'JPEG', startX, startY, targetSize, targetSize);
}

// -------------------------------------------------------------
// Solutions Appendix: 4-up Grid Layout
// -------------------------------------------------------------

async function renderSolutionsAppendix(
  doc: jsPDF,
  pages: PuzzlePage[],
  config: KdpMarginConfig,
  themeName: string,
  pageWidth: number,
  pageHeight: number,
  onProgress?: (progress: ExportProgress) => void
) {
  const bleedOffset = config.bleed ? config.bleedInches * 72 : 0;
  const safeMargin = config.safeMarginInches * 72;
  const marginX = safeMargin + bleedOffset;
  const marginY = safeMargin + bleedOffset + 25;
  const workWidth = pageWidth - marginX * 2;
  const workHeight = pageHeight - marginY * 2 - 20;

  // Filter puzzle types
  const sudokus = pages.filter((p) => p.type === 'sudoku');
  const wordsearches = pages.filter((p) => p.type === 'wordsearch');
  const mazes = pages.filter((p) => p.type === 'maze');

  // Appendix Divider Page
  doc.addPage([pageWidth, pageHeight], 'portrait');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(20, 20, 20);
  doc.text('SOLUTIONS APPENDIX', pageWidth / 2, pageHeight / 2 - 40, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text('Complete Answer Keys for All Puzzles', pageWidth / 2, pageHeight / 2, { align: 'center' });
  doc.setFontSize(11);
  doc.text(themeName, pageWidth / 2, pageHeight / 2 + 25, { align: 'center' });

  // 1. Sudoku Solutions (4 per page)
  for (let s = 0; s < sudokus.length; s += 4) {
    doc.addPage([pageWidth, pageHeight], 'portrait');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text(`SUDOKU SOLUTIONS (#${s + 1} - #${Math.min(s + 4, sudokus.length)})`, pageWidth / 2, marginY - 10, {
      align: 'center',
    });

    const chunk = sudokus.slice(s, s + 4);
    chunk.forEach((item, idx) => {
      if (item.type !== 'sudoku') return;
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const subW = workWidth / 2 - 20;
      const subH = workHeight / 2 - 20;
      const px = marginX + col * (workWidth / 2 + 10);
      const py = marginY + row * (workHeight / 2 + 10);

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Sudoku #${item.data.puzzleNumber} (${item.data.difficulty})`, px + subW / 2, py + 12, {
        align: 'center',
      });

      // Mini solved grid
      const miniGridSize = Math.min(subW, subH - 25);
      const miniCell = miniGridSize / 9;
      const gx = px + (subW - miniGridSize) / 2;
      const gy = py + 20;

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1.2);
      doc.rect(gx, gy, miniGridSize, miniGridSize);

      for (let i = 1; i < 9; i++) {
        doc.setLineWidth(i % 3 === 0 ? 1.0 : 0.4);
        doc.line(gx + i * miniCell, gy, gx + i * miniCell, gy + miniGridSize);
        doc.line(gx, gy + i * miniCell, gx + miniGridSize, gy + i * miniCell);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(miniCell * 0.6);
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const val = item.data.solution[r][c];
          doc.text(String(val), gx + c * miniCell + miniCell / 2, gy + r * miniCell + miniCell * 0.72, {
            align: 'center',
          });
        }
      }
    });
  }

  // 2. Maze Solutions (4 per page with red solution path)
  for (let m = 0; m < mazes.length; m += 4) {
    doc.addPage([pageWidth, pageHeight], 'portrait');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text(`MAZE SOLUTIONS (#${m + 1} - #${Math.min(m + 4, mazes.length)})`, pageWidth / 2, marginY - 10, {
      align: 'center',
    });

    const chunk = mazes.slice(m, m + 4);
    chunk.forEach((item, idx) => {
      if (item.type !== 'maze') return;
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const subW = workWidth / 2 - 20;
      const subH = workHeight / 2 - 20;
      const px = marginX + col * (workWidth / 2 + 10);
      const py = marginY + row * (workHeight / 2 + 10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Maze #${item.data.puzzleNumber}`, px + subW / 2, py + 12, { align: 'center' });

      const miniSize = Math.min(subW, subH - 25);
      const gx = px + (subW - miniSize) / 2;
      const gy = py + 20;
      const cellW = miniSize / item.data.width;
      const cellH = miniSize / item.data.height;

      // Draw walls in black
      doc.setFillColor(30, 30, 30);
      for (let r = 0; r < item.data.height; r++) {
        for (let c = 0; c < item.data.width; c++) {
          if (item.data.grid[r][c] === 1) {
            doc.rect(gx + c * cellW, gy + r * cellH, cellW + 0.05, cellH + 0.05, 'F');
          }
        }
      }

      // Draw solution line in red
      if (item.data.solutionPath.length > 1) {
        doc.setDrawColor(220, 20, 20);
        doc.setLineWidth(Math.max(1.2, cellW * 0.45));
        for (let p = 0; p < item.data.solutionPath.length - 1; p++) {
          const [r1, c1] = item.data.solutionPath[p];
          const [r2, c2] = item.data.solutionPath[p + 1];
          doc.line(
            gx + c1 * cellW + cellW / 2,
            gy + r1 * cellH + cellH / 2,
            gx + c2 * cellW + cellW / 2,
            gy + r2 * cellH + cellH / 2
          );
        }
      }
    });
  }

  // 3. Word Search Solutions (4 per page with word placement coordinate keys)
  for (let w = 0; w < wordsearches.length; w += 4) {
    doc.addPage([pageWidth, pageHeight], 'portrait');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text(
      `WORD SEARCH SOLUTIONS (#${w + 1} - #${Math.min(w + 4, wordsearches.length)})`,
      pageWidth / 2,
      marginY - 10,
      { align: 'center' }
    );

    const chunk = wordsearches.slice(w, w + 4);
    chunk.forEach((item, idx) => {
      if (item.type !== 'wordsearch') return;
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const subW = workWidth / 2 - 20;
      const subH = workHeight / 2 - 20;
      const px = marginX + col * (workWidth / 2 + 10);
      const py = marginY + row * (workHeight / 2 + 10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`WS #${item.data.puzzleNumber}: ${item.data.subtheme}`, px + subW / 2, py + 12, {
        align: 'center',
      });

      const miniGridSize = Math.min(subW, subH - 50);
      const gx = px + (subW - miniGridSize) / 2;
      const gy = py + 20;
      const cell = miniGridSize / item.data.gridSize;

      // Draw light letter grid
      doc.setFont('courier', 'normal');
      doc.setFontSize(cell * 0.55);
      doc.setTextColor(120, 120, 120);

      for (let r = 0; r < item.data.gridSize; r++) {
        for (let c = 0; c < item.data.gridSize; c++) {
          doc.text(item.data.grid[r][c], gx + c * cell + cell / 2, gy + r * cell + cell * 0.72, {
            align: 'center',
          });
        }
      }

      // Draw bold highlight circles around solution word placements
      doc.setDrawColor(20, 120, 220);
      doc.setLineWidth(1.0);
      for (const place of item.data.placements) {
        if (place.cells.length > 0) {
          const first = place.cells[0];
          const last = place.cells[place.cells.length - 1];
          doc.line(
            gx + first[1] * cell + cell / 2,
            gy + first[0] * cell + cell / 2,
            gx + last[1] * cell + cell / 2,
            gy + last[0] * cell + cell / 2
          );
        }
      }

      // Short words list
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(50, 50, 50);
      const wordsLine = item.data.words.slice(0, 6).join(' • ');
      doc.text(wordsLine, px + subW / 2, gy + miniGridSize + 12, { align: 'center' });
    });
  }
}

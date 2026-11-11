import { jsPDF } from 'jspdf';
import {
  PuzzlePage,
  KdpMarginConfig,
  SudokuPuzzle,
  WordSearchPuzzle,
  MazePuzzle,
  MandalaPuzzle,
  FrontPageData,
  TocData,
  ForewordData,
  SectionDividerData,
} from '../types';
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
  sectionTitle = 'Activity Book',
  includeSolutions = true,
  onProgress?: (progress: ExportProgress) => void,
  isInteractiveDigital = false
): Promise<Blob> {
  const baseWidthInches = 8.5;
  const baseHeightInches = 11.0;
  const bleedInches = config.bleed ? config.bleedInches : 0;

  const pageWidth = (baseWidthInches + (config.bleed ? bleedInches : 0)) * 72;
  const pageHeight = (baseHeightInches + (config.bleed ? bleedInches * 2 : 0)) * 72;

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
    const topMargin = safeMargin + 28 + (config.bleed ? bleedOffset : 0);
    const bottomMargin = safeMargin + 28 + (config.bleed ? bleedOffset : 0);

    const contentWidth = pageWidth - leftMargin - rightMargin;
    const contentHeight = pageHeight - topMargin - bottomMargin;

    if (onProgress) {
      onProgress({
        currentPage: pageIndex,
        totalPages: totalPages + (includeSolutions ? Math.ceil(totalPages / 4) : 0),
        status: `Generating page ${pageIndex} of ${totalPages}...`,
      });
    }

    // Elegant Editorial Header
    const titleX = leftMargin + contentWidth / 2;

    if (page.type === 'cover') {
      renderCoverPageToPdf(
        doc,
        page.data as FrontPageData,
        leftMargin,
        topMargin,
        contentWidth,
        contentHeight,
        titleX
      );
    } else if (page.type === 'toc') {
      renderTocPageToPdf(
        doc,
        page.data as TocData,
        leftMargin,
        topMargin,
        contentWidth,
        contentHeight,
        titleX,
        isInteractiveDigital
      );
    } else if (page.type === 'foreword') {
      renderForewordPageToPdf(
        doc,
        page.data as ForewordData,
        leftMargin,
        topMargin,
        contentWidth,
        contentHeight,
        titleX
      );
    } else if (page.type === 'section-divider') {
      renderSectionDividerPageToPdf(
        doc,
        page.data as SectionDividerData,
        leftMargin,
        topMargin,
        contentWidth,
        contentHeight,
        titleX,
        themeName
      );
    } else {
      // Running Header Bar: Theme & Section on Left, Difficulty Tier on Right
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      const headerLeft = `${themeName.toUpperCase()} • ${page.sectionTitle.toUpperCase()}`;
      doc.text(headerLeft, leftMargin, topMargin - 18);

      if (page.difficulty && page.difficultyTier) {
        const diffBadge = `DIFF: ${page.difficulty.toUpperCase()} (${page.difficultyTier}/3)`;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(page.difficulty === 'Easy' ? 40 : page.difficulty === 'Medium' ? 140 : 180, 50, 50);
        doc.text(diffBadge, leftMargin + contentWidth, topMargin - 18, { align: 'right' });
      }

      // Interactive link to jump to solutions appendix on digital mode
      if (isInteractiveDigital && includeSolutions) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(79, 70, 229);
        const linkText = 'Tap to View Solution Key »';
        doc.text(linkText, leftMargin + contentWidth, topMargin - 6, { align: 'right' });
        doc.link(leftMargin + contentWidth - 120, topMargin - 16, 120, 14, {
          pageNumber: totalPages + 1,
        });
      }

      // Page Title
      doc.setFont('times', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(25, 25, 25);
      const displayTitle =
        (page.data as any).title || `${page.type.toUpperCase()} #${(page.data as any).puzzleNumber}`;
      doc.text(displayTitle, titleX, topMargin - 4, { align: 'center' });

      // Mindful Prompt Subtitle
      if ((page.data as any).mindfulPrompt) {
        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`"${(page.data as any).mindfulPrompt}"`, titleX, topMargin + 9, { align: 'center' });
      }

      // Render puzzle geometry
      if (page.type === 'sudoku') {
        const sData = page.data as any;
        renderSudokuToPdf(doc, sData.grid, leftMargin, topMargin + 12, contentWidth, contentHeight - 12);
      } else if (page.type === 'wordsearch') {
        const wsData = page.data as any;
        renderWordSearchToPdf(
          doc,
          wsData.grid,
          wsData.words,
          leftMargin,
          topMargin + 12,
          contentWidth,
          contentHeight - 12
        );
      } else if (page.type === 'maze') {
        const mData = page.data as any;
        renderMazeToPdf(
          doc,
          mData.grid,
          mData.start,
          mData.finish,
          leftMargin,
          topMargin + 12,
          contentWidth,
          contentHeight - 12
        );
      } else if (page.type === 'coloring') {
        await renderColoringToPdf(
          doc,
          page.data,
          leftMargin,
          topMargin + 12,
          contentWidth,
          contentHeight - 12
        );
      }
    }

    // Clean page number footer (omit for cover)
    if (page.type !== 'cover') {
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `- ${page.pageNumber} -`,
        titleX,
        pageHeight - (config.bleed ? bleedOffset : 0) - (safeMargin / 2),
        { align: 'center' }
      );
    }

    if (i % 4 === 0) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  // Render Solutions Appendix if enabled
  if (includeSolutions) {
    await renderSolutionsAppendix(
      doc,
      pages,
      config,
      themeName,
      sectionTitle,
      pageWidth,
      pageHeight,
      onProgress
    );
  }

  return doc.output('blob');
}

function renderSudokuToPdf(
  doc: jsPDF,
  grid: number[][],
  x: number,
  y: number,
  availWidth: number,
  availHeight: number
) {
  const size = grid.length;
  const boxR = size === 4 ? 2 : size === 6 ? 2 : 3;
  const boxC = size === 4 ? 2 : size === 6 ? 3 : 3;

  const boardSize = Math.min(availWidth, availHeight * 0.82);
  const startX = x + (availWidth - boardSize) / 2;
  const startY = y + (availHeight - boardSize) / 2 - 15;
  const cellSize = boardSize / size;

  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(2.2);
  doc.rect(startX, startY, boardSize, boardSize);

  for (let i = 1; i < size; i++) {
    const isMajor = i % (boxC) === 0;
    doc.setLineWidth(isMajor ? 1.8 : 0.6);
    doc.line(startX + i * cellSize, startY, startX + i * cellSize, startY + boardSize);
  }

  for (let i = 1; i < size; i++) {
    const isMajor = i % (boxR) === 0;
    doc.setLineWidth(isMajor ? 1.8 : 0.6);
    doc.line(startX, startY + i * cellSize, startX + boardSize, startY + i * cellSize);
  }

  doc.setFont('times', 'bold');
  doc.setFontSize(size <= 6 ? cellSize * 0.5 : cellSize * 0.55);
  doc.setTextColor(20, 20, 20);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = grid[r][c];
      if (val !== 0) {
        const textX = startX + c * cellSize + cellSize / 2;
        const textY = startY + r * cellSize + cellSize * 0.7;
        doc.text(String(val), textX, textY, { align: 'center' });
      }
    }
  }

  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(130, 130, 130);
  doc.text(
    'Fill the 9x9 grid so every row, column, and 3x3 box contains digits 1-9.',
    x + availWidth / 2,
    startY + boardSize + 28,
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
  const gridPixelSize = Math.min(availWidth * 0.88, availHeight * 0.56);
  const startX = x + (availWidth - gridPixelSize) / 2;
  const startY = y + 8;
  const cellSize = gridPixelSize / gridSize;

  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(1.4);
  doc.rect(startX, startY, gridPixelSize, gridPixelSize);

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.4);
  for (let i = 1; i < gridSize; i++) {
    doc.line(startX + i * cellSize, startY, startX + i * cellSize, startY + gridPixelSize);
    doc.line(startX, startY + i * cellSize, startX + gridPixelSize, startY + i * cellSize);
  }

  doc.setFont('courier', 'bold');
  doc.setFontSize(cellSize * 0.54);
  doc.setTextColor(20, 20, 20);

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const char = grid[r][c];
      const charX = startX + c * cellSize + cellSize / 2;
      const charY = startY + r * cellSize + cellSize * 0.72;
      doc.text(char, charX, charY, { align: 'center' });
    }
  }

  const wordBoxY = startY + gridPixelSize + 20;
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 30, 30);
  doc.text('WORDS TO DISCOVER', x + availWidth / 2, wordBoxY, { align: 'center' });

  const cols = words.length > 9 ? 3 : 2;
  const colWidth = availWidth / cols;
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);

  words.forEach((word, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const wordX = x + col * colWidth + colWidth / 2;
    const wordY = wordBoxY + 16 + row * 15;
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
  const mazeSize = Math.min(availWidth * 0.88, availHeight * 0.8);
  const startX = x + (availWidth - mazeSize) / 2;
  const startY = y + (availHeight - mazeSize) / 2 - 10;
  const cellW = mazeSize / cols;
  const cellH = mazeSize / rows;

  doc.setFillColor(25, 25, 25);
  doc.setDrawColor(25, 25, 25);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        doc.rect(startX + c * cellW, startY + r * cellH, cellW + 0.1, cellH + 0.1, 'F');
      }
    }
  }

  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 130, 60);
  doc.text('START ->', startX + start[1] * cellW - 6, startY + start[0] * cellH + cellH / 2 + 3, {
    align: 'right',
  });

  doc.setTextColor(190, 30, 30);
  doc.text('-> FINISH', startX + finish[1] * cellW + cellW + 6, startY + finish[0] * cellH + cellH / 2 + 3, {
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
  if (mandala.aiImageUrl) {
    const imgSize = Math.min(availWidth, availHeight * 0.86);
    const startX = x + (availWidth - imgSize) / 2;
    const startY = y + (availHeight - imgSize) / 2;
    try {
      doc.addImage(mandala.aiImageUrl, 'PNG', startX, startY, imgSize, imgSize);
      return;
    } catch (e) {
      console.warn('AI image embedding fallback:', e);
    }
  }

  const canvas = document.createElement('canvas');
  const resolution = 1600;
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d')!;

  drawMandalaToCanvas(ctx, resolution, resolution, mandala);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const targetSize = Math.min(availWidth, availHeight * 0.86);
  const startX = x + (availWidth - targetSize) / 2;
  const startY = y + (availHeight - targetSize) / 2;

  doc.addImage(dataUrl, 'JPEG', startX, startY, targetSize, targetSize);
}

async function renderSolutionsAppendix(
  doc: jsPDF,
  pages: PuzzlePage[],
  config: KdpMarginConfig,
  themeName: string,
  sectionTitle: string,
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

  const sudokus = pages.filter((p) => p.type === 'sudoku');
  const wordsearches = pages.filter((p) => p.type === 'wordsearch');
  const mazes = pages.filter((p) => p.type === 'maze');

  if (sudokus.length === 0 && wordsearches.length === 0 && mazes.length === 0) {
    return;
  }

  // Solutions Divider
  doc.addPage([pageWidth, pageHeight], 'portrait');
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(30, 30, 30);
  doc.text('SOLUTIONS', pageWidth / 2, pageHeight / 2 - 30, { align: 'center' });
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.setTextColor(110, 110, 110);
  doc.text(`Answer Keys for ${sectionTitle}`, pageWidth / 2, pageHeight / 2 + 5, { align: 'center' });

  // Sudoku Solutions 4-up
  for (let s = 0; s < sudokus.length; s += 4) {
    doc.addPage([pageWidth, pageHeight], 'portrait');
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text(`Sudoku Answers (${s + 1} - ${Math.min(s + 4, sudokus.length)})`, pageWidth / 2, marginY - 10, {
      align: 'center',
    });

    const chunk = sudokus.slice(s, s + 4);
    chunk.forEach((item, idx) => {
      if (item.type !== 'sudoku') return;
      const sudoku = item.data as SudokuPuzzle;
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const subW = workWidth / 2 - 20;
      const subH = workHeight / 2 - 20;
      const px = marginX + col * (workWidth / 2 + 10);
      const py = marginY + row * (workHeight / 2 + 10);

      doc.setFont('times', 'bold');
      doc.setFontSize(9.5);
      doc.text(`Sudoku #${sudoku.puzzleNumber}`, px + subW / 2, py + 10, { align: 'center' });

      const miniGridSize = Math.min(subW, subH - 22);
      const miniCell = miniGridSize / 9;
      const gx = px + (subW - miniGridSize) / 2;
      const gy = py + 18;

      doc.setDrawColor(20, 20, 20);
      doc.setLineWidth(1.0);
      doc.rect(gx, gy, miniGridSize, miniGridSize);

      for (let i = 1; i < 9; i++) {
        doc.setLineWidth(i % 3 === 0 ? 0.9 : 0.3);
        doc.line(gx + i * miniCell, gy, gx + i * miniCell, gy + miniGridSize);
        doc.line(gx, gy + i * miniCell, gx + miniGridSize, gy + i * miniCell);
      }

      doc.setFont('times', 'bold');
      doc.setFontSize(miniCell * 0.58);
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const val = sudoku.solution[r][c];
          doc.text(String(val), gx + c * miniCell + miniCell / 2, gy + r * miniCell + miniCell * 0.72, {
            align: 'center',
          });
        }
      }
    });
  }

  // Maze Solutions 4-up with red line
  for (let m = 0; m < mazes.length; m += 4) {
    doc.addPage([pageWidth, pageHeight], 'portrait');
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text(`Maze Solutions (${m + 1} - ${Math.min(m + 4, mazes.length)})`, pageWidth / 2, marginY - 10, {
      align: 'center',
    });

    const chunk = mazes.slice(m, m + 4);
    chunk.forEach((item, idx) => {
      if (item.type !== 'maze') return;
      const maze = item.data as MazePuzzle;
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const subW = workWidth / 2 - 20;
      const subH = workHeight / 2 - 20;
      const px = marginX + col * (workWidth / 2 + 10);
      const py = marginY + row * (workHeight / 2 + 10);

      doc.setFont('times', 'bold');
      doc.setFontSize(9.5);
      doc.text(`Maze #${maze.puzzleNumber}`, px + subW / 2, py + 10, { align: 'center' });

      const miniSize = Math.min(subW, subH - 22);
      const gx = px + (subW - miniSize) / 2;
      const gy = py + 18;
      const cellW = miniSize / maze.width;
      const cellH = miniSize / maze.height;

      doc.setFillColor(30, 30, 30);
      for (let r = 0; r < maze.height; r++) {
        for (let c = 0; c < maze.width; c++) {
          if (maze.grid[r][c] === 1) {
            doc.rect(gx + c * cellW, gy + r * cellH, cellW + 0.05, cellH + 0.05, 'F');
          }
        }
      }

      if (maze.solutionPath.length > 1) {
        doc.setDrawColor(210, 30, 30);
        doc.setLineWidth(Math.max(1.1, cellW * 0.42));
        for (let p = 0; p < maze.solutionPath.length - 1; p++) {
          const [r1, c1] = maze.solutionPath[p];
          const [r2, c2] = maze.solutionPath[p + 1];
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

  // Word Search Solutions
  for (let w = 0; w < wordsearches.length; w += 4) {
    doc.addPage([pageWidth, pageHeight], 'portrait');
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text(
      `Word Search Keys (${w + 1} - ${Math.min(w + 4, wordsearches.length)})`,
      pageWidth / 2,
      marginY - 10,
      { align: 'center' }
    );

    const chunk = wordsearches.slice(w, w + 4);
    chunk.forEach((item, idx) => {
      if (item.type !== 'wordsearch') return;
      const ws = item.data as WordSearchPuzzle;
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const subW = workWidth / 2 - 20;
      const subH = workHeight / 2 - 20;
      const px = marginX + col * (workWidth / 2 + 10);
      const py = marginY + row * (workHeight / 2 + 10);

      doc.setFont('times', 'bold');
      doc.setFontSize(9);
      doc.text(`Search #${ws.puzzleNumber}: ${ws.subtheme}`, px + subW / 2, py + 10, {
        align: 'center',
      });

      const miniGridSize = Math.min(subW, subH - 35);
      const gx = px + (subW - miniGridSize) / 2;
      const gy = py + 16;
      const cell = miniGridSize / ws.gridSize;

      doc.setFont('courier', 'normal');
      doc.setFontSize(cell * 0.54);
      doc.setTextColor(110, 110, 110);

      for (let r = 0; r < ws.gridSize; r++) {
        for (let c = 0; c < ws.gridSize; c++) {
          doc.text(ws.grid[r][c], gx + c * cell + cell / 2, gy + r * cell + cell * 0.72, {
            align: 'center',
          });
        }
      }

      doc.setDrawColor(30, 100, 200);
      doc.setLineWidth(0.9);
      for (const place of ws.placements) {
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
    });
  }
}

function renderCoverPageToPdf(
  doc: jsPDF,
  data: FrontPageData,
  leftMargin: number,
  topMargin: number,
  contentWidth: number,
  contentHeight: number,
  titleX: number
) {
  // Classical double border
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(2.5);
  doc.rect(leftMargin, topMargin - 10, contentWidth, contentHeight + 15);

  doc.setLineWidth(0.8);
  doc.rect(leftMargin + 6, topMargin - 4, contentWidth - 12, contentHeight + 3);

  // Top label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(110, 110, 110);
  doc.text('OFFICIAL ACTIVITY & MINDFULNESS GUIDE', titleX, topMargin + 30, { align: 'center' });

  // Divider line
  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(1.2);
  doc.line(titleX - 40, topMargin + 40, titleX + 40, topMargin + 40);

  // Big Title
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(20, 20, 20);
  const titleLines = doc.splitTextToSize((data.title || 'THE ACTIVITY BOOK').toUpperCase(), contentWidth - 40);
  doc.text(titleLines, titleX, topMargin + 90, { align: 'center' });

  // Subtitle
  doc.setFont('times', 'italic');
  doc.setFontSize(11.5);
  doc.setTextColor(80, 80, 80);
  const subLines = doc.splitTextToSize(data.subtitle || 'Puzzles & Coloring for Calm and Focus', contentWidth - 60);
  doc.text(subLines, titleX, topMargin + 145, { align: 'center' });

  // Center filigree divider
  doc.setDrawColor(70, 70, 70);
  doc.setLineWidth(0.8);
  doc.line(titleX - 60, topMargin + 200, titleX + 60, topMargin + 200);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text('100 NON-REPEATING CHALLENGES', titleX, topMargin + 215, { align: 'center' });
  doc.line(titleX - 60, topMargin + 225, titleX + 60, topMargin + 225);

  // 4 Features Box
  const boxW = contentWidth - 60;
  const boxX = leftMargin + 30;
  const boxY = topMargin + 250;
  doc.setFillColor(248, 248, 250);
  doc.setDrawColor(210, 210, 215);
  doc.roundedRect(boxX, boxY, boxW, 70, 3, 3, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 40);
  doc.text('• Sudoku Logic Puzzles (Easy to Hard 1/3)', boxX + 15, boxY + 22);
  doc.text('• Themed Word Searches (Curated Vocab)', boxX + 15, boxY + 38);
  doc.text('• Labyrinth Mazes (3 Complexity Tiers)', boxX + boxW / 2 + 10, boxY + 22);
  doc.text('• Mindful Coloring Art (Vector Motifs)', boxX + boxW / 2 + 10, boxY + 38);

  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Calibrated for Deep Focus, Stress Relief & Anxiety Decompression', titleX, boxY + 58, { align: 'center' });

  // Bottom Publisher Note
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  doc.text("OFFICIAL DELUXE COLLECTOR'S EDITION", titleX, topMargin + contentHeight - 35, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(110, 110, 110);
  doc.text('Complete Verified Solutions Section Included at the Back', titleX, topMargin + contentHeight - 22, { align: 'center' });
}

function renderSectionDividerPageToPdf(
  doc: jsPDF,
  data: SectionDividerData,
  leftMargin: number,
  topMargin: number,
  contentWidth: number,
  contentHeight: number,
  titleX: number,
  themeName: string
) {
  // Classical double border
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(1.8);
  doc.rect(leftMargin + 10, topMargin, contentWidth - 20, contentHeight);

  doc.setLineWidth(0.6);
  doc.rect(leftMargin + 14, topMargin + 4, contentWidth - 28, contentHeight - 8);

  // Part Number
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 110);
  doc.text(data.partNumber, titleX, topMargin + 45, { align: 'center' });

  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(1.2);
  doc.line(titleX - 30, topMargin + 53, titleX + 30, topMargin + 53);

  // Section Title
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(20, 20, 20);
  doc.text(data.title.toUpperCase(), titleX, topMargin + 95, { align: 'center' });

  // Subtitle
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(data.subtitle, titleX, topMargin + 118, { align: 'center' });

  // Famous Quote Box
  const quoteBoxW = contentWidth - 60;
  const quoteBoxX = leftMargin + 30;
  const quoteBoxY = topMargin + 150;

  doc.setFillColor(248, 248, 250);
  doc.setDrawColor(215, 215, 220);
  doc.roundedRect(quoteBoxX, quoteBoxY, quoteBoxW, 90, 3, 3, 'FD');

  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  const quoteLines = doc.splitTextToSize(`“${data.quote.text}”`, quoteBoxW - 30);
  doc.text(quoteLines, quoteBoxX + 15, quoteBoxY + 30);

  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 20, 20);
  const authorText = `— ${data.quote.author}`;
  doc.text(authorText, quoteBoxX + quoteBoxW - 15, quoteBoxY + 66, { align: 'right' });

  if (data.quote.sourceOrRole) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(data.quote.sourceOrRole, quoteBoxX + quoteBoxW - 15, quoteBoxY + 78, { align: 'right' });
  }

  // Curated Description
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  const descLines = doc.splitTextToSize(data.curatedDescription, contentWidth - 80);
  doc.text(descLines, titleX, topMargin + 275, { align: 'center' });

  // Stats badge
  doc.setFillColor(242, 242, 245);
  doc.setDrawColor(200, 200, 205);
  const badgeW = 220;
  doc.roundedRect(titleX - badgeW / 2, topMargin + 355, badgeW, 24, 12, 12, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  doc.text(`${data.totalSectionPages} Pages • ${data.difficultySummary}`, titleX, topMargin + 370, { align: 'center' });

  // Bottom Collection Tag
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(`${themeName.toUpperCase()} COLLECTION`, titleX, topMargin + contentHeight - 25, { align: 'center' });
}

function renderTocPageToPdf(
  doc: jsPDF,
  data: TocData,
  leftMargin: number,
  topMargin: number,
  contentWidth: number,
  contentHeight: number,
  titleX: number,
  isInteractiveDigital = false
) {
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(20, 20, 20);
  doc.text('TABLE OF CONTENTS', titleX, topMargin + 10, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Your structured journey through quiet focus, flow, and anxiety relief', titleX, topMargin + 28, { align: 'center' });

  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.8);
  doc.line(leftMargin + 30, topMargin + 38, leftMargin + contentWidth - 30, topMargin + 38);

  let curY = topMargin + 70;
  (data.entries || []).forEach((entry) => {
    doc.setFont('times', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(30, 30, 30);
    doc.text(entry.title, leftMargin + 20, curY);

    const pageNumText = `Page ${entry.startPage}`;
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text(pageNumText, leftMargin + contentWidth - 20, curY, { align: 'right' });

    // Dotted leader line
    doc.setFont('courier', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(160, 160, 160);
    const titleWidth = doc.getTextWidth(entry.title) + 8;
    const pageNumWidth = doc.getTextWidth(pageNumText) + 8;
    const dotStartX = leftMargin + 20 + titleWidth;
    const dotEndX = leftMargin + contentWidth - 20 - pageNumWidth;

    if (dotEndX > dotStartX) {
      let dots = '';
      while (doc.getTextWidth(dots + ' .') < dotEndX - dotStartX) {
        dots += ' .';
      }
      doc.text(dots, dotStartX, curY);
    }

    // Subtitle
    if (entry.subtitle) {
      doc.setFont('times', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      doc.text(entry.subtitle, leftMargin + 20, curY + 12);
    }

    // Interactive digital link for tablets & offline reading
    if (isInteractiveDigital && entry.startPage) {
      doc.link(leftMargin + 15, curY - 10, contentWidth - 30, 20, {
        pageNumber: entry.startPage,
      });
    }

    curY += 34;
  });

  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 120);
  doc.text(
    isInteractiveDigital
      ? 'Interactive Digital Edition • Tap any table of contents row to jump directly to that section.'
      : 'All puzzle sections are preceded by curated divider pages with famous inspiring quotes.',
    titleX,
    topMargin + contentHeight - 15,
    { align: 'center' }
  );
}

function renderForewordPageToPdf(
  doc: jsPDF,
  data: ForewordData,
  leftMargin: number,
  topMargin: number,
  contentWidth: number,
  contentHeight: number,
  titleX: number
) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text('FOREWORD • THE PURPOSE OF THIS ACTIVITY GUIDE', titleX, topMargin - 10, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text(data.title || 'The Architecture of Calm', titleX, topMargin + 10, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(data.subtitle || 'Why Tactile Puzzles Soothe the Overstimulated Mind', titleX, topMargin + 24, { align: 'center' });

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.6);
  doc.line(leftMargin + 30, topMargin + 32, leftMargin + contentWidth - 30, topMargin + 32);

  // Paragraphs
  let curY = topMargin + 48;
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 40);

  const p1Lines = doc.splitTextToSize(data.paragraphs[0] || '', contentWidth - 20);
  doc.text(p1Lines, leftMargin + 10, curY);
  curY += p1Lines.length * 12 + 8;

  const p2Lines = doc.splitTextToSize(data.paragraphs[1] || '', contentWidth - 20);
  doc.text(p2Lines, leftMargin + 10, curY);
  curY += p2Lines.length * 12 + 10;

  // 4 Key Benefits box
  const boxW = contentWidth - 20;
  const boxX = leftMargin + 10;
  doc.setFillColor(248, 248, 250);
  doc.setDrawColor(220, 220, 225);
  doc.roundedRect(boxX, curY, boxW, 110, 3, 3, 'FD');

  let benefitY = curY + 16;
  (data.keyBenefits || []).forEach((b) => {
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(`✦ ${b.title}: `, boxX + 10, benefitY);

    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    const prefixW = doc.getTextWidth(`✦ ${b.title}: `);
    const descLines = doc.splitTextToSize(b.desc, boxW - 20 - prefixW);
    doc.text(descLines, boxX + 10 + prefixW, benefitY);
    benefitY += Math.max(descLines.length * 10, 16) + 4;
  });

  curY += 122;

  const p3Lines = doc.splitTextToSize(data.paragraphs[3] || '', contentWidth - 20);
  doc.text(p3Lines, leftMargin + 10, curY);

  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text('"Breathe deeply, take your time, and enjoy the quiet art of being present."', titleX, topMargin + contentHeight - 15, { align: 'center' });
}

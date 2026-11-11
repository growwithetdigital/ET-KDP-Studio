import React, { useEffect, useRef, useState } from 'react';
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
import { Eye, EyeOff, RefreshCw, ZoomIn, ZoomOut, Edit3, Sparkles, BookOpen } from 'lucide-react';

interface PageRendererProps {
  page?: PuzzlePage | null;
  config: KdpMarginConfig;
  themeName: string;
  onOpenEditor?: () => void;
  onGenerateAiArt?: (pageIndex: number, prompt: string) => Promise<void>;
  isGeneratingArt?: boolean;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  page,
  config,
  themeName,
  onOpenEditor,
  onGenerateAiArt,
  isGeneratingArt = false,
}) => {
  const [showSolution, setShowSolution] = useState(false);
  const [zoom, setZoom] = useState(1);
  const mandalaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (page && page.type === 'coloring' && mandalaCanvasRef.current) {
      const mandalaData = page.data as MandalaPuzzle;
      if (!mandalaData.aiImageUrl) {
        const canvas = mandalaCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawMandalaToCanvas(ctx, 1400, 1400, mandalaData);
        }
      }
    }
  }, [page]);

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <RefreshCw className="animate-spin w-7 h-7 text-indigo-500 mb-2.5" />
        <span className="text-xs font-medium text-slate-600">Preparing activity page...</span>
      </div>
    );
  }

  const pageNumber = page.pageNumber;
  const isOdd = pageNumber % 2 !== 0;
  const isFrontMatter =
    page.type === 'cover' ||
    page.type === 'toc' ||
    page.type === 'foreword' ||
    page.type === 'section-divider';

  // Difficulty Tier dots (● ○ ○, ● ● ○, ● ● ●)
  const renderDifficultyMeter = (tier?: 1 | 2 | 3, level?: string) => {
    if (!tier || !level) return null;
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs">
        <span className="text-slate-400">DIFF:</span>
        <span
          className={`font-bold ${
            level === 'Easy'
              ? 'text-emerald-700'
              : level === 'Medium'
              ? 'text-amber-700'
              : 'text-rose-700'
          }`}
        >
          {level.toUpperCase()} ({tier}/3)
        </span>
        <span className="flex gap-0.5 ml-0.5">
          <span className={tier >= 1 ? 'text-indigo-600 font-bold' : 'text-slate-300'}>●</span>
          <span className={tier >= 2 ? 'text-indigo-600 font-bold' : 'text-slate-300'}>●</span>
          <span className={tier >= 3 ? 'text-indigo-600 font-bold' : 'text-slate-300'}>●</span>
        </span>
      </div>
    );
  };

  const sudokuData = page.type === 'sudoku' ? (page.data as SudokuPuzzle) : null;
  const wordSearchData = page.type === 'wordsearch' ? (page.data as WordSearchPuzzle) : null;
  const mazeData = page.type === 'maze' ? (page.data as MazePuzzle) : null;
  const coloringData = page.type === 'coloring' ? (page.data as MandalaPuzzle) : null;
  const coverData = page.type === 'cover' ? (page.data as FrontPageData) : null;
  const tocData = page.type === 'toc' ? (page.data as TocData) : null;
  const forewordData = page.type === 'foreword' ? (page.data as ForewordData) : null;
  const sectionDividerData = page.type === 'section-divider' ? (page.data as SectionDividerData) : null;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Studio Preview Controls Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-xs text-xs text-slate-700">
        <div className="flex items-center gap-2.5">
          <span className="font-serif font-bold text-slate-900 text-sm">
            Book Page {pageNumber}
          </span>
          <span className="text-slate-300">•</span>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
            {page.type === 'cover'
              ? 'Front Title Page'
              : page.type === 'toc'
              ? 'Table of Contents'
              : page.type === 'foreword'
              ? 'Foreword'
              : page.type === 'section-divider'
              ? 'Section Overview'
              : page.type}
          </span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            ({isOdd ? 'Right Page / Spine Left' : 'Left Page / Spine Right'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isFrontMatter && onOpenEditor && (
            <button
              onClick={onOpenEditor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs"
            >
              <Edit3 size={13} className="text-indigo-600" />
              <span>Customize</span>
            </button>
          )}

          {!isFrontMatter && page.type !== 'coloring' && (
            <button
              onClick={() => setShowSolution(!showSolution)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-2xs ${
                showSolution
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {showSolution ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showSolution ? 'Hide Solution' : 'Solution Key'}</span>
            </button>
          )}

          <div className="flex items-center bg-slate-100/80 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
              className="p-1 text-slate-600 hover:text-slate-900"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-[11px] text-slate-600 px-1 font-mono font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.3, z + 0.1))}
              className="p-1 text-slate-600 hover:text-slate-900"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 8.5" x 11" Paper Canvas Container with Elite High-End Framing */}
      <div
        className="relative transition-transform duration-150 shadow-xl rounded-sm bg-white text-slate-900 border border-slate-200/90 overflow-hidden select-none"
        style={{
          width: `${595 * zoom}px`,
          height: `${770 * zoom}px`, // 8.5 x 11 aspect ratio = 1 : 1.294
        }}
      >
        {/* KDP Bleed & Margin Guidelines Overlay (ONLY shown when user turns toggle on) */}
        {config.showGuides && (
          <div className="absolute inset-0 pointer-events-none z-30">
            <div className="absolute inset-2 border border-dashed border-rose-400/50">
              <span className="absolute top-1 left-2 text-[8px] font-mono font-bold text-rose-500 bg-white/90 px-1 rounded shadow-2xs">
                Trim Bleed
              </span>
            </div>

            <div
              className="absolute border border-dashed border-amber-400/50"
              style={{
                top: '5%',
                bottom: '5%',
                left: isOdd ? '8%' : '5%',
                right: isOdd ? '5%' : '8%',
              }}
            >
              <span className="absolute bottom-1 right-2 text-[8px] font-mono font-bold text-amber-500 bg-white/90 px-1 rounded shadow-2xs">
                Safe Margin
              </span>
            </div>

            <div
              className="absolute top-0 bottom-0 bg-emerald-500/5 border-emerald-500/20"
              style={{
                width: '8%',
                left: isOdd ? 0 : 'auto',
                right: isOdd ? 'auto' : 0,
                borderRightWidth: isOdd ? '1px' : '0',
                borderLeftWidth: isOdd ? '0' : '1px',
              }}
            />
          </div>
        )}

        {/* Paper Content Wrapper with Alternating Gutter Margin */}
        <div
          className="w-full h-full flex flex-col justify-between"
          style={{
            paddingTop: `${30 * zoom}px`,
            paddingBottom: `${24 * zoom}px`,
            paddingLeft: `${(isOdd ? 44 : 32) * zoom}px`,
            paddingRight: `${(isOdd ? 32 : 44) * zoom}px`,
          }}
        >
          {/* Cover Page */}
          {page.type === 'cover' && coverData && (
            <div className="w-full h-full flex flex-col justify-between items-center text-center p-6 border-4 border-double border-slate-900 rounded-sm">
              <div className="pt-4">
                <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-slate-500 font-semibold block mb-2">
                  Official Activity & Mindfulness Collection
                </span>
                <div className="w-16 h-0.5 bg-slate-900 mx-auto" />
              </div>

              <div className="space-y-4 my-auto max-w-md">
                <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-950 tracking-tight leading-tight uppercase">
                  {coverData.title}
                </h1>
                <p className="text-xs sm:text-sm font-serif italic text-slate-600 max-w-sm mx-auto leading-relaxed">
                  {coverData.subtitle}
                </p>

                <div className="py-4 flex items-center justify-center gap-3">
                  <div className="w-10 h-px bg-slate-300" />
                  <span className="text-xs font-serif font-bold text-slate-800 tracking-widest uppercase">
                    100 Non-Repeating Challenges
                  </span>
                  <div className="w-10 h-px bg-slate-300" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>• Sudoku Logic Puzzles</div>
                  <div>• Themed Word Searches</div>
                  <div>• Labyrinth Mazes</div>
                  <div>• Mindful Coloring Art</div>
                </div>
              </div>

              <div className="pb-2 text-slate-500 text-[10px] font-mono">
                <p className="font-semibold text-slate-800 uppercase tracking-wider mb-0.5">
                  Official Deluxe Collector's Edition
                </p>
                <p>Complete Verified Solutions Section Included at the Back</p>
              </div>
            </div>
          )}

          {/* Table of Contents */}
          {page.type === 'toc' && tocData && (
            <div className="w-full h-full flex flex-col justify-between p-4">
              <div className="text-center pb-3 border-b border-slate-200">
                <span className="text-[9px] uppercase font-mono tracking-[0.3em] text-slate-400 block mb-1">
                  Interior Guide
                </span>
                <h2 className="text-2xl font-serif font-bold text-slate-950 tracking-wide uppercase">
                  Table of Contents
                </h2>
                <p className="text-xs font-serif italic text-slate-500 mt-0.5">
                  {tocData.subtitle}
                </p>
              </div>

              <div className="my-auto space-y-4 px-2">
                {tocData.entries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-baseline justify-between gap-2 border-b border-dotted border-slate-300 pb-2.5"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-sm font-serif font-bold text-slate-900 block truncate">
                        {entry.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-serif italic block">
                        {entry.subtitle}
                      </span>
                    </div>
                    <span className="text-sm font-serif font-bold text-slate-900 shrink-0 font-mono">
                      Page {entry.startPage}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center pt-3 border-t border-slate-200 text-[10px] font-mono text-slate-400">
                All puzzles arranged in progressive 1/3 difficulty tiers (Easy, Medium, Hard)
              </div>
            </div>
          )}

          {/* Foreword */}
          {page.type === 'foreword' && forewordData && (
            <div className="w-full h-full flex flex-col justify-between p-2">
              <div className="text-center pb-2 border-b border-slate-200">
                <span className="text-[9px] uppercase font-mono tracking-[0.3em] text-slate-400 block mb-0.5">
                  Foreword
                </span>
                <h2 className="text-lg font-serif font-bold text-slate-950 tracking-tight">
                  {forewordData.title}
                </h2>
                <p className="text-[11px] font-serif italic text-slate-600">
                  {forewordData.subtitle}
                </p>
              </div>

              <div className="space-y-2 text-[11px] font-serif leading-relaxed text-slate-700 my-auto px-2">
                <p>{forewordData.paragraphs[0]}</p>
                <p>{forewordData.paragraphs[1]}</p>

                <div className="grid grid-cols-2 gap-2 my-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-sans">
                  {forewordData.keyBenefits.map((b, i) => (
                    <div key={i} className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-900 block flex items-center gap-1">
                        <span className="text-indigo-600">✦</span> {b.title}
                      </span>
                      <p className="text-[9.5px] text-slate-600 leading-snug">
                        {b.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <p>{forewordData.paragraphs[3]}</p>
              </div>

              <div className="text-center pt-2 border-t border-slate-200 text-[10px] font-serif italic text-slate-500">
                "Breathe deeply, take your time, and enjoy the quiet art of being present."
              </div>
            </div>
          )}

          {/* Section Divider Page with Famous Quote */}
          {page.type === 'section-divider' && sectionDividerData && (
            <div className="w-full h-full flex flex-col justify-between items-center text-center p-6 border-2 border-slate-900 rounded-sm bg-gradient-to-b from-white via-slate-50/40 to-white">
              <div className="pt-4">
                <span className="text-[10px] uppercase font-mono tracking-[0.35em] text-slate-500 font-bold block mb-1">
                  {sectionDividerData.partNumber}
                </span>
                <div className="w-12 h-0.5 bg-slate-900 mx-auto" />
              </div>

              <div className="my-auto space-y-6 max-w-md px-2">
                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-950 uppercase tracking-wide">
                    {sectionDividerData.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-serif italic text-slate-600">
                    {sectionDividerData.subtitle}
                  </p>
                </div>

                {/* Famous Quote Card */}
                <div className="relative py-5 px-6 bg-white border border-slate-200/90 rounded-xl shadow-xs text-left">
                  <span className="absolute -top-3 left-4 text-3xl font-serif text-indigo-400 font-bold leading-none">“</span>
                  <blockquote className="text-xs sm:text-sm font-serif italic text-slate-800 leading-relaxed pt-1">
                    {sectionDividerData.quote.text}
                  </blockquote>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-serif font-bold text-slate-900">
                      — {sectionDividerData.quote.author}
                    </span>
                    {sectionDividerData.quote.sourceOrRole && (
                      <span className="text-[10px] font-sans text-slate-400">
                        {sectionDividerData.quote.sourceOrRole}
                      </span>
                    )}
                  </div>
                </div>

                {/* Curated Description */}
                <p className="text-[11px] sm:text-xs font-serif leading-relaxed text-slate-600 text-center">
                  {sectionDividerData.curatedDescription}
                </p>

                {/* Section Stats Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-mono font-semibold text-slate-700">
                  <span>{sectionDividerData.totalSectionPages} Pages</span>
                  <span>•</span>
                  <span>{sectionDividerData.difficultySummary}</span>
                </div>
              </div>

              <div className="pb-2 text-[10px] font-mono text-slate-400 tracking-wider uppercase">
                {themeName} Collection
              </div>
            </div>
          )}

          {/* Puzzles Rendering (Sudoku, WordSearch, Maze, Coloring) */}
          {!isFrontMatter && (
            <>
              {/* Running Header */}
              <div className="text-center pb-1.5 border-b border-slate-100/80">
                <div className="flex items-center justify-between px-2 mb-1">
                  <span className="text-[8.5px] tracking-[0.25em] uppercase font-semibold text-slate-400">
                    {themeName} • {page.sectionTitle}
                  </span>
                  {renderDifficultyMeter(page.difficultyTier, page.difficulty)}
                </div>

                <h2 className="text-lg font-serif font-bold text-slate-900 tracking-tight">
                  {(page.data as any).title ||
                    (page.type === 'sudoku' && `Sudoku #${sudokuData?.puzzleNumber}`) ||
                    (page.type === 'wordsearch' && `Word Search: ${wordSearchData?.subtheme}`) ||
                    (page.type === 'maze' && `Maze Challenge #${mazeData?.puzzleNumber}`) ||
                    (page.type === 'coloring' && coloringData?.title)}
                </h2>

                {(sudokuData?.mindfulPrompt ||
                  wordSearchData?.mindfulPrompt ||
                  mazeData?.mindfulPrompt ||
                  coloringData?.mindfulPrompt) && (
                  <p className="text-[10px] font-serif italic text-slate-500 max-w-md mx-auto mt-0.5 line-clamp-1">
                    "{sudokuData?.mindfulPrompt ||
                      wordSearchData?.mindfulPrompt ||
                      mazeData?.mindfulPrompt ||
                      coloringData?.mindfulPrompt}"
                  </p>
                )}
              </div>

              {/* Main Puzzle Area */}
              <div className="flex-1 flex items-center justify-center py-1 overflow-hidden">
                {page.type === 'sudoku' && sudokuData && (
                  <div className="w-full max-w-[420px] flex flex-col items-center">
                    {(() => {
                      const size = sudokuData.grid.length;
                      const boxR = size === 4 ? 2 : size === 6 ? 2 : 3;
                      const boxC = size === 4 ? 2 : size === 6 ? 3 : 3;
                      const cellPx = size === 4 ? 54 : size === 6 ? 42 : 36;

                      return (
                        <div
                          className="grid border-2 border-slate-950 bg-white shadow-2xs"
                          style={{
                            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                          }}
                        >
                          {(showSolution ? sudokuData.solution : sudokuData.grid).map((row, r) =>
                            row.map((val, c) => {
                              const isBorderR = (r + 1) % boxR === 0 && r !== size - 1;
                              const isBorderC = (c + 1) % boxC === 0 && c !== size - 1;
                              const wasOriginal = sudokuData.grid[r][c] !== 0;

                              return (
                                <div
                                  key={`${r}-${c}`}
                                  style={{ width: `${cellPx}px`, height: `${cellPx}px` }}
                                  className={`flex items-center justify-center font-serif font-bold ${
                                    size <= 6 ? 'text-xl' : 'text-base'
                                  } ${
                                    wasOriginal ? 'text-slate-900' : 'text-indigo-600 font-semibold'
                                  } border border-slate-300 ${
                                    isBorderR ? 'border-b-2 border-b-slate-950' : ''
                                  } ${isBorderC ? 'border-r-2 border-r-slate-950' : ''}`}
                                >
                                  {val !== 0 ? val : ''}
                                </div>
                              );
                            })
                          )}
                        </div>
                      );
                    })()}

                    <p className="text-[10px] text-slate-400 font-serif italic text-center mt-4">
                      Fill the grid so every row, column, and box contains the numbers 1 to{' '}
                      {sudokuData.grid.length}.
                    </p>
                  </div>
                )}

                {page.type === 'wordsearch' && wordSearchData && (
                  <div className="w-full flex flex-col items-center">
                    <div
                      className="grid gap-0 border border-slate-300 bg-white p-2 shadow-2xs"
                      style={{
                        gridTemplateColumns: `repeat(${wordSearchData.gridSize}, minmax(0, 1fr))`,
                      }}
                    >
                      {wordSearchData.grid.map((row, r) =>
                        row.map((letter, c) => {
                          const isSolutionCell =
                            showSolution &&
                            wordSearchData.placements.some((p) =>
                              p.cells.some(([pr, pc]) => pr === r && pc === c)
                            );

                          return (
                            <div
                              key={`${r}-${c}`}
                              className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-mono text-xs sm:text-sm font-bold uppercase ${
                                isSolutionCell
                                  ? 'bg-indigo-600 text-white rounded-xs'
                                  : 'text-slate-800 hover:bg-slate-50'
                              }`}
                            >
                              {letter}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="w-full max-w-md mt-4 pt-3 border-t border-slate-200">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1.5 text-center">
                        Find These {wordSearchData.words.length} Themed Words
                      </span>
                      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs font-mono font-medium text-slate-700">
                        {wordSearchData.words.map((word, wIdx) => (
                          <span
                            key={wIdx}
                            className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/80"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {page.type === 'maze' && mazeData && (
                  <div className="w-full flex flex-col items-center">
                    <div className="relative p-2 bg-white border-2 border-slate-900 shadow-2xs">
                      <div className="absolute -top-4 left-1 text-[9px] font-serif font-bold text-emerald-700 flex items-center gap-1">
                        <span>▼ START</span>
                      </div>

                      <div
                        className="grid"
                        style={{
                          gridTemplateColumns: `repeat(${mazeData.width}, minmax(0, 1fr))`,
                        }}
                      >
                        {mazeData.grid.map((row, r) =>
                          row.map((cell, c) => {
                            const isSolution =
                              showSolution &&
                              mazeData.solutionPath.some(([sr, sc]) => sr === r && sc === c);

                            const isWall = cell === 1;
                            const cellPx = Math.max(10, Math.floor(340 / mazeData.width));

                            return (
                              <div
                                key={`${r}-${c}`}
                                style={{ width: `${cellPx}px`, height: `${cellPx}px` }}
                                className={`${
                                  isWall
                                    ? 'bg-slate-900'
                                    : isSolution
                                    ? 'bg-rose-500'
                                    : 'bg-white'
                                }`}
                              />
                            );
                          })
                        )}
                      </div>

                      <div className="absolute -bottom-4 right-1 text-[9px] font-serif font-bold text-rose-700 flex items-center gap-1">
                        <span>▲ FINISH</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-serif italic text-center mt-6">
                      Level {page.difficultyTier}/3 ({page.difficulty}) • Follow the labyrinth with calm awareness
                    </p>
                  </div>
                )}

                {page.type === 'coloring' && coloringData && (
                  <div className="w-full h-full flex flex-col items-center justify-center relative">
                    {coloringData.aiImageUrl ? (
                      <div className="relative group max-h-[440px] flex items-center justify-center">
                        <img
                          src={coloringData.aiImageUrl}
                          alt={coloringData.title}
                          className="max-h-[440px] object-contain border border-slate-100 shadow-xs rounded-xs"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <canvas
                          ref={mandalaCanvasRef}
                          width={1400}
                          height={1400}
                          className="w-[410px] h-[410px] object-contain rounded-xs"
                        />
                        <span className="text-[10px] font-mono text-slate-400 mt-2">
                          Difficulty Level {page.difficultyTier}/3 ({page.difficulty})
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Discreet Running Page Number Footer */}
          <div className="text-center pt-1.5 border-t border-slate-100">
            <span className="text-xs font-serif font-bold text-slate-700">- {pageNumber} -</span>
          </div>
        </div>
      </div>
    </div>
  );
};

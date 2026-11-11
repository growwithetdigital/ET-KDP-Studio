import React, { useEffect, useRef, useState } from 'react';
import { PuzzlePage, KdpMarginConfig, SudokuPuzzle, WordSearchPuzzle, MazePuzzle, MandalaPuzzle } from '../types';
import { drawMandalaToCanvas } from '../generators/mandala';
import { Eye, EyeOff, RefreshCw, ZoomIn, ZoomOut, Edit3, ShieldAlert } from 'lucide-react';

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

  // Difficulty Tier dots (● ○ ○, ● ● ○, ● ● ●)
  const renderDifficultyMeter = (tier: 1 | 2 | 3, level: string) => {
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

  return (
    <div className="flex flex-col items-center w-full">
      {/* Studio Preview Controls Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-xs text-xs text-slate-700">
        <div className="flex items-center gap-2.5">
          <span className="font-serif font-bold text-slate-900 text-sm">
            Book Page {pageNumber}
          </span>
          <span className="text-slate-300">•</span>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
            {page.type}
          </span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            ({isOdd ? 'Right Page / Spine Left' : 'Left Page / Spine Right'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenEditor && (
            <button
              onClick={onOpenEditor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs"
            >
              <Edit3 size={13} className="text-indigo-600" />
              <span>Edit Page</span>
            </button>
          )}

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

        {/* Paper Content Wrapper (Clean 0.01% elite editorial layout with authentic KDP Gutter Padding) */}
        <div
          className="w-full h-full flex flex-col justify-between"
          style={{
            paddingTop: `${30 * zoom}px`,
            paddingBottom: `${24 * zoom}px`,
            paddingLeft: `${(isOdd ? 44 : 32) * zoom}px`,
            paddingRight: `${(isOdd ? 32 : 44) * zoom}px`,
          }}
        >
          {/* Elite Header */}
          <div className="text-center pb-1.5 border-b border-slate-100/80">
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[8.5px] tracking-[0.25em] uppercase font-semibold text-slate-400">
                {themeName} • {page.sectionTitle}
              </span>
              {renderDifficultyMeter(page.difficultyTier, page.difficulty)}
            </div>

            <h2 className="text-lg font-serif font-bold text-slate-900 tracking-tight">
              {page.data.title ||
                (page.type === 'sudoku' && `Sudoku #${page.data.puzzleNumber}`) ||
                (page.type === 'wordsearch' && `Word Search: ${wordSearchData?.subtheme}`) ||
                (page.type === 'maze' && `Maze Challenge #${page.data.puzzleNumber}`) ||
                (page.type === 'coloring' && coloringData?.title)}
            </h2>

            {page.data.mindfulPrompt && (
              <p className="text-[10px] font-serif italic text-slate-500 max-w-md mx-auto mt-0.5 line-clamp-1">
                "{page.data.mindfulPrompt}"
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
                              } border-r border-b border-slate-200 ${
                                isBorderR ? 'border-b-2 border-b-slate-950' : ''
                              } ${isBorderC ? 'border-r-2 border-r-slate-950' : ''} ${
                                showSolution && !wasOriginal ? 'text-indigo-600 bg-indigo-50/50 font-sans' : 'text-slate-900'
                              }`}
                            >
                              {val !== 0 ? val : ''}
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })()}
                <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400 font-serif italic">
                  <span>Level: {page.difficulty} ({page.difficultyTier}/3)</span>
                  <span>•</span>
                  <span>{sudokuData.grid.length}x{sudokuData.grid.length} Board</span>
                </div>
              </div>
            )}

            {page.type === 'wordsearch' && wordSearchData && (
              <div className="w-full flex flex-col items-center">
                <div
                  className="grid border border-slate-900 bg-slate-50/40 p-2 rounded-xs"
                  style={{
                    gridTemplateColumns: `repeat(${wordSearchData.gridSize}, minmax(0, 1fr))`,
                  }}
                >
                  {wordSearchData.grid.map((row, r) =>
                    row.map((char, c) => {
                      const isSolutionCell =
                        showSolution &&
                        wordSearchData.placements.some((p) =>
                          p.cells.some(([pr, pc]) => pr === r && pc === c)
                        );

                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`w-[22px] h-[22px] flex items-center justify-center font-mono font-bold text-[11px] select-none ${
                            isSolutionCell
                              ? 'bg-amber-200 text-slate-950 rounded-xs ring-1 ring-amber-400 font-black'
                              : 'text-slate-800'
                          }`}
                        >
                          {char}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-3.5 w-full max-w-[420px]">
                  <p className="text-[10px] font-serif font-bold text-slate-700 tracking-wider text-center uppercase mb-1.5">
                    Words to Discover ({wordSearchData.words.length})
                  </p>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10.5px] text-slate-800 px-3">
                    {wordSearchData.words.map((word, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 border border-slate-300 rounded-2xs inline-block" />
                        <span className="font-medium tracking-wide">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {page.type === 'maze' && mazeData && (
              <div className="w-full flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -top-4 left-1 text-[9px] font-serif font-bold text-emerald-700 flex items-center gap-1">
                    <span>START ▼</span>
                  </div>

                  <div
                    className="grid border-2 border-slate-950 bg-white"
                    style={{
                      gridTemplateColumns: `repeat(${mazeData.width}, minmax(0, 1fr))`,
                    }}
                  >
                    {mazeData.grid.map((row, r) =>
                      row.map((cell, c) => {
                        const isWall = cell === 1;
                        const isPath =
                          showSolution &&
                          mazeData.solutionPath.some(([pr, pc]) => pr === r && pc === c);

                        return (
                          <div
                            key={`${r}-${c}`}
                            className={`w-[12px] h-[12px] ${
                              isWall
                                ? 'bg-slate-950'
                                : isPath
                                ? 'bg-rose-500 rounded-full scale-75'
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

          {/* Discreet Running Page Number Footer */}
          <div className="text-center pt-1.5 border-t border-slate-100">
            <span className="text-xs font-serif font-bold text-slate-700">- {pageNumber} -</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { PuzzlePage, KdpMarginConfig } from '../types';
import { drawMandalaToCanvas } from '../generators/mandala';
import { Eye, EyeOff, Sparkles, CheckCircle, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface PageRendererProps {
  page: PuzzlePage;
  config: KdpMarginConfig;
  themeName: string;
  onGenerateAiArt?: (pageIndex: number, prompt: string) => Promise<void>;
  isGeneratingArt?: boolean;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  page,
  config,
  themeName,
  onGenerateAiArt,
  isGeneratingArt = false,
}) => {
  const [showSolution, setShowSolution] = useState(false);
  const [zoom, setZoom] = useState(1);
  const mandalaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const pageNumber = page.pageIndex + 1;
  const isOdd = pageNumber % 2 !== 0;

  // Render Mandala on canvas when page changes
  useEffect(() => {
    if (page.type === 'coloring' && mandalaCanvasRef.current && !page.data.aiImageUrl) {
      const canvas = mandalaCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawMandalaToCanvas(ctx, 1200, 1200, page.data);
      }
    }
  }, [page]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Toolbar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-indigo-400">Page {pageNumber} of 100</span>
          <span className="text-slate-500">•</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
            {page.type}
          </span>
          <span className="text-slate-400 hidden sm:inline text-xs">
            ({isOdd ? 'Right Page / Spine Left' : 'Left Page / Spine Right'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              showSolution
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {showSolution ? <EyeOff size={14} /> : <Eye size={14} />}
            {showSolution ? 'Hide Solution' : 'Show Solution Key'}
          </button>

          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-[11px] text-slate-300 px-1 font-mono">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 8.5" x 11" Paper Canvas Container */}
      <div
        className="relative transition-transform duration-200 shadow-2xl rounded-sm bg-white text-slate-900 border border-slate-300 overflow-hidden select-none"
        style={{
          width: `${600 * zoom}px`,
          height: `${776 * zoom}px`, // 8.5 x 11 aspect ratio = 1 : 1.294
        }}
      >
        {/* KDP Bleed & Margin Guidelines Overlay */}
        {config.showGuides && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {/* Red Bleed Cut Line (0.125" = ~1.5% margin) */}
            <div className="absolute inset-2 border border-dashed border-rose-500/70">
              <span className="absolute top-1 left-2 text-[9px] font-mono font-bold text-rose-600 bg-white/90 px-1 rounded shadow-sm">
                0.125" Bleed Line
              </span>
            </div>

            {/* Safe Zone (0.375" = ~4.5% margin) */}
            <div
              className="absolute border border-dashed border-amber-500/60"
              style={{
                top: '5%',
                bottom: '5%',
                left: isOdd ? '8%' : '5%',
                right: isOdd ? '5%' : '8%',
              }}
            >
              <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-amber-600 bg-white/90 px-1 rounded shadow-sm">
                Safe Margin Zone
              </span>
            </div>

            {/* Spine Gutter Margin Indicator */}
            <div
              className="absolute top-0 bottom-0 bg-emerald-500/10 border-emerald-500/40"
              style={{
                width: '8%',
                left: isOdd ? 0 : 'auto',
                right: isOdd ? 'auto' : 0,
                borderRightWidth: isOdd ? '1px' : '0',
                borderLeftWidth: isOdd ? '0' : '1px',
              }}
            >
              <span
                className="absolute top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-emerald-700 bg-white/90 px-1 py-0.5 rounded shadow-sm whitespace-nowrap"
                style={{
                  transform: isOdd ? 'rotate(90deg) translateY(-50%)' : 'rotate(-90deg) translateY(-50%)',
                  left: isOdd ? '2px' : 'auto',
                  right: isOdd ? 'auto' : '2px',
                }}
              >
                KDP Spine Gutter ({isOdd ? 'Left' : 'Right'})
              </span>
            </div>
          </div>
        )}

        {/* Paper Content Wrapper with authentic KDP Gutter Padding */}
        <div
          className="w-full h-full flex flex-col justify-between"
          style={{
            paddingTop: `${36 * zoom}px`,
            paddingBottom: `${28 * zoom}px`,
            paddingLeft: `${(isOdd ? 48 : 34) * zoom}px`,
            paddingRight: `${(isOdd ? 34 : 48) * zoom}px`,
          }}
        >
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-2">
            <p className="text-[10px] tracking-widest uppercase font-semibold text-slate-400">
              {themeName}
            </p>
            <h2 className="text-lg font-bold tracking-tight text-slate-800">
              {page.type === 'sudoku' && `Sudoku #${page.data.puzzleNumber} - ${page.data.difficulty}`}
              {page.type === 'wordsearch' && `Word Search #${page.data.puzzleNumber}: ${page.data.subtheme}`}
              {page.type === 'maze' && `Maze Challenge #${page.data.puzzleNumber}`}
              {page.type === 'coloring' && (page.data.promptDescription ? `Coloring Art: ${page.data.promptDescription.slice(0, 38)}...` : page.data.title)}
            </h2>
          </div>

          {/* Main Puzzle Area */}
          <div className="flex-1 flex items-center justify-center py-2 overflow-hidden">
            {page.type === 'sudoku' && (
              <div className="w-full max-w-[420px] flex flex-col items-center">
                <div className="grid grid-cols-9 border-2 border-black bg-white shadow-sm">
                  {(showSolution ? page.data.solution : page.data.grid).map((row, r) =>
                    row.map((val, c) => {
                      const isBorderR = (r + 1) % 3 === 0 && r !== 8;
                      const isBorderC = (c + 1) % 3 === 0 && c !== 8;
                      const wasOriginal = page.data.grid[r][c] !== 0;

                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`w-[38px] h-[38px] flex items-center justify-center font-bold text-base border-r border-b border-slate-300 ${
                            isBorderR ? 'border-b-2 border-b-black' : ''
                          } ${isBorderC ? 'border-r-2 border-r-black' : ''} ${
                            showSolution && !wasOriginal ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-900'
                          }`}
                        >
                          {val !== 0 ? val : ''}
                        </div>
                      );
                    })
                  )}
                </div>
                <p className="text-[11px] text-slate-400 italic text-center mt-4">
                  Fill each row, column, and 3x3 box with numbers 1 through 9.
                </p>
              </div>
            )}

            {page.type === 'wordsearch' && (
              <div className="w-full flex flex-col items-center">
                {/* Word Search Letter Grid */}
                <div
                  className="grid border border-slate-800 bg-slate-50/50 p-2 rounded-sm"
                  style={{
                    gridTemplateColumns: `repeat(${page.data.gridSize}, minmax(0, 1fr))`,
                  }}
                >
                  {page.data.grid.map((row, r) =>
                    row.map((char, c) => {
                      // Check if cell is part of solution
                      const isSolutionCell =
                        showSolution &&
                        page.data.placements.some((p) =>
                          p.cells.some(([pr, pc]) => pr === r && pc === c)
                        );

                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`w-6 h-6 flex items-center justify-center font-mono font-bold text-xs select-none transition-colors ${
                            isSolutionCell
                              ? 'bg-amber-300 text-slate-900 rounded-sm font-black ring-1 ring-amber-500'
                              : 'text-slate-800'
                          }`}
                        >
                          {char}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Words to Find Checklist */}
                <div className="mt-4 w-full">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center mb-1.5">
                    Words to Find ({page.data.words.length})
                  </p>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[11px] text-slate-700 px-4">
                    {page.data.words.map((word, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 border border-slate-400 rounded-xs inline-block" />
                        <span className="font-medium tracking-wide">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {page.type === 'maze' && (
              <div className="w-full flex flex-col items-center">
                <div className="relative">
                  {/* Start Indicator */}
                  <div className="absolute -top-5 left-1 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <span>START ▼</span>
                  </div>

                  {/* Maze Grid */}
                  <div
                    className="grid border-2 border-black bg-white"
                    style={{
                      gridTemplateColumns: `repeat(${page.data.width}, minmax(0, 1fr))`,
                    }}
                  >
                    {page.data.grid.map((row, r) =>
                      row.map((cell, c) => {
                        const isWall = cell === 1;
                        const isPath =
                          showSolution &&
                          page.data.solutionPath.some(([pr, pc]) => pr === r && pc === c);

                        return (
                          <div
                            key={`${r}-${c}`}
                            className={`w-3.5 h-3.5 ${
                              isWall
                                ? 'bg-black'
                                : isPath
                                ? 'bg-rose-500 rounded-full scale-75'
                                : 'bg-white'
                            }`}
                          />
                        );
                      })
                    )}
                  </div>

                  {/* Finish Indicator */}
                  <div className="absolute -bottom-5 right-1 text-[10px] font-bold text-rose-600 flex items-center gap-1">
                    <span>▲ FINISH</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic text-center mt-7">
                  Navigate from START to FINISH without crossing the black walls.
                </p>
              </div>
            )}

            {page.type === 'coloring' && (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                {page.data.aiImageUrl ? (
                  <div className="relative group max-h-[460px] flex items-center justify-center">
                    <img
                      src={page.data.aiImageUrl}
                      alt={page.data.title}
                      className="max-h-[460px] object-contain border border-slate-200 shadow-sm rounded-sm"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur">
                      Gemini 3.1 AI Line Art
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <canvas
                      ref={mandalaCanvasRef}
                      width={1200}
                      height={1200}
                      className="w-[420px] h-[420px] object-contain border border-slate-100 rounded-sm"
                    />
                    <p className="text-[10px] text-slate-400 mt-2 font-mono tracking-wide uppercase">
                      Algorithmic Vector Mandala • Style: {page.data.style}
                    </p>
                  </div>
                )}

                {/* AI Line Art Generator Overlay / Trigger */}
                {onGenerateAiArt && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() =>
                        onGenerateAiArt(
                          page.pageIndex,
                          page.data.promptDescription || `${themeName} coloring page line art`
                        )
                      }
                      disabled={isGeneratingArt}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-sm disabled:opacity-50"
                    >
                      {isGeneratingArt ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          Generating with Gemini AI...
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          {page.data.aiImageUrl ? 'Regenerate AI Line Art' : 'Generate AI Line Art with Gemini'}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Page Footer */}
          <div className="text-center border-t border-slate-100 pt-1.5">
            <span className="text-xs font-serif text-slate-500">- {pageNumber} -</span>
          </div>
        </div>
      </div>
    </div>
  );
};

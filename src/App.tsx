import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BookTheme,
  PuzzlePage,
  KdpMarginConfig,
  SudokuPuzzle,
  WordSearchPuzzle,
  MazePuzzle,
  MandalaPuzzle,
} from './types';
import { THEME_PRESETS } from './generators/themePresets';
import { generate25Sudokus, generateSudoku } from './generators/sudoku';
import { generate25WordSearches, generateWordSearch } from './generators/wordSearch';
import { generate25Mazes, generateMaze } from './generators/maze';
import { generate25Mandalas } from './generators/mandala';
import { PageRenderer } from './components/PageRenderer';
import { ThemeSelector } from './components/ThemeSelector';
import { KdpGuideModal } from './components/KdpGuideModal';
import { CoverCalculatorModal } from './components/CoverCalculatorModal';
import { MetadataExportModal } from './components/MetadataExportModal';
import { exportBookToPdf, ExportProgress } from './utils/pdfExport';
import {
  Download,
  BookOpen,
  Calculator,
  Tag,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sliders,
  CheckCircle2,
  FileCheck,
  Sparkles,
  Layers,
  Printer,
  Grid,
} from 'lucide-react';

export default function App() {
  // Theme State (default: Marvel & Superhero Multiverse)
  const [currentTheme, setCurrentTheme] = useState<BookTheme>(THEME_PRESETS[0]);
  const [activeTab, setActiveTab] = useState<'all' | 'sudoku' | 'wordsearch' | 'maze' | 'coloring'>('all');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [seedCounter, setSeedCounter] = useState<number>(1);

  // KDP Bleed & Guides State
  const [kdpConfig, setKdpConfig] = useState<KdpMarginConfig>({
    trimSize: '8.5x11',
    bleed: true,
    safeMarginInches: 0.375,
    gutterMarginInches: 0.5,
    bleedInches: 0.125,
    showGuides: true,
    showSolutions: false,
  });

  // Modals
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showMetadataModal, setShowMetadataModal] = useState(false);

  // Loading & Generation States
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isGeneratingArt, setIsGeneratingArt] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);

  // 100 Pages State
  const [sudokuList, setSudokuList] = useState<SudokuPuzzle[]>([]);
  const [wordSearchList, setWordSearchList] = useState<WordSearchPuzzle[]>([]);
  const [mazeList, setMazeList] = useState<MazePuzzle[]>([]);
  const [mandalaList, setMandalaList] = useState<MandalaPuzzle[]>([]);

  // Regenerate all 100 pages whenever theme or seed changes
  const build100Pages = useCallback(
    (theme: BookTheme, baseSeed: number) => {
      const sList = generate25Sudokus(baseSeed * 100);
      const wsList = generate25WordSearches(theme.wordSearchVocabs, baseSeed * 200);
      const mList = generate25Mazes(baseSeed * 300);
      const mdList = generate25Mandalas(theme.coloringPrompts);

      setSudokuList(sList);
      setWordSearchList(wsList);
      setMazeList(mList);
      setMandalaList(mdList);
    },
    []
  );

  // Initial load
  useEffect(() => {
    build100Pages(currentTheme, seedCounter);
  }, [currentTheme, seedCounter, build100Pages]);

  // Combine into flat 100 pages list (Pages 1-100)
  const allPages: PuzzlePage[] = useMemo(() => {
    const pages: PuzzlePage[] = [];

    // Pages 0 to 24 (Sudoku #1 to #25)
    sudokuList.forEach((s, idx) => {
      pages.push({ type: 'sudoku', pageIndex: idx, data: s });
    });

    // Pages 25 to 49 (Word Search #1 to #25)
    wordSearchList.forEach((w, idx) => {
      pages.push({ type: 'wordsearch', pageIndex: 25 + idx, data: w });
    });

    // Pages 50 to 74 (Mazes #1 to #25)
    mazeList.forEach((m, idx) => {
      pages.push({ type: 'maze', pageIndex: 50 + idx, data: m });
    });

    // Pages 75 to 99 (Coloring #1 to #25)
    mandalaList.forEach((c, idx) => {
      pages.push({ type: 'coloring', pageIndex: 75 + idx, data: c });
    });

    return pages;
  }, [sudokuList, wordSearchList, mazeList, mandalaList]);

  // Filtered pages for sidebar thumbnail grid
  const filteredPages = useMemo(() => {
    if (activeTab === 'all') return allPages;
    return allPages.filter((p) => p.type === activeTab);
  }, [allPages, activeTab]);

  const currentPage = allPages[currentPageIndex] || allPages[0];

  // AI Theme Enrichment Handler
  const handleEnrichCustomTheme = async (themePrompt: string) => {
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/ai/theme-enrichment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themePrompt }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const enriched = resData.data;
        const newTheme: BookTheme = {
          id: `custom-${Date.now()}`,
          name: themePrompt,
          tagline: `AI generated custom theme: ${themePrompt}`,
          icon: 'Sparkles',
          kdpTitle: enriched.title || `The Ultimate ${themePrompt} Activity Book`,
          kdpSubtitle:
            enriched.subtitle ||
            '100 Puzzles: Sudoku, Word Searches, Mazes and Coloring Pages for Kids and Adults',
          kdpKeywords: enriched.kdpKeywords || [
            `${themePrompt.toLowerCase()} activity book`,
            'puzzle book kids',
            'large print word search',
            'fun sudoku puzzles',
            'travel activity games',
            'boredom buster',
            'gift for puzzle lovers',
          ],
          kdpCategories: enriched.kdpCategories || [
            'Juvenile Nonfiction / Activity Books',
            'Games & Activities / Puzzles',
          ],
          kdpDescription:
            enriched.kdpDescription ||
            `<h3>100 Non-Repeating Themed Puzzles & Coloring Pages!</h3><p>Enjoy hours of entertainment with this ${themePrompt} activity book.</p>`,
          wordSearchVocabs: enriched.wordSearchSets?.length
            ? enriched.wordSearchSets
            : currentTheme.wordSearchVocabs,
          coloringPrompts: enriched.coloringPrompts?.length
            ? enriched.coloringPrompts
            : currentTheme.coloringPrompts,
        };

        setCurrentTheme(newTheme);
        setSeedCounter((c) => c + 1);
      } else {
        // Fallback custom theme
        const fallbackTheme: BookTheme = {
          id: `custom-${Date.now()}`,
          name: themePrompt,
          tagline: `Custom theme: ${themePrompt}`,
          icon: 'Compass',
          kdpTitle: `The Ultimate ${themePrompt} Activity Book`,
          kdpSubtitle:
            '100 Themed Puzzles: Sudoku, Word Searches, Mazes and Coloring Pages for Kids & Adults',
          kdpKeywords: [
            `${themePrompt.toLowerCase()} activity book`,
            'fun puzzle book',
            'large print 8.5x11',
            'word search puzzles',
            'sudoku for all ages',
            'relaxing coloring book',
            'travel boredom buster',
          ],
          kdpCategories: [
            'Juvenile Nonfiction / Activity Books',
            'Games & Activities / Puzzles',
          ],
          kdpDescription: `<h3>100 Epic Puzzles & Coloring Pages</h3><p>Enjoy hours of entertainment with this ${themePrompt} themed activity book!</p>`,
          wordSearchVocabs: currentTheme.wordSearchVocabs.map((v, i) => ({
            title: `${themePrompt} #${i + 1}`,
            words: v.words,
          })),
          coloringPrompts: currentTheme.coloringPrompts.map(
            (p, i) => `${themePrompt} themed scene #${i + 1}, bold coloring line art`
          ),
        };
        setCurrentTheme(fallbackTheme);
        setSeedCounter((c) => c + 1);
      }
    } catch (err) {
      console.error('Error enriching theme:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // AI Line Art Generation for Coloring Page
  const handleGenerateAiArt = async (pageIdx: number, promptText: string) => {
    setIsGeneratingArt(true);
    try {
      const response = await fetch('/api/ai/coloring-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          theme: currentTheme.name,
        }),
      });

      const data = await response.json();
      if (data.success && data.imageUrl) {
        setMandalaList((prev) =>
          prev.map((m, idx) => {
            if (75 + idx === pageIdx) {
              return { ...m, aiImageUrl: data.imageUrl };
            }
            return m;
          })
        );
      } else {
        alert(data.error || 'Failed to generate AI line art.');
      }
    } catch (err) {
      console.error('Error generating AI art:', err);
    } finally {
      setIsGeneratingArt(false);
    }
  };

  // PDF Export Trigger
  const handleExportPdf = async (includeSolutions = true) => {
    try {
      setExportProgress({
        currentPage: 0,
        totalPages: 100 + (includeSolutions ? 19 : 0),
        status: 'Initializing KDP 8.5x11 inch PDF Document...',
      });

      const blob = await exportBookToPdf(
        allPages,
        kdpConfig,
        currentTheme.name,
        includeSolutions,
        (progress) => setExportProgress(progress)
      );

      // Download PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanTheme = currentTheme.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      link.download = `${cleanTheme}_100_page_kdp_interior.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('PDF export failed. Please check console logs.');
    } finally {
      setExportProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white">
                VibeBook Forge Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                KDP Pro 8.5x11"
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              100 Dynamic Non-Repeating Puzzles • Sudoku • Word Searches • Mazes • Mandalas & AI Line Art
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="How to publish on Amazon KDP"
          >
            <BookOpen size={14} className="text-indigo-400" />
            <span className="hidden md:inline">KDP Playbook</span>
          </button>

          <button
            onClick={() => setShowCoverModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Calculate exact spine & cover dimensions"
          >
            <Calculator size={14} className="text-emerald-400" />
            <span className="hidden md:inline">Cover Calculator</span>
          </button>

          <button
            onClick={() => setShowMetadataModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="View 7 KDP keywords and description"
          >
            <Tag size={14} className="text-purple-400" />
            <span className="hidden md:inline">KDP Keywords</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={() => handleExportPdf(true)}
            disabled={exportProgress !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
          >
            <Download size={14} />
            <span>Export 100-Page PDF</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: Page Directory & Thumbnails (Width 320px) */}
        <aside className="w-full lg:w-80 bg-slate-900/60 border-r border-slate-800 flex flex-col max-h-[calc(100vh-57px)]">
          {/* Category Filter Tabs */}
          <div className="p-3 border-b border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Layers size={14} className="text-indigo-400" />
                Book Interior (100 Pages)
              </span>
              <button
                onClick={() => setSeedCounter((c) => c + 1)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                title="Regenerate all 100 pages with new puzzle seeds"
              >
                <RefreshCw size={12} />
                Regen Seeds
              </button>
            </div>

            {/* Sub-Tabs */}
            <div className="grid grid-cols-5 gap-1 text-[10px] font-semibold bg-slate-950 p-1 rounded-xl border border-slate-800 text-center">
              {(
                [
                  { id: 'all', label: 'All 100' },
                  { id: 'sudoku', label: 'Sudoku' },
                  { id: 'wordsearch', label: 'Search' },
                  { id: 'maze', label: 'Mazes' },
                  { id: 'coloring', label: 'Color' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-1.5 rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Page Breakdown Summary */}
          <div className="px-4 py-2 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between border-b border-slate-800/80">
            <span>Showing {filteredPages.length} pages</span>
            <span className="font-mono text-indigo-400">25 per type</span>
          </div>

          {/* Thumbnails Scroll List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredPages.map((pageItem) => {
              const isSelected = currentPageIndex === pageItem.pageIndex;
              const pageNum = pageItem.pageIndex + 1;

              return (
                <button
                  key={pageItem.pageIndex}
                  onClick={() => setCurrentPageIndex(pageItem.pageIndex)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {pageNum}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">
                        {pageItem.type === 'sudoku' && `Sudoku #${pageItem.data.puzzleNumber}`}
                        {pageItem.type === 'wordsearch' && `Word Search: ${pageItem.data.subtheme}`}
                        {pageItem.type === 'maze' && `Maze #${pageItem.data.puzzleNumber}`}
                        {pageItem.type === 'coloring' && `Coloring #${pageItem.data.puzzleNumber}`}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {pageItem.type === 'sudoku' && `${pageItem.data.difficulty} Tier`}
                        {pageItem.type === 'wordsearch' && `${pageItem.data.words.length} Words`}
                        {pageItem.type === 'maze' && `${pageItem.data.width}x${pageItem.data.height} Grid`}
                        {pageItem.type === 'coloring' && (pageItem.data.aiImageUrl ? 'AI Line Art' : pageItem.data.style)}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">
                    {pageNum % 2 !== 0 ? 'R' : 'L'}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center Canvas Area */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 lg:p-6 items-center">
          {/* Theme Selector Orchestrator */}
          <div className="w-full max-w-4xl mb-6">
            <ThemeSelector
              currentTheme={currentTheme}
              onSelectTheme={(theme) => {
                setCurrentTheme(theme);
                setSeedCounter((c) => c + 1);
              }}
              onEnrichCustomTheme={handleEnrichCustomTheme}
              isLoadingAi={isLoadingAi}
            />
          </div>

          {/* KDP Guide & Bleed Toggle Controls */}
          <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={kdpConfig.showGuides}
                  onChange={(e) =>
                    setKdpConfig((prev) => ({ ...prev, showGuides: e.target.checked }))
                  }
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-slate-800"
                />
                <span className="font-semibold text-slate-300">Show KDP Bleed & Safe Guides</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={kdpConfig.bleed}
                  onChange={(e) =>
                    setKdpConfig((prev) => ({ ...prev, bleed: e.target.checked }))
                  }
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-slate-800"
                />
                <span className="font-semibold text-slate-300">Bleed (0.125" Standard)</span>
              </label>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
                disabled={currentPageIndex === 0}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs font-mono text-slate-300 px-2">
                Page {currentPageIndex + 1} / 100
              </span>

              <button
                onClick={() => setCurrentPageIndex((p) => Math.min(99, p + 1))}
                disabled={currentPageIndex === 99}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Page Renderer Component */}
          <div className="w-full flex justify-center pb-8">
            <PageRenderer
              page={currentPage}
              config={kdpConfig}
              themeName={currentTheme.name}
              onGenerateAiArt={handleGenerateAiArt}
              isGeneratingArt={isGeneratingArt}
            />
          </div>
        </main>
      </div>

      {/* Export Progress Modal */}
      {exportProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center text-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <Printer className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Forging 100-Page KDP Interior PDF
            </h3>
            <p className="text-xs text-slate-400 mb-5">{exportProgress.status}</p>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150"
                style={{
                  width: `${Math.round(
                    (exportProgress.currentPage / exportProgress.totalPages) * 100
                  )}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>
                Page {exportProgress.currentPage} of {exportProgress.totalPages}
              </span>
              <span>
                {Math.round(
                  (exportProgress.currentPage / exportProgress.totalPages) * 100
                )}
                %
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <KdpGuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} />
      <CoverCalculatorModal
        isOpen={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        pageCount={119}
        themeTitle={currentTheme.kdpTitle}
      />
      <MetadataExportModal
        isOpen={showMetadataModal}
        onClose={() => setShowMetadataModal(false)}
        theme={currentTheme}
      />
    </div>
  );
}

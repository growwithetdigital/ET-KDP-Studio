import React, { useState, useMemo, useCallback } from 'react';
import {
  BookTheme,
  PuzzlePage,
  PuzzleType,
  BookSectionConfig,
  TargetAudience,
  KdpMarginConfig,
  SudokuPuzzle,
  WordSearchPuzzle,
  MazePuzzle,
  MandalaPuzzle,
} from './types';
import { THEME_PRESETS } from './generators/themePresets';
import { generateSudokuSection } from './generators/sudoku';
import { generateWordSearchSection } from './generators/wordSearch';
import { generateMazeSection } from './generators/maze';
import { generateMandalaSection } from './generators/mandala';
import { PageRenderer } from './components/PageRenderer';
import { ThemeSelector } from './components/ThemeSelector';
import { SectionComposer } from './components/SectionComposer';
import { PuzzleEditor } from './components/PuzzleEditor';
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
  Sparkles,
  Layers,
  Printer,
  Grid3X3,
  Search,
  Compass,
  Palette,
  Edit3,
  BookCheck,
  CheckCircle2,
  Filter,
} from 'lucide-react';

const INITIAL_SECTIONS: BookSectionConfig[] = [
  {
    id: 'sec-sudoku',
    type: 'sudoku',
    title: 'Sudoku Puzzles (25 Pages • Easy to Hard)',
    pageCount: 25,
    splitDifficulty: true,
  },
  {
    id: 'sec-wordsearch',
    type: 'wordsearch',
    title: 'Themed Word Searches (25 Pages • 8 Directions)',
    pageCount: 25,
    splitDifficulty: true,
  },
  {
    id: 'sec-maze',
    type: 'maze',
    title: 'Labyrinth Mazes (25 Pages • 3 Difficulty Tiers)',
    pageCount: 25,
    splitDifficulty: true,
  },
  {
    id: 'sec-coloring',
    type: 'coloring',
    title: 'Mindful Coloring Art (25 Pages • Sacred Motifs)',
    pageCount: 25,
    splitDifficulty: true,
  },
];

// Compile section configurations into unified sequential pages with 1/3 difficulty
function buildPagesForSections(
  sectionConfigs: BookSectionConfig[],
  theme: BookTheme,
  audience: TargetAudience,
  seed: number,
  existingPages?: PuzzlePage[]
): PuzzlePage[] {
  const pages: PuzzlePage[] = [];
  let globalNum = 1;

  const existingMap = new Map<string, PuzzlePage>();
  if (existingPages) {
    existingPages.forEach((p) => {
      existingMap.set(`${p.sectionId}-${p.data.puzzleNumber}`, p);
    });
  }

  sectionConfigs.forEach((section, sIdx) => {
    const sSeed = seed + sIdx * 54321;
    if (section.type === 'sudoku') {
      const items = generateSudokuSection(section.pageCount, sSeed, audience);
      items.forEach((item) => {
        const key = `${section.id}-${item.puzzleNumber}`;
        const existing = existingMap.get(key);
        if (existing && existing.type === 'sudoku') {
          pages.push({
            ...existing,
            pageNumber: globalNum++,
            sectionId: section.id,
            sectionTitle: section.title,
          });
        } else {
          pages.push({
            id: `p-${section.id}-${item.puzzleNumber}`,
            pageNumber: globalNum++,
            sectionId: section.id,
            sectionTitle: section.title,
            difficulty: item.difficulty,
            difficultyTier: item.difficultyTier,
            type: 'sudoku',
            data: item,
          });
        }
      });
    } else if (section.type === 'wordsearch') {
      const items = generateWordSearchSection(
        section.pageCount,
        theme.wordSearchVocabs,
        sSeed,
        audience
      );
      items.forEach((item) => {
        const key = `${section.id}-${item.puzzleNumber}`;
        const existing = existingMap.get(key);
        if (existing && existing.type === 'wordsearch') {
          pages.push({
            ...existing,
            pageNumber: globalNum++,
            sectionId: section.id,
            sectionTitle: section.title,
          });
        } else {
          pages.push({
            id: `p-${section.id}-${item.puzzleNumber}`,
            pageNumber: globalNum++,
            sectionId: section.id,
            sectionTitle: section.title,
            difficulty: item.difficulty,
            difficultyTier: item.difficultyTier,
            type: 'wordsearch',
            data: item,
          });
        }
      });
    } else if (section.type === 'maze') {
      const items = generateMazeSection(section.pageCount, sSeed, audience);
      items.forEach((item) => {
        const key = `${section.id}-${item.puzzleNumber}`;
        const existing = existingMap.get(key);
        if (existing && existing.type === 'maze') {
          pages.push({
            ...existing,
            pageNumber: globalNum++,
            sectionId: section.id,
            sectionTitle: section.title,
          });
        } else {
          pages.push({
            id: `p-${section.id}-${item.puzzleNumber}`,
            pageNumber: globalNum++,
            sectionId: section.id,
            sectionTitle: section.title,
            difficulty: item.difficulty,
            difficultyTier: item.difficultyTier,
            type: 'maze',
            data: item,
          });
        }
      });
    } else if (section.type === 'coloring') {
      const items = generateMandalaSection(section.pageCount, theme.coloringPrompts, sSeed);
      items.forEach((item) => {
        const key = `${section.id}-${item.puzzleNumber}`;
        const existing = existingMap.get(key);
        if (existing && existing.type === 'coloring') {
          pages.push({
            ...existing,
            pageNumber: globalNum++,
            sectionId: section.id,
            sectionTitle: section.title,
          });
        } else {
          pages.push({
            id: `p-${section.id}-${item.puzzleNumber}`,
            pageNumber: globalNum++,
            sectionId: section.id,
            sectionTitle: section.title,
            difficulty: item.difficulty,
            difficultyTier: item.difficultyTier,
            type: 'coloring',
            data: item,
          });
        }
      });
    }
  });

  return pages;
}

export default function App() {
  // Theme State
  const [currentTheme, setCurrentTheme] = useState<BookTheme>(THEME_PRESETS[0]);
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('adults');

  // Book Section Formats State
  const [sections, setSections] = useState<BookSectionConfig[]>(INITIAL_SECTIONS);
  const [seedCounter, setSeedCounter] = useState<number>(100);

  // Filter sidebar view: 'all' or sectionId
  const [sidebarFilter, setSidebarFilter] = useState<string>('all');
  const [selectedPageNumber, setSelectedPageNumber] = useState<number>(1);

  // Master Compiled Pages State
  const [curatedPages, setCuratedPages] = useState<PuzzlePage[]>(() =>
    buildPagesForSections(INITIAL_SECTIONS, THEME_PRESETS[0], 'adults', 100)
  );

  // KDP Bleed & Guides State
  const [kdpConfig, setKdpConfig] = useState<KdpMarginConfig>({
    trimSize: '8.5x11',
    bleed: true,
    safeMarginInches: 0.375,
    gutterMarginInches: 0.5,
    bleedInches: 0.125,
    showGuides: false,
    showSolutions: false,
    borderStyle: 'double-line',
    density: '1-per-page',
    largePrint: false,
  });

  // Modals
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showMetadataModal, setShowMetadataModal] = useState(false);

  // Loading & Generation States
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isGeneratingArt, setIsGeneratingArt] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);

  // Helper to re-build pages when sections change
  const handleUpdateSections = (newSections: BookSectionConfig[]) => {
    setSections(newSections);
    setCuratedPages((prev) =>
      buildPagesForSections(newSections, currentTheme, targetAudience, seedCounter, prev)
    );
  };

  // Re-build when theme changes
  const handleSelectTheme = (newTheme: BookTheme) => {
    setCurrentTheme(newTheme);
    setTargetAudience(newTheme.targetAudience);
    setCuratedPages(
      buildPagesForSections(sections, newTheme, newTheme.targetAudience, Date.now())
    );
  };

  // Re-roll all sections with new random seed
  const handleRerollAll = () => {
    const nextSeed = Date.now();
    setSeedCounter(nextSeed);
    setCuratedPages(
      buildPagesForSections(sections, currentTheme, targetAudience, nextSeed)
    );
  };

  // Switch audience and regenerate calibrated puzzles
  const handleChangeAudience = (newAudience: TargetAudience) => {
    setTargetAudience(newAudience);
    const nextSeed = Date.now();
    setSeedCounter(nextSeed);
    setCuratedPages(
      buildPagesForSections(sections, currentTheme, newAudience, nextSeed)
    );
  };

  // Filtered pages for sidebar
  const visiblePages = useMemo(() => {
    if (sidebarFilter === 'all') return curatedPages;
    return curatedPages.filter((p) => p.sectionId === sidebarFilter);
  }, [curatedPages, sidebarFilter]);

  // Current active page
  const currentPage = useMemo(() => {
    const found = curatedPages.find((p) => p.pageNumber === selectedPageNumber);
    return found || curatedPages[0];
  }, [curatedPages, selectedPageNumber]);

  // Update specific page from editor
  const handleSavePage = (updatedPage: PuzzlePage) => {
    setCuratedPages((prev) =>
      prev.map((item) => (item.id === updatedPage.id ? updatedPage : item))
    );
  };

  // AI Theme Enrichment Handler
  const handleEnrichCustomTheme = async (themePrompt: string, aud: TargetAudience = targetAudience) => {
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/ai/theme-enrichment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themePrompt, audience: aud }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const enriched = resData.data;
        const newTheme: BookTheme = {
          id: `custom-${Date.now()}`,
          name: themePrompt,
          targetAudience: aud,
          targetAgeLabel:
            aud === 'kids'
              ? 'Kids Ages 4–8'
              : aud === 'seniors'
              ? 'Seniors & Low-Vision Adults'
              : 'Teens & Adults',
          category: 'Hyper-Specific Sub-Niche',
          tagline: `Calming activity collection: ${themePrompt}`,
          kdpTitle: enriched.title || `The ${themePrompt} Activity Book`,
          kdpSubtitle:
            enriched.subtitle ||
            'Fun Puzzles, Large Print Word Searches, Sudoku & Coloring for Calm and Focus',
          kdpKeywords: enriched.kdpKeywords || [
            `${themePrompt.toLowerCase()} activity book`,
            'word search for adults',
            'large print puzzle book',
            'stress relief brain games',
            'gifts for puzzle lovers',
          ],
          kdpCategories: [
            'Games & Activities / Puzzles',
            'Games & Activities / Word & Word Search',
          ],
          kdpDescription:
            enriched.kdpDescription ||
            `<h3>The Ultimate ${themePrompt} Activity Book</h3><p>Enjoy hours of engaging entertainment and calm focus.</p>`,
          mindfulQuotes: [
            'Take a quiet breath and let tension soften away.',
            'Enjoy the calm flow of discovery and focus.',
          ],
          wordSearchVocabs: enriched.wordSearchSets?.length
            ? enriched.wordSearchSets
            : currentTheme.wordSearchVocabs,
          coloringPrompts: enriched.coloringPrompts?.length
            ? enriched.coloringPrompts.map((p: string, i: number) => ({
                title: `${themePrompt} Scene #${i + 1}`,
                prompt: p,
                motif: 'botanical-leaf' as const,
              }))
            : currentTheme.coloringPrompts,
        };

        handleSelectTheme(newTheme);
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
        setCuratedPages((prev) =>
          prev.map((p, idx) => {
            if (idx === pageIdx && p.type === 'coloring') {
              return {
                ...p,
                data: {
                  ...p.data,
                  aiImageUrl: data.imageUrl,
                } as MandalaPuzzle,
              };
            }
            return p;
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

  // PDF Export Trigger for the Entire Curated Book!
  const handleExportBookPdf = async () => {
    try {
      const totalPages = curatedPages.length;
      const totalSolPages = Math.ceil(totalPages / 4);

      setExportProgress({
        currentPage: 0,
        totalPages: totalPages + totalSolPages,
        status: `Forging ${currentTheme.kdpTitle} (${totalPages} Curated Pages + ${totalSolPages} Solution Pages)...`,
      });

      const blob = await exportBookToPdf(
        curatedPages,
        kdpConfig,
        currentTheme.name,
        currentTheme.kdpTitle,
        true,
        (progress) => setExportProgress(progress)
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanTitle = currentTheme.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      link.download = `${cleanTitle}_activity_book_${curatedPages.length}_pages_kdp.pdf`;
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

  const totalInteriorPages = curatedPages.length;
  const totalSolutionPages = Math.ceil(totalInteriorPages / 4);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Light Theme Editorial Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-8 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                VibeBook Forge Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <BookCheck size={11} />
                <span>Multi-Format KDP Engine</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Dynamic Section Composer • 1/3 Difficulty Progression • High-End Serif Aesthetics • Golden Rule Solutions
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition"
          >
            <BookOpen size={13} className="text-indigo-600" />
            <span className="hidden md:inline">Niche Playbook</span>
          </button>

          <button
            onClick={() => setShowCoverModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition"
          >
            <Calculator size={13} className="text-emerald-600" />
            <span className="hidden md:inline">Cover Calculator</span>
          </button>

          <button
            onClick={() => setShowMetadataModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition"
          >
            <Tag size={13} className="text-purple-600" />
            <span className="hidden md:inline">SEO & Keywords</span>
          </button>

          {/* Export Full Book PDF Button */}
          <button
            onClick={handleExportBookPdf}
            disabled={exportProgress !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition disabled:opacity-50"
          >
            <Download size={14} />
            <span>
              Download PDF ({totalInteriorPages}p + Solutions)
            </span>
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: Pages Directory & Filter */}
        <aside className="w-full lg:w-80 bg-white border-r border-slate-200/90 flex flex-col max-h-[calc(100vh-57px)]">
          {/* Section Quick Filters */}
          <div className="p-3 border-b border-slate-200/80 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Book Pages Navigation
              </span>
              <button
                onClick={handleRerollAll}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition"
                title="Regenerate all puzzles with unique non-repeating layouts"
              >
                <RefreshCw size={11} />
                <span>Re-roll All</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 text-[11px]">
              <button
                onClick={() => setSidebarFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  sidebarFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All ({curatedPages.length})
              </button>

              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setSidebarFilter(sec.id)}
                  className={`px-2 py-1 rounded-lg font-medium transition truncate max-w-[120px] ${
                    sidebarFilter === sec.id
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                  title={sec.title}
                >
                  {sec.type.toUpperCase()} ({sec.pageCount}p)
                </button>
              ))}
            </div>
          </div>

          {/* Sequential Pages Scroll List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {visiblePages.map((pageItem) => {
              const isSelected = currentPage.pageNumber === pageItem.pageNumber;
              const pageNum = pageItem.pageNumber;

              return (
                <button
                  key={pageItem.id}
                  onClick={() => setSelectedPageNumber(pageNum)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-400 shadow-xs ring-1 ring-indigo-400/30'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {pageNum}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {pageItem.data.title || `${pageItem.type} #${pageItem.data.puzzleNumber}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5 font-mono">
                        <span
                          className={`font-semibold px-1 rounded ${
                            pageItem.difficulty === 'Easy'
                              ? 'text-emerald-700 bg-emerald-50'
                              : pageItem.difficulty === 'Medium'
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {pageItem.difficulty} ({pageItem.difficultyTier}/3)
                        </span>
                        <span>•</span>
                        <span className="capitalize text-slate-400">
                          {pageItem.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-1">
                    {pageNum % 2 !== 0 ? 'R' : 'L'}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center Main Stage */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 items-center">
          {/* Theme Selector */}
          <div className="w-full max-w-4xl mb-4">
            <ThemeSelector
              currentTheme={currentTheme}
              onSelectTheme={handleSelectTheme}
              onEnrichCustomTheme={handleEnrichCustomTheme}
              isLoadingAi={isLoadingAi}
              selectedAudience={targetAudience}
              onChangeAudience={handleChangeAudience}
            />
          </div>

          {/* Book Formats & Section Composer */}
          <div className="w-full max-w-4xl mb-5">
            <SectionComposer
              sections={sections}
              onUpdateSections={handleUpdateSections}
              totalPages={totalInteriorPages}
              totalSolutionPages={totalSolutionPages}
              targetAudience={targetAudience}
              onExportBookPdf={handleExportBookPdf}
              isExporting={exportProgress !== null}
            />
          </div>

          {/* Quick Page Bar */}
          <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 mb-4 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={kdpConfig.showGuides}
                  onChange={(e) =>
                    setKdpConfig((prev) => ({ ...prev, showGuides: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                />
                <span className="font-medium text-slate-600">
                  Show KDP Safe & Bleed Margins (Preview Only)
                </span>
              </label>

              <button
                onClick={() => setShowEditorModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <Edit3 size={13} />
                <span>Customize Current Page</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedPageNumber((p) => Math.max(1, p - 1))}
                disabled={currentPage.pageNumber <= 1}
                className="p-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs font-mono font-medium text-slate-700">
                Page {currentPage.pageNumber} of {totalInteriorPages}
              </span>

              <button
                onClick={() =>
                  setSelectedPageNumber((p) =>
                    Math.min(totalInteriorPages, p + 1)
                  )
                }
                disabled={currentPage.pageNumber >= totalInteriorPages}
                className="p-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Page Renderer Preview */}
          <div className="w-full flex justify-center pb-12">
            <PageRenderer
              page={currentPage}
              config={kdpConfig}
              themeName={currentTheme.name}
              onOpenEditor={() => setShowEditorModal(true)}
              onGenerateAiArt={handleGenerateAiArt}
              isGeneratingArt={isGeneratingArt}
            />
          </div>
        </main>
      </div>

      {/* Export Progress Modal */}
      {exportProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-center text-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3.5">
              <Printer className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>

            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Forging Print-Ready KDP PDF
            </h3>
            <p className="text-xs text-slate-500 mb-4">{exportProgress.status}</p>

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 mb-2">
              <div
                className="h-full bg-indigo-600 transition-all duration-150"
                style={{
                  width: `${Math.round(
                    (exportProgress.currentPage / exportProgress.totalPages) * 100
                  )}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
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

      {/* Editor & Guide Modals */}
      <PuzzleEditor
        isOpen={showEditorModal}
        onClose={() => setShowEditorModal(false)}
        page={currentPage}
        onSavePage={handleSavePage}
        onGenerateAiArt={handleGenerateAiArt}
        isGeneratingArt={isGeneratingArt}
      />
      <KdpGuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} />
      <CoverCalculatorModal
        isOpen={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        pageCount={totalInteriorPages + totalSolutionPages}
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

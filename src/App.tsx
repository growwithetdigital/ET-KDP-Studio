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
  FrontPageData,
  TocData,
  ForewordData,
} from './types';
import { THEME_PRESETS } from './generators/themePresets';
import { generateSudokuSection } from './generators/sudoku';
import { generateWordSearchSection } from './generators/wordSearch';
import { generateMazeSection } from './generators/maze';
import { generateMandalaSection } from './generators/mandala';
import {
  createFrontPageData,
  createTocData,
  createForewordData,
  createSectionDividerData,
} from './generators/frontMatter';
import { PageRenderer } from './components/PageRenderer';
import { PuzzleEditor } from './components/PuzzleEditor';
import { CoverCalculatorModal } from './components/CoverCalculatorModal';
import { MetadataExportModal } from './components/MetadataExportModal';
import { exportBookToPdf, ExportProgress } from './utils/pdfExport';
import {
  Download,
  Calculator,
  Tag,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Grid3X3,
  Search,
  Compass,
  Palette,
  Edit3,
  BookCheck,
  CheckCircle2,
  Printer,
  SlidersHorizontal,
  Bookmark,
  FileText,
  Eye,
  Tablet,
} from 'lucide-react';

// The 4 Core Formats & Sections
const DEFAULT_SECTION_SPECS: { type: PuzzleType; title: string; defaultCount: number }[] = [
  { type: 'sudoku', title: 'Sudoku Logic Puzzles', defaultCount: 25 },
  { type: 'wordsearch', title: 'Themed Word Searches', defaultCount: 25 },
  { type: 'maze', title: 'Labyrinth Mazes', defaultCount: 25 },
  { type: 'coloring', title: 'Mindful Coloring Art', defaultCount: 25 },
];

// Quick theme inspiration chips (including Marvel & Disney references)
const QUICK_THEMES = [
  { name: 'Marvel-Inspired Superheroes', prompt: 'Cosmic Superheroes & Heroic Legends' },
  { name: 'Disney-Inspired Fairytales', prompt: 'Enchanted Kingdom & Fairy Tale Magic' },
  { name: 'Cozy Coffee & Rainy Days', prompt: 'Warm Coffee Shop, Autumn Rain & Books' },
  { name: 'Deep Space Odyssey', prompt: 'Galactic Constellations & Deep Space Nebulas' },
  { name: 'Zen Japanese Garden', prompt: 'Botanical Bonsai, Lotus Ponds & Stone Lanterns' },
  { name: 'Ocean Depths & Coral Reefs', prompt: 'Bioluminescent Marine Life & Coral Kingdoms' },
];

// Master page compiler including Front Page, Table of Contents, Foreword, and all 4 formats
function compileCompleteBookInterior(
  theme: BookTheme,
  sections: BookSectionConfig[],
  audience: TargetAudience,
  seed: number,
  existingCustomizations?: Map<string, PuzzlePage>
): PuzzlePage[] {
  const pages: PuzzlePage[] = [];

  // Total puzzles count
  const totalPuzzles = sections.reduce((acc, s) => acc + s.pageCount, 0);

  // 1. Front Page / Half-Title (Page 1)
  pages.push({
    id: 'page-front-cover',
    pageNumber: 1,
    sectionId: 'front-matter',
    sectionTitle: 'Title Page',
    type: 'cover',
    data: createFrontPageData(theme, totalPuzzles),
  });

  // 2. Table of Contents (Page 2)
  pages.push({
    id: 'page-toc',
    pageNumber: 2,
    sectionId: 'front-matter',
    sectionTitle: 'Table of Contents',
    type: 'toc',
    data: createTocData(theme, sections, 3),
  });

  // 3. Foreword (Page 3)
  pages.push({
    id: 'page-foreword',
    pageNumber: 3,
    sectionId: 'front-matter',
    sectionTitle: 'Foreword',
    type: 'foreword',
    data: createForewordData(theme.name),
  });

  // 4. Puzzle Sections (Pages 4+)
  let globalNum = 4;

  sections.forEach((section, sIdx) => {
    const sSeed = seed + sIdx * 77777;
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'][sIdx] || `${sIdx + 1}`;

    // Part divider page with famous quote and curated description
    pages.push({
      id: `divider-${section.id}`,
      pageNumber: globalNum++,
      sectionId: section.id,
      sectionTitle: section.title,
      type: 'section-divider',
      data: createSectionDividerData(section.type, theme, `Part ${roman}`, section.pageCount),
    });

    if (section.type === 'sudoku') {
      const items = generateSudokuSection(section.pageCount, sSeed, audience);
      items.forEach((item) => {
        const key = `${section.id}-${item.puzzleNumber}`;
        const existing = existingCustomizations?.get(key);
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
        const existing = existingCustomizations?.get(key);
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
        const existing = existingCustomizations?.get(key);
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
        const existing = existingCustomizations?.get(key);
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
  // Theme Input State
  const [themeInputText, setThemeInputText] = useState('Marvel-Inspired Superhero Odyssey');
  const [currentTheme, setCurrentTheme] = useState<BookTheme>(() => ({
    ...THEME_PRESETS[0],
    name: 'Marvel-Inspired Superhero Odyssey',
    kdpTitle: 'The Superhero Activity & Logic Guide',
    kdpSubtitle: '100 Calibrated Puzzles, Large-Print Word Searches & Mindful Coloring for Focus',
  }));

  const [targetAudience, setTargetAudience] = useState<TargetAudience>('adults');
  const [seedCounter, setSeedCounter] = useState<number>(42);

  // The 4 Formats Configuration (25 pages each = 100 pages total by default)
  const [formatCounts, setFormatCounts] = useState<{ [key in PuzzleType]: number }>({
    sudoku: 25,
    wordsearch: 25,
    maze: 25,
    coloring: 25,
  });

  // Current active page in viewer
  const [selectedPageNumber, setSelectedPageNumber] = useState<number>(1);

  // Modals
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showMetadataModal, setShowMetadataModal] = useState(false);

  // KDP Bleed Preview Toggle
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

  // Generation & Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);

  // Current Sections Array based on formatCounts
  const sections: BookSectionConfig[] = useMemo(() => {
    return DEFAULT_SECTION_SPECS.map((spec) => ({
      id: `sec-${spec.type}`,
      type: spec.type,
      title: `${spec.title} (${formatCounts[spec.type]} Pages)`,
      pageCount: formatCounts[spec.type],
      splitDifficulty: true,
    }));
  }, [formatCounts]);

  // Master Compiled Pages State
  const [bookPages, setBookPages] = useState<PuzzlePage[]>(() =>
    compileCompleteBookInterior(
      {
        ...THEME_PRESETS[0],
        name: 'Marvel-Inspired Superhero Odyssey',
        kdpTitle: 'The Superhero Activity & Logic Guide',
        kdpSubtitle: '100 Calibrated Puzzles, Large-Print Word Searches & Mindful Coloring for Focus',
      },
      DEFAULT_SECTION_SPECS.map((spec) => ({
        id: `sec-${spec.type}`,
        type: spec.type,
        title: `${spec.title} (${spec.defaultCount} Pages)`,
        pageCount: spec.defaultCount,
        splitDifficulty: true,
      })),
      'adults',
      42
    )
  );

  // Active page object
  const currentPage = useMemo(() => {
    return bookPages.find((p) => p.pageNumber === selectedPageNumber) || bookPages[0];
  }, [bookPages, selectedPageNumber]);

  // Total Puzzles & Solutions calculation
  const totalPuzzlePages = useMemo(() => {
    return Object.values(formatCounts).reduce((a, b) => a + b, 0);
  }, [formatCounts]);

  const totalSolutionPages = Math.ceil(
    (formatCounts.sudoku + formatCounts.wordsearch + formatCounts.maze) / 4
  );

  // Handle Generate Activity Book
  const handleGenerateBook = async (customThemePrompt?: string) => {
    const promptToUse = (customThemePrompt || themeInputText).trim();
    if (!promptToUse) return;

    setIsGenerating(true);
    const nextSeed = Date.now();
    setSeedCounter(nextSeed);

    try {
      // Fetch AI enrichment for high-intent theme vocabulary and coloring art
      const response = await fetch('/api/ai/theme-enrichment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: promptToUse, audience: targetAudience }),
      });

      const resData = await response.json();
      let updatedTheme: BookTheme;

      if (resData.success && resData.data) {
        const enriched = resData.data;
        updatedTheme = {
          id: `custom-${nextSeed}`,
          name: promptToUse,
          targetAudience,
          targetAgeLabel:
            targetAudience === 'kids'
              ? 'Kids Ages 4–8'
              : targetAudience === 'seniors'
              ? 'Seniors & Low-Vision Adults'
              : 'Teens & Adults',
          category: 'Mindfulness & Logic Puzzles',
          tagline: `Calming activity book: ${promptToUse}`,
          kdpTitle: enriched.title || `The ${promptToUse} Activity Book`,
          kdpSubtitle:
            enriched.subtitle ||
            '100 Calibrated Puzzles, Large-Print Word Searches & Mindful Coloring for Focus and Calm',
          kdpKeywords: enriched.kdpKeywords || [
            `${promptToUse.toLowerCase()} activity book`,
            'large print puzzle book',
            'stress relief brain games',
            'anxiety relief puzzles',
            'gifts for puzzle lovers',
          ],
          kdpCategories: [
            'Games & Activities / Puzzles',
            'Games & Activities / Word & Word Search',
          ],
          kdpDescription:
            enriched.kdpDescription ||
            `<h3>The Ultimate ${promptToUse} Activity Book</h3><p>Enjoy hours of engaging entertainment and calm focus.</p>`,
          mindfulQuotes: [
            'Take a quiet breath and let tension soften away.',
            'Enjoy the quiet flow of discovery and focus.',
            'There is no rush; one mindful step at a time.',
          ],
          wordSearchVocabs: enriched.wordSearchSets?.length
            ? enriched.wordSearchSets
            : currentTheme.wordSearchVocabs,
          coloringPrompts: enriched.coloringPrompts?.length
            ? enriched.coloringPrompts.map((p: string, i: number) => ({
                title: `${promptToUse} Motif #${i + 1}`,
                prompt: p,
                motif: 'botanical-leaf' as const,
              }))
            : currentTheme.coloringPrompts,
        };
      } else {
        // Fallback robust theme
        updatedTheme = {
          ...currentTheme,
          name: promptToUse,
          kdpTitle: `The ${promptToUse} Activity Book`,
          kdpSubtitle:
            '100 Calibrated Puzzles, Large-Print Word Searches & Mindful Coloring for Focus and Calm',
        };
      }

      setCurrentTheme(updatedTheme);

      // Re-compile all interior pages with front page, table of contents, foreword, and puzzles
      const compiled = compileCompleteBookInterior(
        updatedTheme,
        sections,
        targetAudience,
        nextSeed
      );
      setBookPages(compiled);
      setSelectedPageNumber(1);
    } catch (err) {
      console.error('Error generating book:', err);
      // Generate programmatically without network failure
      const updatedTheme: BookTheme = {
        ...currentTheme,
        name: promptToUse,
        kdpTitle: `The ${promptToUse} Activity Book`,
        kdpSubtitle:
          '100 Calibrated Puzzles, Large-Print Word Searches & Mindful Coloring for Focus and Calm',
      };
      setCurrentTheme(updatedTheme);
      const compiled = compileCompleteBookInterior(
        updatedTheme,
        sections,
        targetAudience,
        nextSeed
      );
      setBookPages(compiled);
      setSelectedPageNumber(1);
    } finally {
      setIsGenerating(false);
    }
  };

  // Re-generate individual page save
  const handleSavePage = (updatedPage: PuzzlePage) => {
    setBookPages((prev) =>
      prev.map((item) => (item.id === updatedPage.id ? updatedPage : item))
    );
  };

  // Handle PDF Export (Print or Digital Interactive)
  const handleExportPdf = async (isInteractiveDigital = false) => {
    try {
      const totalPages = bookPages.length;

      setExportProgress({
        currentPage: 0,
        totalPages: totalPages + totalSolutionPages,
        status: isInteractiveDigital
          ? `Forging Digital Interactive Edition (${totalPages} Pages with Clickable Navigation)...`
          : `Forging Deluxe Collector's Edition (${totalPages} Interior Pages + ${totalSolutionPages} Solutions Pages)...`,
      });

      const blob = await exportBookToPdf(
        bookPages,
        kdpConfig,
        currentTheme.name,
        currentTheme.kdpTitle,
        true,
        (progress) => setExportProgress(progress),
        isInteractiveDigital
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanTitle = currentTheme.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const suffix = isInteractiveDigital ? 'interactive_digital' : 'deluxe_edition';
      link.download = `${cleanTitle}_activity_book_${bookPages.length}p_${suffix}.pdf`;
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Clean Uncluttered Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                VibeBook Forge
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Deluxe Activity Book Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Front Matter • 4 Curated Formats • 1/3 Difficulty Split • Section Quotes & Solutions
            </p>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCoverModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition"
          >
            <Sparkles size={13} className="text-indigo-600" />
            <span className="hidden sm:inline">4K Cover Studio</span>
          </button>

          <button
            onClick={() => setShowMetadataModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition"
          >
            <Tag size={13} className="text-purple-600" />
            <span className="hidden sm:inline">Search Metadata</span>
          </button>

          {/* Option 1: Print Edition PDF */}
          <button
            onClick={() => handleExportPdf(false)}
            disabled={exportProgress !== null}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition disabled:opacity-50"
            title="Download clean 8.5x11 printable PDF with solutions"
          >
            <Printer size={13} className="text-emerald-400" />
            <span>Print Edition PDF</span>
          </button>

          {/* Option 2: Digital Interactive PDF */}
          <button
            onClick={() => handleExportPdf(true)}
            disabled={exportProgress !== null}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/25 transition disabled:opacity-50"
            title="Download interactive PDF with clickable TOC and solution jump links for tablets & offline use"
          >
            <Tablet size={13} className="text-indigo-200" />
            <span>Digital Interactive PDF</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Step 1 & 2: Clean Generation Deck */}
        <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          {/* Theme Input Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Bookmark size={13} className="text-indigo-600" />
                <span>1. Enter Your Book Theme & Concept</span>
              </label>

              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>Target Audience:</span>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 font-semibold text-slate-800 text-xs focus:outline-none"
                >
                  <option value="adults">Adults & Busy Minds</option>
                  <option value="seniors">Seniors (Large Print)</option>
                  <option value="kids">Kids (Ages 4–8)</option>
                  <option value="teens">Teens & Young Adults</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={themeInputText}
                onChange={(e) => setThemeInputText(e.target.value)}
                placeholder="e.g. Marvel Superheroes, Disney Fairytales, Cozy Rainy Cafe, Deep Space..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />

              <button
                type="button"
                onClick={() => handleGenerateBook()}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/25 transition disabled:opacity-50 shrink-0"
              >
                <Sparkles size={15} />
                <span>{isGenerating ? 'Forging 100-Page Book...' : 'Generate Activity Book'}</span>
              </button>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-[11px] text-slate-400 mr-1">Try Inspiration:</span>
              {QUICK_THEMES.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => {
                    setThemeInputText(theme.prompt);
                    handleGenerateBook(theme.prompt);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200/80"
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* The 4 Formats & Sections Grid */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={13} className="text-indigo-600" />
                <span>2. The 4 Activity Formats Included (25 Pages Each = 100 Pages Total)</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                1/3 Easy • 1/3 Medium • 1/3 Hard
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {DEFAULT_SECTION_SPECS.map((spec) => {
                const count = formatCounts[spec.type];

                return (
                  <div
                    key={spec.type}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                          {spec.type === 'sudoku' && <Grid3X3 size={16} className="text-indigo-600" />}
                          {spec.type === 'wordsearch' && <Search size={16} className="text-emerald-600" />}
                          {spec.type === 'maze' && <Compass size={16} className="text-amber-600" />}
                          {spec.type === 'coloring' && <Palette size={16} className="text-purple-600" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block leading-tight">
                            {spec.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {spec.type === 'sudoku' && 'Logic Board Grids'}
                            {spec.type === 'wordsearch' && 'Themed Vocabulary'}
                            {spec.type === 'maze' && 'Pathfinding Mazes'}
                            {spec.type === 'coloring' && 'Vector Motifs'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-500 font-medium">Page Volume:</span>
                      <select
                        value={count}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormatCounts((prev) => ({ ...prev, [spec.type]: val }));
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-800 shadow-2xs"
                      >
                        <option value={15}>15 Pages</option>
                        <option value={20}>20 Pages</option>
                        <option value={25}>25 Pages</option>
                        <option value={30}>30 Pages</option>
                        <option value={50}>50 Pages</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Book Interior Files Navigation Bar */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Book Interior Files Generated:
                </span>
                <span className="text-xs font-bold text-indigo-700">
                  {currentTheme.kdpTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Front Matter (Title, TOC, Foreword) • {totalPuzzlePages} Puzzles • {totalSolutionPages} Solution Pages
              </p>
            </div>

            {/* Quick Section Jump Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedPageNumber(1)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedPageNumber === 1
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                📖 Title (p.1)
              </button>
              <button
                type="button"
                onClick={() => setSelectedPageNumber(2)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedPageNumber === 2
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                📑 Contents (p.2)
              </button>
              <button
                type="button"
                onClick={() => setSelectedPageNumber(3)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedPageNumber === 3
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ✍️ Foreword (p.3)
              </button>
              <button
                type="button"
                onClick={() => setSelectedPageNumber(4)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  currentPage.type === 'sudoku' ||
                  (currentPage.type === 'section-divider' && (currentPage.data as any).sectionType === 'sudoku')
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Part I: Sudoku (p.4)
              </button>
              <button
                type="button"
                onClick={() => setSelectedPageNumber(4 + formatCounts.sudoku + 1)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  currentPage.type === 'wordsearch' ||
                  (currentPage.type === 'section-divider' && (currentPage.data as any).sectionType === 'wordsearch')
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Part II: Word Search
              </button>
              <button
                type="button"
                onClick={() => setSelectedPageNumber(4 + formatCounts.sudoku + 1 + formatCounts.wordsearch + 1)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  currentPage.type === 'maze' ||
                  (currentPage.type === 'section-divider' && (currentPage.data as any).sectionType === 'maze')
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Part III: Mazes
              </button>
              <button
                type="button"
                onClick={() =>
                  setSelectedPageNumber(
                    4 + formatCounts.sudoku + 1 + formatCounts.wordsearch + 1 + formatCounts.maze + 1
                  )
                }
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  currentPage.type === 'coloring' ||
                  (currentPage.type === 'section-divider' && (currentPage.data as any).sectionType === 'coloring')
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Part IV: Coloring
              </button>
            </div>
          </div>

          {/* Page Step Navigator */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={kdpConfig.showGuides}
                  onChange={(e) =>
                    setKdpConfig((prev) => ({ ...prev, showGuides: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                />
                <span>Show Safe Margins & Bleed Guides</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedPageNumber((p) => Math.max(1, p - 1))}
                disabled={selectedPageNumber <= 1}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs font-mono font-bold text-slate-800">
                Page {selectedPageNumber} of {bookPages.length}
              </span>

              <button
                onClick={() => setSelectedPageNumber((p) => Math.min(bookPages.length, p + 1))}
                disabled={selectedPageNumber >= bookPages.length}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* High-Resolution Book Page Viewer Stage */}
        <div className="w-full flex justify-center pb-12">
          <PageRenderer
            page={currentPage}
            config={kdpConfig}
            themeName={currentTheme.name}
            onOpenEditor={() => setShowEditorModal(true)}
          />
        </div>
      </main>

      {/* Export Progress Modal */}
      {exportProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-center text-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3.5">
              <Printer className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>

            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {exportProgress.status.includes('Digital')
                ? 'Forging Digital Interactive Edition'
                : 'Forging Deluxe Activity Book PDF'}
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
      />
      <CoverCalculatorModal
        isOpen={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        pageCount={bookPages.length + totalSolutionPages}
        theme={currentTheme}
        audience={targetAudience}
      />
      <MetadataExportModal
        isOpen={showMetadataModal}
        onClose={() => setShowMetadataModal(false)}
        theme={currentTheme}
      />
    </div>
  );
}

export type PuzzleType = 'sudoku' | 'wordsearch' | 'maze' | 'coloring';

export type TargetAudience = 'toddlers' | 'kids' | 'teens' | 'adults' | 'seniors';

export type LayoutDensity = '1-per-page' | '2-per-page' | '4-per-page';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface BookSectionConfig {
  id: string;
  type: PuzzleType;
  title: string;
  pageCount: number; // e.g. 15, 25, 30, 50
  splitDifficulty: boolean; // 1/3 Easy, 1/3 Medium, 1/3 Hard
}

export interface SudokuPuzzle {
  id: string;
  puzzleNumber: number;
  title?: string;
  mindfulPrompt?: string;
  difficulty: DifficultyLevel;
  difficultyTier: 1 | 2 | 3;
  gridSize?: 4 | 6 | 9; // 4x4 or 6x6 for toddlers/kids, 9x9 for teens/adults/seniors
  grid: number[][]; // (0 represents empty cell)
  solution: number[][]; // completed
}

export interface WordSearchPlacement {
  word: string;
  start: [number, number]; // [row, col]
  end: [number, number];
  direction: [number, number]; // [dr, dc]
  cells: [number, number][];
}

export interface WordSearchPuzzle {
  id: string;
  puzzleNumber: number;
  title?: string;
  subtheme: string;
  mindfulPrompt?: string;
  difficulty: DifficultyLevel;
  difficultyTier: 1 | 2 | 3;
  gridSize: number; // 10 for Easy, 13 for Medium, 14 for Hard
  grid: string[][];
  words: string[];
  placements: WordSearchPlacement[];
  isLargePrint?: boolean;
}

export interface MazePuzzle {
  id: string;
  puzzleNumber: number;
  title?: string;
  mindfulPrompt?: string;
  difficulty: DifficultyLevel;
  difficultyTier: 1 | 2 | 3;
  width: number; // 17 for Easy, 23 for Medium, 29 for Hard
  height: number;
  grid: number[][]; // 0: path, 1: wall
  start: [number, number];
  finish: [number, number];
  solutionPath: [number, number][];
  corridorWidth?: 'wide' | 'standard';
}

export interface MandalaPuzzle {
  id: string;
  puzzleNumber: number;
  title: string;
  mindfulPrompt?: string;
  difficulty: DifficultyLevel;
  difficultyTier: 1 | 2 | 3;
  style: 'sacred-geometry' | 'floral-rosette' | 'kaleidoscope' | 'star-burst' | 'botanical-leaf' | 'zen-waves' | 'simple-shapes' | 'ai-lineart';
  seed: number;
  aiImageUrl?: string;
  promptDescription?: string;
  strokeWeight?: 'extra-thick' | 'bold' | 'fine';
}

export type PageType =
  | 'cover'
  | 'toc'
  | 'foreword'
  | 'section-divider'
  | 'sudoku'
  | 'wordsearch'
  | 'maze'
  | 'coloring';

export interface FrontPageData {
  title: string;
  subtitle: string;
  themeName: string;
  authorNote?: string;
  audienceLabel: string;
  totalPuzzles: number;
}

export interface TocEntry {
  title: string;
  startPage: number;
  endPage?: number;
  pageCount: number;
  subtitle: string;
  type: PageType;
}

export interface TocData {
  title: string;
  subtitle: string;
  entries: TocEntry[];
}

export interface ForewordData {
  title: string;
  subtitle: string;
  paragraphs: string[];
  keyBenefits: { title: string; desc: string }[];
}

export interface SectionDividerData {
  partNumber: string;
  sectionType: PuzzleType;
  title: string;
  subtitle: string;
  curatedDescription: string;
  quote: {
    text: string;
    author: string;
    sourceOrRole?: string;
  };
  totalSectionPages: number;
  difficultySummary: string;
}

export interface CoverPromptData {
  bookTitle: string;
  bookSubtitle: string;
  themePrompt: string;
  artisticStyle: string;
  fullMidjourneyPrompt: string;
  dalleGeminiPrompt: string;
  recommendedPalette: string[];
  dimensionsRecommendation: string;
}

export interface PuzzlePage {
  id: string;
  pageNumber: number; // 1-based book page number
  sectionId: string;
  sectionTitle: string;
  difficulty?: DifficultyLevel;
  difficultyTier?: 1 | 2 | 3; // 1/3, 2/3, 3/3
  type: PageType;
  data:
    | SudokuPuzzle
    | WordSearchPuzzle
    | MazePuzzle
    | MandalaPuzzle
    | FrontPageData
    | TocData
    | ForewordData
    | SectionDividerData;
}

export interface BookTheme {
  id: string;
  name: string;
  targetAudience: TargetAudience;
  targetAgeLabel: string;
  tagline: string;
  category: string;
  seriesCollectionName?: string;
  sisterThemes?: string[];
  wordSearchVocabs: { title: string; words: string[]; prompt?: string }[];
  coloringPrompts: { title: string; prompt: string; motif: MandalaPuzzle['style'] }[];
  mindfulQuotes: string[];
  kdpTitle: string;
  kdpSubtitle: string;
  kdpKeywords: string[];
  kdpCategories: string[];
  kdpDescription: string;
}

export interface KdpMarginConfig {
  trimSize: '8.5x11' | '6x9' | '7x10';
  bleed: boolean;
  safeMarginInches: number; // 0.375
  gutterMarginInches: number; // 0.5
  bleedInches: number; // 0.125
  showGuides: boolean;
  showSolutions: boolean;
  borderStyle: 'double-line' | 'minimal-corners' | 'clean-box' | 'none';
  density: LayoutDensity;
  largePrint: boolean;
}

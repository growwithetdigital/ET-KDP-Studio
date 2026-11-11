export type PuzzleType = 'sudoku' | 'wordsearch' | 'maze' | 'coloring';

export type SudokuDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface SudokuPuzzle {
  id: string;
  puzzleNumber: number;
  difficulty: SudokuDifficulty;
  grid: number[][]; // 9x9 (0 represents empty cell)
  solution: number[][]; // 9x9 completed
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
  subtheme: string;
  gridSize: number;
  grid: string[][];
  words: string[];
  placements: WordSearchPlacement[];
}

export interface MazePuzzle {
  id: string;
  puzzleNumber: number;
  width: number; // grid cols (e.g. 21)
  height: number; // grid rows (e.g. 21)
  grid: number[][]; // 0: path, 1: wall
  start: [number, number];
  finish: [number, number];
  solutionPath: [number, number][]; // coordinates from start to finish
}

export interface MandalaPuzzle {
  id: string;
  puzzleNumber: number;
  title: string;
  style: 'sacred-geometry' | 'floral-rosette' | 'kaleidoscope' | 'star-burst' | 'celtic-knot' | 'ai-lineart';
  seed: number;
  aiImageUrl?: string;
  promptDescription?: string;
}

export type PuzzlePage =
  | { type: 'sudoku'; pageIndex: number; data: SudokuPuzzle }
  | { type: 'wordsearch'; pageIndex: number; data: WordSearchPuzzle }
  | { type: 'maze'; pageIndex: number; data: MazePuzzle }
  | { type: 'coloring'; pageIndex: number; data: MandalaPuzzle };

export interface BookTheme {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  wordSearchVocabs: { title: string; words: string[] }[];
  coloringPrompts: string[];
  kdpTitle: string;
  kdpSubtitle: string;
  kdpKeywords: string[];
  kdpCategories: string[];
  kdpDescription: string;
}

export interface KdpMarginConfig {
  trimSize: '8.5x11' | '8.25x11' | '6x9';
  bleed: boolean;
  safeMarginInches: number; // e.g. 0.375
  gutterMarginInches: number; // e.g. 0.5 for spine
  bleedInches: number; // 0.125
  showGuides: boolean;
  showSolutions: boolean;
}

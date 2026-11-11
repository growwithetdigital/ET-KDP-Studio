import React, { useState } from 'react';
import {
  PuzzlePage,
  DifficultyLevel,
  MandalaPuzzle,
  SudokuPuzzle,
  WordSearchPuzzle,
  MazePuzzle,
} from '../types';
import { generateSudoku } from '../generators/sudoku';
import { generateWordSearch } from '../generators/wordSearch';
import { generateMaze } from '../generators/maze';
import {
  X,
  Sparkles,
  Save,
  RotateCcw,
  Sliders,
  Type,
  Grid3X3,
  ListPlus,
  Compass,
  Palette,
  Check,
} from 'lucide-react';

interface PuzzleEditorProps {
  isOpen: boolean;
  onClose: () => void;
  page: PuzzlePage | null;
  onSavePage: (updatedPage: PuzzlePage) => void;
  onGenerateAiArt?: (pageIndex: number, prompt: string) => Promise<void>;
  isGeneratingArt?: boolean;
}

export const PuzzleEditor: React.FC<PuzzleEditorProps> = ({
  isOpen,
  onClose,
  page,
  onSavePage,
  onGenerateAiArt,
  isGeneratingArt = false,
}) => {
  if (!isOpen || !page) return null;
  if (page.type === 'cover' || page.type === 'toc' || page.type === 'foreword') return null;

  const puzzleData = page.data as SudokuPuzzle | WordSearchPuzzle | MazePuzzle | MandalaPuzzle;

  // Local state for editing
  const [customTitle, setCustomTitle] = useState(
    puzzleData.title ||
      (page.type === 'sudoku'
        ? `Sudoku #${(puzzleData as SudokuPuzzle).puzzleNumber}`
        : page.type === 'wordsearch'
        ? `Word Search #${(puzzleData as WordSearchPuzzle).puzzleNumber}`
        : page.type === 'maze'
        ? `Maze #${(puzzleData as MazePuzzle).puzzleNumber}`
        : `Coloring Art #${(puzzleData as MandalaPuzzle).puzzleNumber}`)
  );

  const [mindfulPrompt, setMindfulPrompt] = useState(puzzleData.mindfulPrompt || '');

  // Sudoku state
  const [sudokuDifficulty, setSudokuDifficulty] = useState<DifficultyLevel>(
    page.type === 'sudoku' ? (page.data as SudokuPuzzle).difficulty : 'Medium'
  );
  const [sudokuGrid, setSudokuGrid] = useState<number[][]>(
    page.type === 'sudoku' ? (page.data as SudokuPuzzle).grid.map((r) => [...r]) : []
  );

  // Word Search state
  const [wordListText, setWordListText] = useState(
    page.type === 'wordsearch' ? (page.data as WordSearchPuzzle).words.join(', ') : ''
  );
  const [gridSize, setGridSize] = useState(
    page.type === 'wordsearch' ? (page.data as WordSearchPuzzle).gridSize : 13
  );

  // Maze state
  const [mazeSize, setMazeSize] = useState(
    page.type === 'maze' ? (page.data as MazePuzzle).width : 23
  );

  // Coloring state
  const [coloringStyle, setColoringStyle] = useState<MandalaPuzzle['style']>(
    page.type === 'coloring' ? (page.data as MandalaPuzzle).style : 'botanical-leaf'
  );
  const [coloringPromptText, setColoringPromptText] = useState(
    page.type === 'coloring' ? (page.data as MandalaPuzzle).promptDescription || '' : ''
  );

  // Re-generate current Sudoku with selected difficulty
  const handleRegenerateSudoku = () => {
    if (page.type !== 'sudoku') return;
    const sdk = page.data as SudokuPuzzle;
    const tier: 1 | 2 | 3 = sudokuDifficulty === 'Easy' ? 1 : sudokuDifficulty === 'Medium' ? 2 : 3;
    const newSudoku = generateSudoku(
      sdk.puzzleNumber,
      Date.now(),
      sudokuDifficulty
    );
    setSudokuGrid(newSudoku.grid);
    onSavePage({
      ...page,
      difficulty: sudokuDifficulty,
      difficultyTier: tier,
      data: {
        ...newSudoku,
        title: customTitle,
        mindfulPrompt,
      },
    });
  };

  // Re-generate current Word Search with updated words
  const handleRegenerateWordSearch = () => {
    if (page.type !== 'wordsearch') return;
    const ws = page.data as WordSearchPuzzle;
    const rawWords = wordListText
      .split(/[,\n]/)
      .map((w: string) => w.trim())
      .filter((w: string) => w.length >= 3);

    const updated = generateWordSearch(
      ws.puzzleNumber,
      ws.subtheme,
      rawWords.length > 0 ? rawWords : ws.words,
      gridSize,
      Date.now(),
      mindfulPrompt
    );

    onSavePage({
      ...page,
      data: {
        ...updated,
        title: customTitle,
        mindfulPrompt,
      },
    });
    onClose();
  };

  // Re-generate current Maze with updated size
  const handleRegenerateMaze = () => {
    if (page.type !== 'maze') return;
    const mz = page.data as MazePuzzle;
    const updated = generateMaze(
      mz.puzzleNumber,
      mazeSize,
      mazeSize,
      Date.now(),
      mindfulPrompt
    );
    onSavePage({
      ...page,
      data: {
        ...updated,
        title: customTitle,
        mindfulPrompt,
      },
    });
    onClose();
  };

  // Save changes
  const handleSave = () => {
    if (page.type === 'sudoku') {
      const tier: 1 | 2 | 3 = sudokuDifficulty === 'Easy' ? 1 : sudokuDifficulty === 'Medium' ? 2 : 3;
      const sdk = page.data as SudokuPuzzle;
      onSavePage({
        ...page,
        difficulty: sudokuDifficulty,
        difficultyTier: tier,
        data: {
          ...sdk,
          title: customTitle,
          mindfulPrompt,
          difficulty: sudokuDifficulty,
          difficultyTier: tier,
          grid: sudokuGrid,
        },
      });
    } else if (page.type === 'wordsearch') {
      handleRegenerateWordSearch();
      return;
    } else if (page.type === 'maze') {
      const mz = page.data as MazePuzzle;
      onSavePage({
        ...page,
        data: {
          ...mz,
          title: customTitle,
          mindfulPrompt,
        },
      });
    } else if (page.type === 'coloring') {
      const col = page.data as MandalaPuzzle;
      onSavePage({
        ...page,
        data: {
          ...col,
          title: customTitle || col.title,
          mindfulPrompt,
          style: coloringStyle,
          promptDescription: coloringPromptText,
        },
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-600">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Edit Page {page.pageNumber} ({page.type.toUpperCase()})
              </h2>
              <p className="text-xs text-slate-500">
                Customize titles, mindful prompts, and puzzle parameters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Page Title */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Page Header Title
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Mindful Subtitle / Quote */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Mindful Prompt / Subtitle (Helps Anxiety & Focus)
            </label>
            <input
              type="text"
              value={mindfulPrompt}
              onChange={(e) => setMindfulPrompt(e.target.value)}
              placeholder="e.g. Focus gently on the present moment; release the tension..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Sudoku Controls */}
          {page.type === 'sudoku' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="font-semibold text-slate-800 block text-xs">
                Sudoku Difficulty Tier (1/3 Scaling)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['Easy', 'Medium', 'Hard'] as DifficultyLevel[]).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSudokuDifficulty(diff)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                      sudokuDifficulty === diff
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {diff} ({diff === 'Easy' ? '1/3' : diff === 'Medium' ? '2/3' : '3/3'})
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-slate-500">
                  Generate a fresh board with targeted clue count
                </span>
                <button
                  type="button"
                  onClick={handleRegenerateSudoku}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  <RotateCcw size={12} />
                  Re-roll Puzzle
                </button>
              </div>
            </div>
          )}

          {/* Word Search Controls */}
          {page.type === 'wordsearch' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 text-xs">
                  Words to Find (Separated by comma or new lines)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {wordListText.split(/[,\n]/).filter((w: string) => w.trim()).length} words
                </span>
              </div>
              <textarea
                rows={3}
                value={wordListText}
                onChange={(e) => setWordListText(e.target.value)}
                placeholder="CALM, SERENE, BREATHE, TRANQUIL, STILLNESS, PEACE, HARMONY"
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600">Grid Size</span>
                <div className="flex gap-1.5">
                  {[12, 13, 14].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setGridSize(sz)}
                      className={`px-2.5 py-1 text-xs rounded-lg border font-mono ${
                        gridSize === sz
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {sz}x{sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Maze Controls */}
          {page.type === 'maze' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="font-semibold text-slate-800 block text-xs">
                Maze Complexity Grid Size
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Relaxing', size: 19 },
                  { label: 'Balanced', size: 23 },
                  { label: 'Intricate', size: 27 },
                ].map((item) => (
                  <button
                    key={item.size}
                    type="button"
                    onClick={() => setMazeSize(item.size)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                      mazeSize === item.size
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label} ({item.size}x{item.size})
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleRegenerateMaze}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw size={12} />
                  Re-carve Maze
                </button>
              </div>
            </div>
          )}

          {/* Coloring Art Controls */}
          {page.type === 'coloring' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="font-semibold text-slate-800 block text-xs">
                Vector Motif Style
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'botanical-leaf', label: 'Botanical Leaf' },
                    { id: 'zen-waves', label: 'Zen Waves' },
                    { id: 'floral-rosette', label: 'Lotus Rosette' },
                    { id: 'sacred-geometry', label: 'Sacred Rings' },
                    { id: 'star-burst', label: 'Sunburst' },
                    { id: 'kaleidoscope', label: 'Kaleidoscope' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setColoringStyle(st.id)}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border text-center truncate ${
                      coloringStyle === st.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  AI Theme Prompt Description
                </label>
                <input
                  type="text"
                  value={coloringPromptText}
                  onChange={(e) => setColoringPromptText(e.target.value)}
                  placeholder="e.g. Symmetrical botanical monstera leaf mandala with clean vector lines"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {onGenerateAiArt && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onGenerateAiArt(page.pageNumber - 1, coloringPromptText)}
                    disabled={isGeneratingArt}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50"
                  >
                    <Sparkles size={13} />
                    {isGeneratingArt ? 'Generating AI Line Art...' : 'Generate Line Art with Gemini'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition"
          >
            <Check size={14} />
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

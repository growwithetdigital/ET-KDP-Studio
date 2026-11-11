import { SudokuPuzzle, SudokuDifficulty } from '../types';

// Deterministic Pseudo-Random Number Generator based on seed
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function isValid(grid: number[][], row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num && i !== col) return false;
    if (grid[i][col] === num && i !== row) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cr = startRow + r;
      const cc = startCol + c;
      if (grid[cr][cc] === num && (cr !== row || cc !== col)) return false;
    }
  }
  return true;
}

function solveSudoku(grid: number[][], countSolutions = false, maxSolutions = 2): number {
  let solutions = 0;

  function backtrack(r: number, c: number): boolean {
    if (r === 9) {
      solutions++;
      return !countSolutions || solutions >= maxSolutions;
    }
    const nextR = c === 8 ? r + 1 : r;
    const nextC = c === 8 ? 0 : c + 1;

    if (grid[r][c] !== 0) {
      return backtrack(nextR, nextC);
    }

    for (let num = 1; num <= 9; num++) {
      if (isValid(grid, r, colCheck(c), num)) {
        grid[r][c] = num;
        if (backtrack(nextR, nextC)) {
          if (!countSolutions) return true;
        }
        grid[r][c] = 0;
      }
    }
    return false;
  }

  function colCheck(c: number) {
    return c;
  }

  backtrack(0, 0);
  return solutions;
}

function fillCompleteBoard(grid: number[][], rng: () => number): boolean {
  function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function fill(r: number, c: number): boolean {
    if (r === 9) return true;
    const nextR = c === 8 ? r + 1 : r;
    const nextC = c === 8 ? 0 : c + 1;

    if (grid[r][c] !== 0) return fill(nextR, nextC);

    const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const num of numbers) {
      if (isValid(grid, r, c, num)) {
        grid[r][c] = num;
        if (fill(nextR, nextC)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  }

  return fill(0, 0);
}

// Generate single Sudoku with guaranteed unique solution and targeted difficulty
export function generateSudoku(puzzleNumber: number, seed: number): SudokuPuzzle {
  const rng = seededRandom(seed + puzzleNumber * 7919);
  const difficulty: SudokuDifficulty =
    puzzleNumber <= 8 ? 'Easy' : puzzleNumber <= 18 ? 'Medium' : 'Hard';

  const cluesTarget = difficulty === 'Easy' ? 40 : difficulty === 'Medium' ? 32 : 28;

  const solution: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillCompleteBoard(solution, rng);

  // Deep clone to create puzzle grid
  const puzzle: number[][] = solution.map((row) => [...row]);

  // Create list of all 81 cell positions and shuffle them
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }

  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  let remainingClues = 81;
  for (const [r, c] of positions) {
    if (remainingClues <= cluesTarget) break;

    const temp = puzzle[r][c];
    puzzle[r][c] = 0;

    // Check if puzzle still has a unique solution
    const testGrid = puzzle.map((row) => [...row]);
    const solutions = solveSudoku(testGrid, true, 2);

    if (solutions !== 1) {
      // Revert if multiple solutions appear
      puzzle[r][c] = temp;
    } else {
      remainingClues--;
    }
  }

  return {
    id: `sudoku-${puzzleNumber}`,
    puzzleNumber,
    difficulty,
    grid: puzzle,
    solution: solution.map((row) => [...row]),
  };
}

// Generate all 25 non-repeating Sudoku puzzles
export function generate25Sudokus(baseSeed = 42): SudokuPuzzle[] {
  const list: SudokuPuzzle[] = [];
  for (let i = 1; i <= 25; i++) {
    list.push(generateSudoku(i, baseSeed + i * 1337));
  }
  return list;
}

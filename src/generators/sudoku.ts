import { SudokuPuzzle, DifficultyLevel, TargetAudience } from '../types';

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function isValid(grid: number[][], row: number, col: number, num: number, size = 9): boolean {
  for (let i = 0; i < size; i++) {
    if (grid[row][i] === num && i !== col) return false;
    if (grid[i][col] === num && i !== row) return false;
  }

  const boxR = size === 4 ? 2 : size === 6 ? 2 : 3;
  const boxC = size === 4 ? 2 : size === 6 ? 3 : 3;
  const startRow = Math.floor(row / boxR) * boxR;
  const startCol = Math.floor(col / boxC) * boxC;

  for (let r = 0; r < boxR; r++) {
    for (let c = 0; c < boxC; c++) {
      const cr = startRow + r;
      const cc = startCol + c;
      if (grid[cr][cc] === num && (cr !== row || cc !== col)) return false;
    }
  }
  return true;
}

function solveSudoku(grid: number[][], size = 9, countSolutions = false, maxSolutions = 2): number {
  let solutions = 0;

  function backtrack(r: number, c: number): boolean {
    if (r === size) {
      solutions++;
      return !countSolutions || solutions >= maxSolutions;
    }
    const nextR = c === size - 1 ? r + 1 : r;
    const nextC = c === size - 1 ? 0 : c + 1;

    if (grid[r][c] !== 0) {
      return backtrack(nextR, nextC);
    }

    for (let num = 1; num <= size; num++) {
      if (isValid(grid, r, c, num, size)) {
        grid[r][c] = num;
        if (backtrack(nextR, nextC)) {
          if (!countSolutions) return true;
        }
        grid[r][c] = 0;
      }
    }
    return false;
  }

  backtrack(0, 0);
  return solutions;
}

function fillCompleteBoard(grid: number[][], size: number, rng: () => number): boolean {
  function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const numbers = Array.from({ length: size }, (_, i) => i + 1);

  function fill(r: number, c: number): boolean {
    if (r === size) return true;
    const nextR = c === size - 1 ? r + 1 : r;
    const nextC = c === size - 1 ? 0 : c + 1;

    if (grid[r][c] !== 0) return fill(nextR, nextC);

    const shuffled = shuffle(numbers);
    for (const num of shuffled) {
      if (isValid(grid, r, c, num, size)) {
        grid[r][c] = num;
        if (fill(nextR, nextC)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  }

  return fill(0, 0);
}

const MINDFUL_PROMPTS = [
  'Focus gently on the present moment as you place each number.',
  'Breathe in calm clarity; breathe out distraction.',
  'Observe patterns without judgment; one step at a time.',
  'There is no hurry. Enjoy the quiet rhythm of logic.',
  'A clear mind unlocks each row with effortless ease.',
  'Release tension in your shoulders as you find your flow.',
  'Notice the stillness between each decision.',
  'Large print clarity allows the eyes to rest and the mind to focus.',
];

export function generateSudoku(
  puzzleNumber: number,
  seed: number,
  customDifficulty?: DifficultyLevel,
  audience: TargetAudience = 'adults',
  totalCount = 25
): SudokuPuzzle {
  const rng = seededRandom(seed + puzzleNumber * 7919);

  // 1/3 progression: 1st third Easy, 2nd third Medium, 3rd third Hard
  const third = Math.ceil(totalCount / 3);
  const difficulty: DifficultyLevel =
    customDifficulty ||
    (puzzleNumber <= third ? 'Easy' : puzzleNumber <= third * 2 ? 'Medium' : 'Hard');

  const tier: 1 | 2 | 3 = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3;

  // Grid size: 4 for toddlers, 6 for kids, 9 for adults/seniors
  const size: 4 | 6 | 9 = audience === 'toddlers' ? 4 : audience === 'kids' ? 6 : 9;

  const cluesTarget =
    size === 4
      ? (difficulty === 'Easy' ? 10 : 8)
      : size === 6
      ? (difficulty === 'Easy' ? 22 : difficulty === 'Medium' ? 18 : 14)
      : (difficulty === 'Easy' ? 42 : difficulty === 'Medium' ? 34 : 28);

  const solution: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
  fillCompleteBoard(solution, size, rng);

  const puzzle: number[][] = solution.map((row) => [...row]);

  const positions: [number, number][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      positions.push([r, c]);
    }
  }

  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  let remainingClues = size * size;
  for (const [r, c] of positions) {
    if (remainingClues <= cluesTarget) break;

    const temp = puzzle[r][c];
    puzzle[r][c] = 0;

    const testGrid = puzzle.map((row) => [...row]);
    const solutions = solveSudoku(testGrid, size, true, 2);

    if (solutions !== 1) {
      puzzle[r][c] = temp;
    } else {
      remainingClues--;
    }
  }

  const prompt =
    audience === 'seniors'
      ? 'Large Print Brain Training: Restful clarity with zero eye strain.'
      : MINDFUL_PROMPTS[(puzzleNumber - 1) % MINDFUL_PROMPTS.length];

  return {
    id: `sudoku-${puzzleNumber}`,
    puzzleNumber,
    title:
      audience === 'seniors'
        ? `Large Print Sudoku #${puzzleNumber}`
        : audience === 'kids' || audience === 'toddlers'
        ? `Junior Sudoku #${puzzleNumber}`
        : `Sudoku #${puzzleNumber}`,
    mindfulPrompt: prompt,
    difficulty,
    difficultyTier: tier,
    gridSize: size,
    grid: puzzle,
    solution: solution.map((row) => [...row]),
  };
}

export function generateSudokuSection(
  count = 25,
  baseSeed = 42,
  audience: TargetAudience = 'adults'
): SudokuPuzzle[] {
  const list: SudokuPuzzle[] = [];
  for (let i = 1; i <= count; i++) {
    list.push(generateSudoku(i, baseSeed + i * 1337, undefined, audience, count));
  }
  return list;
}

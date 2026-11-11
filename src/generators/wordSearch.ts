import { WordSearchPuzzle, WordSearchPlacement, DifficultyLevel, TargetAudience } from '../types';

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// 8 Directions: [dr, dc]
const ALL_DIRECTIONS: [number, number][] = [
  [0, 1],   // L -> R
  [1, 0],   // T -> B
  [1, 1],   // Diag Down-Right
  [-1, 1],  // Diag Up-Right
  [0, -1],  // R -> L
  [-1, 0],  // B -> T
  [1, -1],  // Diag Down-Left
  [-1, -1], // Diag Up-Left
];

const MEDIUM_DIRECTIONS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [-1, 1],
  [1, -1],
];

const EASY_DIRECTIONS: [number, number][] = [
  [0, 1],
  [1, 0],
];

const WORD_PROMPTS = [
  'Let your gaze soften as you trace the hidden harmony of letters.',
  'Unwind each thought; scan with calm, patient curiosity.',
  'Finding each word is a small moment of quiet accomplishment.',
  'Notice how effortlessly your mind connects the scattered letters.',
  'Breathe gently. There is satisfaction in discovery.',
  'Large-print letters bring effortless clarity and comfortable focus.',
];

export function generateWordSearch(
  puzzleNumber: number,
  subtheme: string,
  rawWords: string[],
  customGridSize?: number,
  seed = 100,
  customPrompt?: string,
  audience: TargetAudience = 'adults',
  totalCount = 25,
  customDifficulty?: DifficultyLevel
): WordSearchPuzzle {
  const rng = seededRandom(seed + puzzleNumber * 9871);

  // 1/3 progression: 1st third Easy, 2nd third Medium, 3rd third Hard
  const third = Math.ceil(totalCount / 3);
  const difficulty: DifficultyLevel =
    customDifficulty ||
    (puzzleNumber <= third ? 'Easy' : puzzleNumber <= third * 2 ? 'Medium' : 'Hard');

  const tier: 1 | 2 | 3 = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3;

  const isKids = audience === 'kids' || audience === 'toddlers';
  const gridSize =
    customGridSize ||
    (isKids ? (difficulty === 'Easy' ? 8 : 10) : difficulty === 'Easy' ? 11 : difficulty === 'Medium' ? 13 : 14);

  const maxWords =
    isKids ? (difficulty === 'Easy' ? 6 : 8) : difficulty === 'Easy' ? 8 : difficulty === 'Medium' ? 10 : 12;

  const directions =
    isKids || difficulty === 'Easy'
      ? EASY_DIRECTIONS
      : difficulty === 'Medium'
      ? MEDIUM_DIRECTIONS
      : ALL_DIRECTIONS;

  const cleanWords = Array.from(
    new Set(
      rawWords
        .map((w) => w.toUpperCase().replace(/[^A-Z]/g, ''))
        .filter((w) => w.length >= 3 && w.length <= gridSize)
    )
  ).slice(0, maxWords);

  const grid: string[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(' ')
  );

  const placements: WordSearchPlacement[] = [];
  const sortedWords = [...cleanWords].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 300;

    while (!placed && attempts < maxAttempts) {
      attempts++;
      const dirIndex = Math.floor(rng() * directions.length);
      const [dr, dc] = directions[dirIndex];

      const minRow = dr === -1 ? word.length - 1 : 0;
      const maxRow = dr === 1 ? gridSize - word.length : gridSize - 1;
      const minCol = dc === -1 ? word.length - 1 : 0;
      const maxCol = dc === 1 ? gridSize - word.length : gridSize - 1;

      if (minRow > maxRow || minCol > maxCol) continue;

      const startRow = Math.floor(rng() * (maxRow - minRow + 1)) + minRow;
      const startCol = Math.floor(rng() * (maxCol - minCol + 1)) + minCol;

      let canPlace = true;
      const cells: [number, number][] = [];

      for (let i = 0; i < word.length; i++) {
        const r = startRow + dr * i;
        const c = startCol + dc * i;
        const char = word[i];

        if (grid[r][c] !== ' ' && grid[r][c] !== char) {
          canPlace = false;
          break;
        }
        cells.push([r, c]);
      }

      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const [r, c] = cells[i];
          grid[r][c] = word[i];
        }
        placements.push({
          word,
          start: [startRow, startCol],
          end: [startRow + dr * (word.length - 1), startCol + dc * (word.length - 1)],
          direction: [dr, dc],
          cells,
        });
        placed = true;
      }
    }
  }

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === ' ') {
        grid[r][c] = ALPHABET[Math.floor(rng() * ALPHABET.length)];
      }
    }
  }

  const prompt =
    customPrompt ||
    (audience === 'seniors'
      ? 'Large Print Word Search: Extra bold letters for comfortable reading.'
      : isKids
      ? 'Can you spot all the hidden words? Look across and down!'
      : WORD_PROMPTS[(puzzleNumber - 1) % WORD_PROMPTS.length]);

  return {
    id: `wordsearch-${puzzleNumber}`,
    puzzleNumber,
    title:
      audience === 'seniors'
        ? `Large Print Search: ${subtheme}`
        : isKids
        ? `Fun Search: ${subtheme}`
        : `Word Search: ${subtheme}`,
    subtheme,
    mindfulPrompt: prompt,
    difficulty,
    difficultyTier: tier,
    gridSize,
    grid,
    words: placements.map((p) => p.word),
    placements,
    isLargePrint: audience === 'seniors',
  };
}

export function generateWordSearchSection(
  count = 25,
  vocabularies: { title: string; words: string[]; prompt?: string }[],
  baseSeed = 200,
  audience: TargetAudience = 'adults'
): WordSearchPuzzle[] {
  const puzzles: WordSearchPuzzle[] = [];
  for (let i = 1; i <= count; i++) {
    const vocab = vocabularies[(i - 1) % vocabularies.length] || {
      title: `Search #${i}`,
      words: ['CALM', 'SERENE', 'PEACE', 'BREATHE', 'HARMONY', 'STILLNESS'],
    };
    puzzles.push(
      generateWordSearch(
        i,
        vocab.title,
        vocab.words,
        undefined,
        baseSeed + i * 4231,
        vocab.prompt,
        audience,
        count
      )
    );
  }
  return puzzles;
}

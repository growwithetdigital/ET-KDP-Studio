import { WordSearchPuzzle, WordSearchPlacement } from '../types';

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// 8 Directions: [rowDelta, colDelta]
const DIRECTIONS: [number, number][] = [
  [0, 1],   // Left to Right
  [1, 0],   // Top to Bottom
  [1, 1],   // Diagonal Down-Right
  [-1, 1],  // Diagonal Up-Right
  [0, -1],  // Right to Left
  [-1, 0],  // Bottom to Top
  [1, -1],  // Diagonal Down-Left
  [-1, -1], // Diagonal Up-Left
];

export function generateWordSearch(
  puzzleNumber: number,
  subtheme: string,
  rawWords: string[],
  gridSize = 13,
  seed = 100
): WordSearchPuzzle {
  const rng = seededRandom(seed + puzzleNumber * 9871);

  // Normalize words: uppercase, remove non-alphas, filter length
  const cleanWords = Array.from(
    new Set(
      rawWords
        .map((w) => w.toUpperCase().replace(/[^A-Z]/g, ''))
        .filter((w) => w.length >= 3 && w.length <= gridSize)
    )
  ).slice(0, 12);

  // Initialize empty grid with spaces
  const grid: string[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(' ')
  );

  const placements: WordSearchPlacement[] = [];

  // Sort words longest to shortest for better placement success
  const sortedWords = [...cleanWords].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 200;

    while (!placed && attempts < maxAttempts) {
      attempts++;
      // Pick random direction (biased slightly towards forward/down/diag-down for readability)
      const dirIndex = Math.floor(rng() * DIRECTIONS.length);
      const [dr, dc] = DIRECTIONS[dirIndex];

      // Calculate valid start bounds
      const minRow = dr === -1 ? word.length - 1 : 0;
      const maxRow = dr === 1 ? gridSize - word.length : gridSize - 1;
      const minCol = dc === -1 ? word.length - 1 : 0;
      const maxCol = dc === 1 ? gridSize - word.length : gridSize - 1;

      if (minRow > maxRow || minCol > maxCol) continue;

      const startRow = Math.floor(rng() * (maxRow - minRow + 1)) + minRow;
      const startCol = Math.floor(rng() * (maxCol - minCol + 1)) + minCol;

      // Check collision
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

  // Fill empty spaces with random uppercase A-Z
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === ' ') {
        grid[r][c] = ALPHABET[Math.floor(rng() * ALPHABET.length)];
      }
    }
  }

  return {
    id: `wordsearch-${puzzleNumber}`,
    puzzleNumber,
    subtheme,
    gridSize,
    grid,
    words: placements.map((p) => p.word),
    placements,
  };
}

export function generate25WordSearches(
  vocabularies: { title: string; words: string[] }[],
  baseSeed = 200
): WordSearchPuzzle[] {
  const puzzles: WordSearchPuzzle[] = [];
  for (let i = 1; i <= 25; i++) {
    const vocab = vocabularies[(i - 1) % vocabularies.length] || {
      title: `Theme Challenge #${i}`,
      words: ['CHALLENGE', 'PUZZLE', 'SEARCH', 'VICTORY', 'QUEST', 'HERO', 'LEGEND', 'MASTER'],
    };
    puzzles.push(
      generateWordSearch(
        i,
        vocab.title,
        vocab.words,
        13, // 13x13 is optimal for 8.5x11 page readability in KDP
        baseSeed + i * 4231
      )
    );
  }
  return puzzles;
}

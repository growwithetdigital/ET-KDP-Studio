import { MazePuzzle, DifficultyLevel, TargetAudience } from '../types';

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const MAZE_PROMPTS = [
  'Every turn is a lesson in patience. Follow the path with an easy breath.',
  'Dead ends are not failures; they are gentle invitations to redirect.',
  'Let your pen trace slowly, releasing hurried thoughts with every curve.',
  'Trust that every labyrinth has an opening waiting for you.',
  'Stay centered in the present passage, unconcerned with the finish until it arrives.',
];

export function generateMaze(
  puzzleNumber: number,
  customWidth?: number,
  customHeight?: number,
  seed = 300,
  customPrompt?: string,
  audience: TargetAudience = 'adults',
  totalCount = 25,
  customDifficulty?: DifficultyLevel
): MazePuzzle {
  const rng = seededRandom(seed + puzzleNumber * 6113);

  // 1/3 progression: 1st third Easy, 2nd third Medium, 3rd third Hard
  const third = Math.ceil(totalCount / 3);
  const difficulty: DifficultyLevel =
    customDifficulty ||
    (puzzleNumber <= third ? 'Easy' : puzzleNumber <= third * 2 ? 'Medium' : 'Hard');

  const tier: 1 | 2 | 3 = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3;

  const isKids = audience === 'kids' || audience === 'toddlers';
  const defaultSize = isKids
    ? (difficulty === 'Easy' ? 11 : difficulty === 'Medium' ? 15 : 19)
    : (difficulty === 'Easy' ? 17 : difficulty === 'Medium' ? 23 : 29);

  const gridWidth = customWidth || defaultSize;
  const gridHeight = customHeight || defaultSize;

  const grid: number[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(1)
  );

  const cellHeight = Math.floor((gridHeight - 1) / 2);
  const cellWidth = Math.floor((gridWidth - 1) / 2);

  const visited: boolean[][] = Array.from({ length: cellHeight }, () =>
    Array(cellWidth).fill(false)
  );

  const stack: [number, number][] = [];
  const startCell: [number, number] = [0, 0];
  visited[0][0] = true;
  grid[1][1] = 0;
  stack.push(startCell);

  const neighbors: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  while (stack.length > 0) {
    const [cr, cc] = stack[stack.length - 1];

    const validNeighbors: [number, number, number, number][] = [];
    for (const [dr, dc] of neighbors) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr >= 0 && nr < cellHeight && nc >= 0 && nc < cellWidth && !visited[nr][nc]) {
        validNeighbors.push([nr, nc, dr, dc]);
      }
    }

    if (validNeighbors.length > 0) {
      const idx = Math.floor(rng() * validNeighbors.length);
      const [nr, nc, dr, dc] = validNeighbors[idx];

      const wallR = 2 * cr + 1 + dr;
      const wallC = 2 * cc + 1 + dc;
      const targetR = 2 * nr + 1;
      const targetC = 2 * nc + 1;

      grid[wallR][wallC] = 0;
      grid[targetR][targetC] = 0;

      visited[nr][nc] = true;
      stack.push([nr, nc]);
    } else {
      stack.pop();
    }
  }

  const startPos: [number, number] = [0, 1];
  const finishPos: [number, number] = [gridHeight - 1, gridWidth - 2];
  grid[0][1] = 0;
  grid[gridHeight - 1][gridWidth - 2] = 0;

  // BFS solution
  const queue: [number, number][] = [startPos];
  const parentMap = new Map<string, [number, number]>();
  const seen = new Set<string>();
  seen.add(`${startPos[0]},${startPos[1]}`);

  let found = false;
  const dirs: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  while (queue.length > 0 && !found) {
    const [currR, currC] = queue.shift()!;

    if (currR === finishPos[0] && currC === finishPos[1]) {
      found = true;
      break;
    }

    for (const [dr, dc] of dirs) {
      const nr = currR + dr;
      const nc = currC + dc;
      const key = `${nr},${nc}`;

      if (
        nr >= 0 &&
        nr < gridHeight &&
        nc >= 0 &&
        nc < gridWidth &&
        grid[nr][nc] === 0 &&
        !seen.has(key)
      ) {
        seen.add(key);
        parentMap.set(key, [currR, currC]);
        queue.push([nr, nc]);
      }
    }
  }

  const solutionPath: [number, number][] = [];
  if (found) {
    let curr: [number, number] | undefined = finishPos;
    while (curr) {
      solutionPath.unshift(curr);
      if (curr[0] === startPos[0] && curr[1] === startPos[1]) break;
      curr = parentMap.get(`${curr[0]},${curr[1]}`);
    }
  }

  const prompt =
    customPrompt ||
    (isKids
      ? 'Help navigate through the maze to reach the goal!'
      : MAZE_PROMPTS[(puzzleNumber - 1) % MAZE_PROMPTS.length]);

  return {
    id: `maze-${puzzleNumber}`,
    puzzleNumber,
    title: isKids ? `Kids Maze Challenge #${puzzleNumber}` : `Maze Challenge #${puzzleNumber}`,
    mindfulPrompt: prompt,
    difficulty,
    difficultyTier: tier,
    width: gridWidth,
    height: gridHeight,
    grid,
    start: startPos,
    finish: finishPos,
    solutionPath,
    corridorWidth: isKids || difficulty === 'Easy' ? 'wide' : 'standard',
  };
}

export function generateMazeSection(
  count = 25,
  baseSeed = 500,
  audience: TargetAudience = 'adults'
): MazePuzzle[] {
  const mazes: MazePuzzle[] = [];
  for (let i = 1; i <= count; i++) {
    mazes.push(generateMaze(i, undefined, undefined, baseSeed + i * 8831, undefined, audience, count));
  }
  return mazes;
}

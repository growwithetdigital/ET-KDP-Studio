import { MazePuzzle } from '../types';

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generates a maze using recursive backtracker (DFS) on odd-dimension grid
// 1 = Wall, 0 = Path
export function generateMaze(
  puzzleNumber: number,
  gridWidth = 23,
  gridHeight = 23,
  seed = 300
): MazePuzzle {
  const rng = seededRandom(seed + puzzleNumber * 6113);

  // Initialize all walls
  const grid: number[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(1)
  );

  // Carve passages
  // Passage cells are at odd coordinates (2r+1, 2c+1)
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
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1],  // Right
  ];

  while (stack.length > 0) {
    const [cr, cc] = stack[stack.length - 1];

    // Find unvisited neighbors
    const validNeighbors: [number, number, number, number][] = []; // [nr, nc, dr, dc]
    for (const [dr, dc] of neighbors) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr >= 0 && nr < cellHeight && nc >= 0 && nc < cellWidth && !visited[nr][nc]) {
        validNeighbors.push([nr, nc, dr, dc]);
      }
    }

    if (validNeighbors.length > 0) {
      // Pick random neighbor
      const idx = Math.floor(rng() * validNeighbors.length);
      const [nr, nc, dr, dc] = validNeighbors[idx];

      // Remove wall between (2*cr+1, 2*cc+1) and (2*nr+1, 2*nc+1)
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

  // Create Start and Finish doorways
  const startPos: [number, number] = [0, 1];
  const finishPos: [number, number] = [gridHeight - 1, gridWidth - 2];
  grid[0][1] = 0; // Entry
  grid[gridHeight - 1][gridWidth - 2] = 0; // Exit

  // Solve the maze using BFS to find shortest path from start to finish
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

  // Reconstruct solution path
  const solutionPath: [number, number][] = [];
  if (found) {
    let curr: [number, number] | undefined = finishPos;
    while (curr) {
      solutionPath.unshift(curr);
      if (curr[0] === startPos[0] && curr[1] === startPos[1]) break;
      curr = parentMap.get(`${curr[0]},${curr[1]}`);
    }
  }

  return {
    id: `maze-${puzzleNumber}`,
    puzzleNumber,
    width: gridWidth,
    height: gridHeight,
    grid,
    start: startPos,
    finish: finishPos,
    solutionPath,
  };
}

export function generate25Mazes(baseSeed = 500): MazePuzzle[] {
  const mazes: MazePuzzle[] = [];
  for (let i = 1; i <= 25; i++) {
    // Dynamic difficulty: size increases slightly from 21x21 to 25x25
    const size = i <= 8 ? 21 : i <= 18 ? 23 : 25;
    mazes.push(generateMaze(i, size, size, baseSeed + i * 8831));
  }
  return mazes;
}

import type { Position } from "./types";

/**
 * Creates an initial grid setup with a predator, prey, and obstacles.
 */
export function createInitialGrid(gridSize: number, obstacleDensity: number, numPrey: number) {
  const predatorStart = { x: 0, y: Math.floor(gridSize / 2) };
  const preyStart: Position[] = [];
  const obstacles: Position[] = [];
  const occupied = new Set<string>([`${predatorStart.x},${predatorStart.y}`]);

  // Place prey
  for (let i = 0; i < numPrey; i++) {
    let pos: Position;
    do {
      pos = {
        x: Math.floor(Math.random() * (gridSize / 2)) + Math.floor(gridSize / 2),
        y: Math.floor(Math.random() * gridSize),
      };
    } while (occupied.has(`${pos.x},${pos.y}`));
    preyStart.push(pos);
    occupied.add(`${pos.x},${pos.y}`);
  }

  // Place obstacles
  const numObstacles = Math.floor(gridSize * gridSize * obstacleDensity);
  for (let i = 0; i < numObstacles; i++) {
    let pos: Position;
    do {
      pos = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
    } while (occupied.has(`${pos.x},${pos.y}`));
    obstacles.push(pos);
    occupied.add(`${pos.x},${pos.y}`);
  }

  return { predatorStart, preyStart, obstacles };
}

/**
 * Checks if a position is valid and walkable.
 */
function isWalkable(pos: Position, gridSize: number, obstacles: Position[]): boolean {
  return (
    pos.x >= 0 &&
    pos.x < gridSize &&
    pos.y >= 0 &&
    pos.y < gridSize &&
    !obstacles.some(o => o.x === pos.x && o.y === pos.y)
  );
}

/**
 * Gets valid neighbor positions.
 */
function getNeighbors(pos: Position, gridSize: number, obstacles: Position[]): Position[] {
  const neighbors: Position[] = [];
  const directions = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];

  for (const dir of directions) {
    const neighborPos = { x: pos.x + dir.x, y: pos.y + dir.y };
    if (isWalkable(neighborPos, gridSize, obstacles)) {
      neighbors.push(neighborPos);
    }
  }
  return neighbors;
}

/**
 * Gets a random valid move for an agent.
 */
export function getRandomMove(pos: Position, gridSize: number, occupied: Position[]): Position {
    const directions = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
    const validMoves: Position[] = [];
  
    for (const dir of directions) {
      const newPos = { x: pos.x + dir.x, y: pos.y + dir.y };
      if (
        newPos.x >= 0 && newPos.x < gridSize &&
        newPos.y >= 0 && newPos.y < gridSize &&
        !occupied.some(o => o.x === newPos.x && o.y === newPos.y)
      ) {
        validMoves.push(newPos);
      }
    }
  
    if (validMoves.length > 0) {
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
    return pos; // Stay in place if no moves are possible
}


/**
 * Reconstructs the path from the cameFrom map.
 */
function reconstructPath(cameFrom: Map<string, Position>, current: Position): Position[] {
    const path = [current];
    let currentKey = `${current.x},${current.y}`;
    while (cameFrom.has(currentKey)) {
      current = cameFrom.get(currentKey)!;
      path.unshift(current);
      currentKey = `${current.x},${current.y}`;
    }
    return path.slice(1); // Remove starting position
}

/**
 * Breadth-First Search (BFS) algorithm to find the shortest path.
 */
export function findPathBFS(start: Position, end: Position, gridSize: number, obstacles: Position[]): Position[] {
  const queue = [start];
  const cameFrom = new Map<string, Position>();
  const visited = new Set<string>([`${start.x},${start.y}`]);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.x === end.x && current.y === end.y) {
      return reconstructPath(cameFrom, current);
    }

    const neighbors = getNeighbors(current, gridSize, obstacles);
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        cameFrom.set(neighborKey, current);
        queue.push(neighbor);
      }
    }
  }

  return []; // No path found
}


/**
 * A* search algorithm to find the most efficient path.
 */
export function findPathAStar(start: Position, end: Position, gridSize: number, obstacles: Position[]): Position[] {
    const openSet = [start];
    const cameFrom = new Map<string, Position>();
    
    const gScore = new Map<string, number>();
    gScore.set(`${start.x},${start.y}`, 0);

    const fScore = new Map<string, number>();
    const heuristic = (p1: Position, p2: Position) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
    fScore.set(`${start.x},${start.y}`, heuristic(start, end));

    while (openSet.length > 0) {
        openSet.sort((a, b) => (fScore.get(`${a.x},${a.y}`) ?? Infinity) - (fScore.get(`${b.x},${b.y}`) ?? Infinity));
        const current = openSet.shift()!;
        const currentKey = `${current.x},${current.y}`;

        if (current.x === end.x && current.y === end.y) {
            return reconstructPath(cameFrom, current);
        }

        const neighbors = getNeighbors(current, gridSize, obstacles);
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.x},${neighbor.y}`;
            const tentativeGScore = (gScore.get(currentKey) ?? Infinity) + 1;

            if (tentativeGScore < (gScore.get(neighborKey) ?? Infinity)) {
                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, end));
                if (!openSet.some(p => p.x === neighbor.x && p.y === neighbor.y)) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    return []; // No path found
}

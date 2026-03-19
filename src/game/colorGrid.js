import { mix } from "chroma-js";

/**
 * Generuje siatkę kolorów przez interpolację bilinearną między 4 narożnikami.
 * @param {number} cols - liczba kolumn
 * @param {number} rows - liczba wierszy
 * @param {string} topLeft - kolor hex, np. "#CBD9FF"
 * @param {string} topRight
 * @param {string} bottomLeft
 * @param {string} bottomRight
 * @returns {string[][]} - dwuwymiarowa tablica kolorów hex
 */
export function generateColorGrid(
  cols,
  rows,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
) {
  const grid = [];

  for (let row = 0; row < rows; row++) {
    const rowArr = [];
    const t = rows > 1 ? row / (rows - 1) : 0; // 0.0 (góra) → 1.0 (dół)

    for (let col = 0; col < cols; col++) {
      const s = cols > 1 ? col / (cols - 1) : 0; // 0.0 (lewo) → 1.0 (prawo)

      // Interpolacja pozioma na górze i na dole
      const top = mix(topLeft, topRight, s, "lab").hex();
      const bottom = mix(bottomLeft, bottomRight, s, "lab").hex();

      // Interpolacja pionowa między górą a dołem
      const color = mix(top, bottom, t, "lab").hex();
      rowArr.push(color);
    }

    grid.push(rowArr);
  }

  return grid;
}

/**
 * Zamienia siatkę 2D na płaską tablicę kafelków z pozycjami.
 * @returns {{ id: string, color: string, correctRow: number, correctCol: number }[]}
 */
export function gridToTiles(grid) {
  const tiles = [];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      tiles.push({
        id: `${row}-${col}`,
        color: grid[row][col],
        correctRow: row,
        correctCol: col,
      });
    }
  }
  return tiles;
}

/**
 * Tasuje kafelki, zostawiając narożniki na miejscu.
 */
export function shuffleTiles(tiles, cols, rows) {
  const cornerIds = new Set([
    `0-0`,
    `0-${cols - 1}`,
    `${rows - 1}-0`,
    `${rows - 1}-${cols - 1}`,
  ]);

  const movable = tiles.filter((t) => !cornerIds.has(t.id));

  // Fisher-Yates shuffle
  for (let i = movable.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [movable[i], movable[j]] = [movable[j], movable[i]];
  }

  // Łączymy z powrotem w oryginalnej kolejności pozycji
  const shuffled = [...tiles];
  let mi = 0;
  for (let i = 0; i < shuffled.length; i++) {
    if (!cornerIds.has(shuffled[i].id)) {
      shuffled[i] = { ...movable[mi], id: shuffled[i].id };
      mi++;
    }
  }

  return shuffled;
}

/**
 * Sprawdza czy plansza jest ułożona (każdy kafelek na właściwej pozycji).
 */
export function isSolved(tiles, cols) {
  return tiles.every((tile, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    return tile.correctRow === row && tile.correctCol === col;
  });
}
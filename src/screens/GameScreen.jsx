import { useState, useEffect } from 'react';
import { generateColorGrid, gridToTiles, shuffleTiles, isSolved } from '../game/colorGrid';
import { saveGameState, loadGameState, clearGameState } from '../game/gameState';
import Tile from '../components/Tile';

const COLORS = {
  background: '#CBD9FF',
  hunter: '#3F6048',
};

export default function GameScreen({ config, onNewGame }) {
  const { cols, rows, topLeft, topRight, bottomLeft, bottomRight } = config;

  const initialTiles = () => {
    const saved = loadGameState();
    if (
      saved &&
      saved.cols === cols &&
      saved.rows === rows &&
      saved.topLeft === topLeft &&
      saved.topRight === topRight &&
      saved.bottomLeft === bottomLeft &&
      saved.bottomRight === bottomRight
    ) {
      return saved.tiles;
    }
    const grid = generateColorGrid(cols, rows, topLeft, topRight, bottomLeft, bottomRight);
    return shuffleTiles(gridToTiles(grid), cols, rows);
  };

  const [tiles, setTiles]       = useState(initialTiles);
  const [selected, setSelected] = useState(null);
  const [showGrid, setShowGrid] = useState(false);

  const isSolvedNow = tiles.length > 0 && isSolved(tiles, cols);

  // Rozmiar kafelka dopasowany do ekranu
  const padding = 24;
  const tileSize = Math.floor(
    Math.min(
      (window.innerWidth  - padding * 2) / cols,
      (window.innerHeight * 0.85 - padding * 2) / rows
    )
  );

  const isCorner = (index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    return (
      (row === 0 && col === 0) ||
      (row === 0 && col === cols - 1) ||
      (row === rows - 1 && col === 0) ||
      (row === rows - 1 && col === cols - 1)
    );
  };

  // Zapis przy każdej zmianie planszy
  useEffect(() => {
    if (tiles.length === 0) return;
    saveGameState({ cols, rows, topLeft, topRight, bottomLeft, bottomRight, tiles });
  }, [tiles]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTilePress(index) {
    if (selected === null) {
      setSelected(index);
    } else if (selected === index) {
      setSelected(null);
    } else {
      setTiles(prev => {
        const next = [...prev];
        [next[selected], next[index]] = [next[index], next[selected]];
        return next;
      });
      setSelected(null);
    }
  }

  function handleNewGame() {
    clearGameState();
    onNewGame();
  }
// this is what toggles if the "completed" modal is visible or not
  function handleViewGrid(){
    setShowGrid(!showGrid)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: COLORS.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      padding: 24,
    }}>
      {/* Plansza */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${tileSize}px)`,
      }}>
        {tiles.map((tile, index) => (
          <Tile
            key={index}
            color={tile.color}
            size={tileSize}
            selected={selected === index}
            isCorner={isCorner(index)}
            onPress={() => handleTilePress(index)}
          />
        ))}
      </div>

      {/* Przycisk nowej gry */}
      {!isSolvedNow && (
        <button onClick={handleNewGame} style={btnStyle}>
          Nowa gra
        </button>
      )}

      {/* Modal wygranej */}
      {isSolvedNow && !showGrid && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <p style={{ fontSize: 28, fontWeight: 700, color: COLORS.hunter, margin: 0 }}>
              Ułożone! 🎉
            </p>
            <button onClick={handleNewGame} style={btnStyle}>
              Nowa gra
            </button>
          </div>
        </div>
      )}
      {isSolvedNow && (
        <div style={{position: 'fixed', bottom: '10%'}}>
          <button onClick={handleViewGrid} style={btnStyle}>
            Show grid
          </button>
        </div>
      )}

    </div>
  );
}

const btnStyle = {
  backgroundColor: '#3F6048',
  color: '#CBD9FF',
  border: 'none',
  borderRadius: 24,
  padding: '12px 32px',
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
  letterSpacing: 0.5,
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const alwaysOnTop = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalStyle = {
  backgroundColor: '#CBD9FF',
  borderRadius: 20,
  padding: 36,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 20,
};
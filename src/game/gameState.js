const STORAGE_KEY = 'huegame_state';

export function saveGameState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Błąd zapisu stanu gry:', e);
  }
}

export function loadGameState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Błąd odczytu stanu gry:', e);
    return null;
  }
}

export function clearGameState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Błąd czyszczenia stanu gry:', e);
  }
}
import { useState } from 'react';

const COLORS = {
  background: '#CBD9FF',
  hunter: '#3F6048',
  inputBg: '#EEF3FF',
  error: '#B94040',
};

const MIN_TILES = 3;
const MAX_TILES = 14;

function isValidHex(hex) {
  return /^#([0-9A-Fa-f]{6})$/.test(hex);
}

function ColorPicker({ label, value, onChange }) {
  const [input, setInput] = useState(value);
  const [modalOpen, setModalOpen] = useState(false);
  const valid = isValidHex(input);

  function handleChange(text) {
    const normalized = text.startsWith('#') ? text : '#' + text;
    setInput(normalized);
    if (isValidHex(normalized)) onChange(normalized);
  }

  return (
    <div style={styles.pickerRow}>
      <span style={styles.pickerLabel}>{label}</span>
      <div style={styles.pickerRight}>
        {/* Podgląd — klikalny */}
        <div
          onClick={() => setModalOpen(true)}
          style={{
            ...styles.colorPreview,
            backgroundColor: valid ? input : '#cccccc',
            cursor: 'pointer',
          }}
        />
        {/* Pole hex */}
        <input
          type="text"
          value={input}
          onChange={e => handleChange(e.target.value)}
          placeholder="#CBD9FF"
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          style={{
            ...styles.hexInput,
            borderColor: !valid && input.length > 1 ? COLORS.error : 'rgba(63,96,72,0.2)',
          }}
        />
      </div>

      {/* Modal z color pickerem */}
      {modalOpen && (
        <div style={overlayStyle} onClick={() => setModalOpen(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <p style={styles.modalTitle}>{label}</p>
            <NativeColorPicker
              value={valid ? input : '#CBD9FF'}
              onChange={(hex) => {
                setInput(hex);
                onChange(hex);
              }}
            />
            <button
              style={btnStyle}
              onClick={() => setModalOpen(false)}
            >
              Gotowe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Prosty picker HSV zbudowany bez bibliotek
function NativeColorPicker({ value, onChange }) {
  const [h, setH] = useState(() => hexToHsv(value).h);
  const [s, setS] = useState(() => hexToHsv(value).s);
  const [v, setV] = useState(() => hexToHsv(value).v);

  function update(newH, newS, newV) {
    setH(newH); setS(newS); setV(newV);
    onChange(hsvToHex(newH, newS, newV));
  }

  const hueColor = hsvToHex(h, 1, 1);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Podgląd */}
      <div style={{
        height: 48,
        borderRadius: 10,
        backgroundColor: hsvToHex(h, s, v),
        border: '2px solid rgba(63,96,72,0.2)',
      }} />

      {/* Nasycenie / Jasność */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={styles.sliderLabel}>Nasycenie: {Math.round(s * 100)}%</label>
        <input
          type="range" min={0} max={100} value={Math.round(s * 100)}
          onChange={e => update(h, e.target.value / 100, v)}
          style={{ ...sliderStyle, accentColor: hueColor }}
        />
        <label style={styles.sliderLabel}>Jasność: {Math.round(v * 100)}%</label>
        <input
          type="range" min={0} max={100} value={Math.round(v * 100)}
          onChange={e => update(h, s, e.target.value / 100)}
          style={{ ...sliderStyle, accentColor: hueColor }}
        />
        <label style={styles.sliderLabel}>Odcień: {Math.round(h)}°</label>
        <input
          type="range" min={0} max={360} value={Math.round(h)}
          onChange={e => update(Number(e.target.value), s, v)}
          style={{
            ...sliderStyle,
            accentColor: hueColor,
            background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
          }}
        />
      </div>
    </div>
  );
}

// Konwersje kolorów
function hexToHsv(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0, s = max === 0 ? 0 : d / max, v = max;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s, v };
}

function hsvToHex(h, s, v) {
  h = h / 360;
  let r, g, b;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return '#' + [r, g, b].map(x =>
    Math.round(x * 255).toString(16).padStart(2, '0')
  ).join('');
}

export default function SetupScreen({ onStart }) {
  const [gridSize, setGridSize]     = useState(6);
  const [topLeft, setTopLeft]       = useState('#CBD9FF');
  const [topRight, setTopRight]     = useState('#3F6048');
  const [bottomLeft, setBottomLeft] = useState('#3F6048');
  const [bottomRight, setBottomRight] = useState('#CBD9FF');

  const cols = gridSize;
  const rows = Math.round(gridSize * 1.4);

  const allValid =
    isValidHex(topLeft) &&
    isValidHex(topRight) &&
    isValidHex(bottomLeft) &&
    isValidHex(bottomRight);

  function handleStart() {
    if (!allValid) return;
    onStart({ cols, rows, topLeft, topRight, bottomLeft, bottomRight });
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Hue Game</h1>

      {/* Kolory narożników */}
      <div style={styles.section}>
        <p style={styles.sectionTitle}>Kolory narożników</p>
        <ColorPicker label="↖ lewy górny"  value={topLeft}     onChange={setTopLeft} />
        <ColorPicker label="↗ prawy górny" value={topRight}    onChange={setTopRight} />
        <ColorPicker label="↙ lewy dolny"  value={bottomLeft}  onChange={setBottomLeft} />
        <ColorPicker label="↘ prawy dolny" value={bottomRight} onChange={setBottomRight} />
      </div>

      {/* Rozmiar planszy */}
      <div style={styles.section}>
        <p style={styles.sectionTitle}>Rozmiar planszy</p>
        <p style={styles.gridSizeLabel}>{cols} × {rows} kafelków</p>
        <input
          type="range"
          min={MIN_TILES}
          max={MAX_TILES}
          step={1}
          value={gridSize}
          onChange={e => setGridSize(Number(e.target.value))}
          style={{ ...sliderStyle, accentColor: COLORS.hunter, width: '100%' }}
        />
        <div style={styles.sliderLabels}>
          <span style={styles.sliderLabelSmall}>mniej</span>
          <span style={styles.sliderLabelSmall}>więcej</span>
        </div>
      </div>

      {/* Przycisk start */}
      <button
        onClick={handleStart}
        disabled={!allValid}
        style={{ ...btnStyle, opacity: allValid ? 1 : 0.4 }}
      >
        Zagraj
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100dvh',
    backgroundColor: COLORS.background,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 24px',
    gap: 28,
    boxSizing: 'border-box',
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    color: COLORS.hunter,
    letterSpacing: 1,
    margin: 0,
  },
  section: {
    width: '100%',
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: COLORS.hunter,
    textTransform: 'uppercase',
    letterSpacing: 1,
    margin: 0,
  },
  pickerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: '10px 16px',
    position: 'relative',
  },
  pickerLabel: {
    fontSize: 15,
    color: COLORS.hunter,
  },
  pickerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  colorPreview: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: '1px solid rgba(63,96,72,0.2)',
  },
  hexInput: {
    width: 90,
    fontSize: 15,
    color: COLORS.hunter,
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: '4px 8px',
    border: '1px solid rgba(63,96,72,0.2)',
    outline: 'none',
    fontFamily: 'monospace',
  },
  gridSizeLabel: {
    fontSize: 22,
    fontWeight: 600,
    color: COLORS.hunter,
    textAlign: 'center',
    margin: 0,
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  sliderLabel: {
    fontSize: 13,
    color: COLORS.hunter,
    margin: 0,
  },
  sliderLabelSmall: {
    fontSize: 12,
    color: COLORS.hunter,
    opacity: 0.6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: COLORS.hunter,
    textAlign: 'center',
    margin: 0,
  },
};

const sliderStyle = {
  width: '100%',
  height: 4,
  cursor: 'pointer',
};

const btnStyle = {
  backgroundColor: COLORS.hunter,
  color: COLORS.background,
  border: 'none',
  borderRadius: 28,
  padding: '14px 48px',
  fontSize: 18,
  fontWeight: 700,
  cursor: 'pointer',
  letterSpacing: 0.5,
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  zIndex: 100,
};

const modalStyle = {
  backgroundColor: COLORS.background,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: 24,
  width: '100%',
  maxWidth: 480,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  boxSizing: 'border-box',
};
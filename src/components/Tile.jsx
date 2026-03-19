export default function Tile({ color, size, selected, isCorner, onPress }) {
  return (
    <div
      onClick={isCorner ? undefined : onPress}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxSizing: 'border-box',
        cursor: isCorner ? 'default' : 'pointer',
        border: selected ? '2.5px solid white' : '2.5px solid transparent',
        boxShadow: selected ? '0 0 8px rgba(0,0,0,0.4)' : 'none',
        transition: 'border 0.1s, box-shadow 0.1s',
      }}
    />
  );
}
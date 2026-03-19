import { useState } from 'react';
import SetupScreen from './screens/SetupScreen';
import GameScreen from './screens/GameScreen';

export default function App() {
  const [config, setConfig] = useState(null);

  function handleStart(newConfig) {
    setConfig(newConfig);
  }

  function handleNewGame() {
    setConfig(null);
  }

  return config
    ? <GameScreen config={config} onNewGame={handleNewGame} />
    : <SetupScreen onStart={handleStart} />;
}
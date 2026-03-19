import { useState } from 'react';
import SetupScreen from './screens/SetupScreen';
import GameScreen from './screens/GameScreen';

export default function App() {
  const [config, setConfig] = useState(null);

  return config
    ? <GameScreen config={config} onNewGame={() => setConfig(null)} />
    : <SetupScreen onStart={setConfig} />;
}
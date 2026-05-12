import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { Shell } from './components/layout/Shell';
import { PageRouter } from './components/PageRouter';

function App() {
  const initialize = useGameStore((state) => state.initialize);

  useEffect(() => {
    // Start the game with Club ID 1
    initialize(1);
  }, [initialize]);

  return (
    <Shell>
      <PageRouter />
    </Shell>
  );
}

export default App;

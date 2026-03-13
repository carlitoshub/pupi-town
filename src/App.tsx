import { useCallback, useRef, useState, useEffect } from 'react';
import { PhaserGame } from './game/PhaserGame';
import { TopBar } from './components/TopBar/TopBar';
import { Overlay } from './components/Overlay/Overlay';
import { DialogueBox } from './components/DialogueBox/DialogueBox';
import { ClassicView } from './components/ClassicView/ClassicView';
import type { Building } from './data/town.config';
import type Phaser from 'phaser';

function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [activeBuilding, setActiveBuilding] = useState<Building | null>(null);
  const [dialogueLines, setDialogueLines] = useState<string[] | null>(null);
  const [isClassicView, setIsClassicView] = useState(() => {
    return new URLSearchParams(window.location.search).get('classic') === 'true';
  });
  const [, setGameReady] = useState(false);

  const handleBuildingEnter = useCallback((building: Building) => {
    setActiveBuilding(building);
  }, []);

  const handleOverlayClose = useCallback(() => {
    setActiveBuilding(null);
    gameRef.current?.events.emit('overlay-close');
  }, []);

  const handleDialogueOpen = useCallback((lines: string[]) => {
    setDialogueLines(lines);
  }, []);

  const handleDialogueClose = useCallback(() => {
    setDialogueLines(null);
    gameRef.current?.events.emit('dialogue-close');
  }, []);

  const handleClassicToggle = useCallback(() => {
    setIsClassicView((v) => {
      const next = !v;
      const url = new URL(window.location.href);
      if (next) {
        url.searchParams.set('classic', 'true');
      } else {
        url.searchParams.delete('classic');
      }
      window.history.replaceState({}, '', url.toString());
      return next;
    });
  }, []);

  const handleBuildingSelect = useCallback((buildingId: string) => {
    if (isClassicView) {
      setIsClassicView(false);
      const url = new URL(window.location.href);
      url.searchParams.delete('classic');
      window.history.replaceState({}, '', url.toString());
    }
    setTimeout(() => {
      gameRef.current?.events.emit('open-building', buildingId);
    }, 150);
  }, [isClassicView]);

  const handleEnterGame = useCallback(() => {
    setIsClassicView(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('classic');
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Show intro on first visit
  useEffect(() => {
    if (!isClassicView) {
      // Give the game a moment to mount
      const t = setTimeout(() => {
        setGameReady(true);
        const visited = localStorage.getItem('pupi_visited');
        if (!visited) {
          localStorage.setItem('pupi_visited', 'true');
          setDialogueLines([
            'Welcome to PUPI TOWN!',
            'Use Arrow Keys or WASD to explore.',
            'Press SPACE near a building to enter.',
            'Press ESC to close any panel.',
            'Enjoy your visit!',
          ]);
        }
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [isClassicView]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-950 relative">
      <TopBar
        onClassicView={handleClassicToggle}
        onBuildingSelect={handleBuildingSelect}
        isClassicView={isClassicView}
        gameRef={gameRef}
      />

      <div className="w-full h-full" style={{ paddingTop: '44px' }}>
        {isClassicView ? (
          <div className="w-full h-full overflow-y-auto">
            <ClassicView onEnterGame={handleEnterGame} />
          </div>
        ) : (
          <div className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <PhaserGame
              onBuildingEnter={handleBuildingEnter}
              onDialogueOpen={handleDialogueOpen}
              gameRef={gameRef}
            />
          </div>
        )}
      </div>

      {/* Portfolio Overlay */}
      {activeBuilding && (
        <Overlay building={activeBuilding} onClose={handleOverlayClose} />
      )}

      {/* Dialogue Box */}
      {dialogueLines && !activeBuilding && (
        <DialogueBox lines={dialogueLines} onClose={handleDialogueClose} />
      )}

      {/* Mobile warning overlay */}
      <div
        className="md:hidden fixed inset-0 z-[200] flex flex-col items-center justify-center text-center p-8"
        style={{
          background: '#0f0f1a',
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
        <h2 style={{ fontSize: '10px', color: '#FFE040', marginBottom: '12px', lineHeight: 1.6 }}>
          BEST ON DESKTOP
        </h2>
        <p style={{ fontSize: '7px', color: '#aaa', lineHeight: 2, marginBottom: '20px' }}>
          Pupi Town is designed for keyboard navigation. Visit on desktop for the full experience.
        </p>
        <button
          onClick={() => {
            setIsClassicView(true);
            // The mobile overlay will stay but classic view renders underneath
          }}
          style={{
            fontSize: '7px',
            color: '#0f0f1a',
            background: '#FFE040',
            padding: '10px 16px',
            border: '2px solid #B88000',
            boxShadow: '3px 3px 0 #806000',
            cursor: 'pointer',
            fontFamily: '"Press Start 2P", monospace',
          }}
        >
          VIEW CLASSIC PORTFOLIO
        </button>
      </div>
    </div>
  );
}

export default App;

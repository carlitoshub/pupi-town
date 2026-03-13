import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { TownScene } from './scenes/TownScene';
import type { Building } from '../data/town.config';

interface PhaserGameProps {
  onBuildingEnter: (building: Building) => void;
  onDialogueOpen: (lines: string[]) => void;
  gameRef: React.MutableRefObject<Phaser.Game | null>;
}

export function PhaserGame({ onBuildingEnter, onDialogueOpen, gameRef }: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#1A3A10',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [TownScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        pixelArt: true,
        antialias: false,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.on('open-overlay', (building: Building) => {
      onBuildingEnter(building);
    });

    game.events.on('open-dialogue', (lines: string[]) => {
      onDialogueOpen(lines);
    });

    return () => {
      game.events.off('open-overlay');
      game.events.off('open-dialogue');
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

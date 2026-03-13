import { useState } from 'react';
import { BUILDINGS } from '../../data/town.config';
import type Phaser from 'phaser';

interface TopBarProps {
  onClassicView: () => void;
  onBuildingSelect: (buildingId: string) => void;
  isClassicView: boolean;
  gameRef: React.MutableRefObject<Phaser.Game | null>;
}

export function TopBar({ onClassicView, onBuildingSelect, isClassicView }: TopBarProps) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 gap-4"
      style={{
        background: '#0f0f1a',
        borderBottom: '3px solid #FFE040',
        fontFamily: '"Press Start 2P", monospace',
        height: '44px',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={onClassicView.bind(null)}
        style={{ fontSize: '8px', color: '#FFE040', whiteSpace: 'nowrap' }}
        title="Pupi Town — Home"
      >
        <span style={{ fontSize: '14px' }}>👾</span>
        <span className="hidden sm:inline">PUPI TOWN</span>
      </div>

      {/* Controls legend (desktop only) */}
      {!isClassicView && (
        <div
          className="hidden lg:flex items-center gap-3 text-gray-400"
          style={{ fontSize: '6px' }}
        >
          <span>↑↓←→ Move</span>
          <span style={{ color: '#555' }}>·</span>
          <span>SPACE Interact</span>
          <span style={{ color: '#555' }}>·</span>
          <span>ESC Close</span>
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Quick Nav */}
        {!isClassicView && (
          <div className="relative">
            <button
              onClick={() => setNavOpen((v) => !v)}
              className="px-2 py-1 transition-colors"
              style={{
                fontSize: '6px',
                color: '#fff',
                background: '#1a1a2e',
                border: '2px solid #444',
                fontFamily: '"Press Start 2P", monospace',
                cursor: 'pointer',
              }}
              aria-label="Quick Navigation"
            >
              MAP ▾
            </button>

            {navOpen && (
              <div
                className="absolute right-0 top-full mt-1"
                style={{
                  background: '#0f0f1a',
                  border: '3px solid #FFE040',
                  minWidth: '160px',
                  zIndex: 100,
                }}
              >
                {BUILDINGS.map((b) => (
                  <button
                    key={b.id}
                    className="block w-full text-left px-3 py-2 text-white hover:bg-yellow-900 transition-colors"
                    style={{ fontSize: '6px', fontFamily: '"Press Start 2P", monospace', cursor: 'pointer', background: 'none', border: 'none' }}
                    onClick={() => {
                      onBuildingSelect(b.id);
                      setNavOpen(false);
                    }}
                  >
                    › {b.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Classic View toggle */}
        <button
          onClick={onClassicView}
          className="px-2 py-1 transition-all"
          style={{
            fontSize: '6px',
            color: isClassicView ? '#0f0f1a' : '#FFE040',
            background: isClassicView ? '#FFE040' : 'transparent',
            border: '2px solid #FFE040',
            fontFamily: '"Press Start 2P", monospace',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {isClassicView ? 'GAME VIEW' : 'CLASSIC'}
        </button>
      </div>
    </header>
  );
}

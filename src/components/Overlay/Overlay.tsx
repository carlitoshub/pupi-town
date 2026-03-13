import { useEffect, useCallback } from 'react';
import type { Building } from '../../data/town.config';

interface OverlayProps {
  building: Building;
  onClose: () => void;
}

export function Overlay({ building, onClose }: OverlayProps) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleClose]);

  const { content } = building;

  // Parse simple **bold** markdown
  const renderBody = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className="mb-2" style={{ fontSize: '7px', lineHeight: '1.8' }}>
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <span key={j} style={{ color: '#FFE040' }}>
                {part.slice(2, -2)}
              </span>
            ) : (
              part
            )
          )}
        </p>
      );
    });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.85)',
        fontFamily: '"Press Start 2P", monospace',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="relative w-full max-w-3xl mx-4 overflow-y-auto"
        style={{
          background: '#0f0f1a',
          border: '4px solid #FFE040',
          boxShadow: '0 0 0 2px #0f0f1a, 0 0 0 6px #FFE040, 0 20px 60px rgba(0,0,0,0.8)',
          maxHeight: '85vh',
        }}
      >
        {/* Header — location banner */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{
            background: building.roofColor,
            borderBottom: '3px solid #333',
          }}
        >
          <div>
            <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
              PUPI TOWN
            </div>
            <div style={{ fontSize: '10px', color: '#fff', letterSpacing: '1px' }}>
              {building.name}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-yellow-300 transition-colors"
            style={{ fontSize: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
            aria-label="Close overlay"
          >
            [X]
          </button>
        </div>

        <div className="p-6">
          {/* Pixel art placeholder */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div
                style={{
                  width: '128px',
                  height: '128px',
                  background: `linear-gradient(135deg, ${building.roofColor}44, #1a1a2e)`,
                  border: '3px solid',
                  borderColor: building.roofColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  imageRendering: 'pixelated',
                }}
              >
                {building.pixelArtSrc ? (
                  <img
                    src={building.pixelArtSrc}
                    alt={building.name}
                    style={{ imageRendering: 'pixelated', maxWidth: '100%' }}
                  />
                ) : (
                  <span style={{ fontSize: '32px' }}>
                    {building.id === 'about' ? '👾' : building.id === 'stack' ? '⚔️' : '🏠'}
                  </span>
                )}
              </div>
              {/* Tags */}
              {content.tags && content.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1" style={{ maxWidth: '128px' }}>
                  {content.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '5px',
                        background: `${building.roofColor}33`,
                        border: `1px solid ${building.roofColor}`,
                        color: '#fff',
                        padding: '2px 4px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h2
                className="mb-4"
                style={{ fontSize: '11px', color: '#FFE040', lineHeight: '1.6' }}
              >
                {content.title}
              </h2>

              <div className="text-gray-300" style={{ maxWidth: '480px' }}>
                {renderBody(content.body)}
              </div>

              {/* Links */}
              {content.links && content.links.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {content.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block transition-all hover:scale-105"
                      style={{
                        fontSize: '7px',
                        color: '#0f0f1a',
                        background: '#FFE040',
                        padding: '6px 10px',
                        border: '2px solid #FFB800',
                        boxShadow: '2px 2px 0 #B88000',
                        textDecoration: 'none',
                        fontFamily: '"Press Start 2P", monospace',
                      }}
                    >
                      › {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-2 text-center"
          style={{
            borderTop: '2px solid #333',
            fontSize: '6px',
            color: '#555',
          }}
        >
          ESC or [X] to return to Pupi Town
        </div>
      </div>
    </div>
  );
}

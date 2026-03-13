import { BUILDINGS } from '../../data/town.config';

interface ClassicViewProps {
  onEnterGame: () => void;
}

const SKILLS = [
  { name: 'React', icon: '⚛️' },
  { name: 'TypeScript', icon: '🔷' },
  { name: 'Phaser 3', icon: '🎮' },
  { name: 'Node.js', icon: '🟢' },
  { name: 'Python', icon: '🐍' },
  { name: 'Tailwind', icon: '🌊' },
  { name: 'Figma', icon: '🎨' },
  { name: 'Docker', icon: '🐳' },
  { name: 'Git', icon: '📦' },
  { name: 'Pixel Art', icon: '🖼️' },
];

export function ClassicView({ onEnterGame }: ClassicViewProps) {
  const style = { fontFamily: '"Press Start 2P", monospace' };

  const pixelBorder = {
    border: '3px solid #FFE040',
    boxShadow: '3px 3px 0 #B88000',
  };

  return (
    <div
      className="min-h-screen bg-gray-950 text-white overflow-y-auto"
      style={{ ...style, paddingTop: '44px' }}
    >
      {/* Hero */}
      <section
        className="flex flex-col items-center justify-center text-center py-20 px-4"
        style={{ background: 'linear-gradient(180deg, #0f0f1a 0%, #1a2a0f 100%)' }}
      >
        <div
          className="w-24 h-24 flex items-center justify-center mb-6"
          style={{
            ...pixelBorder,
            background: '#1a1a2e',
            fontSize: '48px',
          }}
        >
          👾
        </div>

        <h1 className="mb-2" style={{ fontSize: '20px', color: '#FFE040', lineHeight: 1.4 }}>
          PUPI
        </h1>
        <p className="mb-2" style={{ fontSize: '8px', color: '#aaa' }}>
          Creative Developer
        </p>
        <p className="mb-8 max-w-md" style={{ fontSize: '7px', color: '#888', lineHeight: 2 }}>
          Building experiences at the intersection of design and technology.
        </p>

        <button
          onClick={onEnterGame}
          className="transition-transform hover:scale-105 active:scale-95"
          style={{
            ...pixelBorder,
            fontSize: '8px',
            color: '#0f0f1a',
            background: '#FFE040',
            padding: '12px 20px',
            border: '3px solid #B88000',
            boxShadow: '4px 4px 0 #806000',
            cursor: 'pointer',
            fontFamily: '"Press Start 2P", monospace',
          }}
        >
          ▶ ENTER PUPI TOWN
        </button>
      </section>

      {/* Projects */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <h2
          className="mb-8 text-center"
          style={{ fontSize: '11px', color: '#FFE040', letterSpacing: '2px' }}
        >
          ── PROJECTS ──
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {BUILDINGS.filter((b) => b.id.startsWith('project')).concat(
            BUILDINGS.filter((b) => b.id === 'about')
          ).map((building) => (
            <div
              key={building.id}
              className="p-4"
              style={{
                background: '#0f0f1a',
                ...pixelBorder,
                borderColor: building.roofColor,
                boxShadow: `3px 3px 0 ${building.roofColor}88`,
              }}
            >
              <div
                className="w-full h-24 flex items-center justify-center mb-3"
                style={{
                  background: `${building.roofColor}22`,
                  borderBottom: `2px solid ${building.roofColor}`,
                  fontSize: '36px',
                }}
              >
                {building.id === 'about' ? '👾' : building.id === 'stack' ? '⚔️' : '🏠'}
              </div>
              <h3 style={{ fontSize: '7px', color: '#FFE040', marginBottom: '8px' }}>
                {building.content.title}
              </h3>
              <p
                style={{
                  fontSize: '6px',
                  color: '#aaa',
                  lineHeight: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {building.content.body.replace(/\*\*/g, '').split('\n')[0]}
              </p>
              {building.content.tags && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {building.content.tags.slice(0, 3).map((tag) => (
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
          ))}
        </div>
      </section>

      {/* Skills */}
      <section
        className="py-16 px-4"
        style={{ background: '#0a0a14' }}
      >
        <h2
          className="mb-8 text-center"
          style={{ fontSize: '11px', color: '#FFE040', letterSpacing: '2px' }}
        >
          ── SKILLS ──
        </h2>
        <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
          {SKILLS.map((skill) => (
            <div
              key={skill.name}
              className="flex flex-col items-center gap-1 p-3 transition-transform hover:scale-110"
              style={{
                background: '#0f0f1a',
                border: '2px solid #333',
                minWidth: '64px',
                cursor: 'default',
              }}
            >
              <span style={{ fontSize: '24px' }}>{skill.icon}</span>
              <span style={{ fontSize: '5px', color: '#aaa' }}>{skill.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4 text-center">
        <h2
          className="mb-4"
          style={{ fontSize: '11px', color: '#FFE040', letterSpacing: '2px' }}
        >
          ── CONTACT ──
        </h2>
        <p className="mb-8" style={{ fontSize: '7px', color: '#888', lineHeight: 2 }}>
          Want to build something great together?
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          {[
            { label: 'Email', href: 'mailto:pupi@example.com', icon: '📧' },
            { label: 'GitHub', href: 'https://github.com', icon: '🐙' },
            { label: 'LinkedIn', href: 'https://linkedin.com', icon: '💼' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-transform hover:scale-105"
              style={{
                fontSize: '7px',
                color: '#0f0f1a',
                background: '#FFE040',
                padding: '8px 14px',
                border: '2px solid #B88000',
                boxShadow: '3px 3px 0 #806000',
                textDecoration: 'none',
                fontFamily: '"Press Start 2P", monospace',
              }}
            >
              {link.icon} {link.label}
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="text-center py-6"
        style={{
          borderTop: '2px solid #222',
          fontSize: '6px',
          color: '#444',
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        © 2026 Pupi · Built with React + Phaser · Inspired by Pokémon Emerald
      </footer>
    </div>
  );
}

export interface BuildingContent {
  title: string;
  body: string;
  tags?: string[];
  links?: { label: string; href: string }[];
  media?: { type: 'image' | 'video'; src: string }[];
}

export interface Building {
  id: string;
  name: string;
  tilePosition: { x: number; y: number };
  overlaySlug: string;
  pixelArtSrc: string;
  roofColor: string;
  content: BuildingContent;
}

export interface NPC {
  id: string;
  name: string;
  tilePosition: { x: number; y: number };
  dialogue: string[];
  color: string;
}

export const BUILDINGS: Building[] = [
  {
    id: 'about',
    name: 'Pupi Center',
    tilePosition: { x: 3, y: 3 },
    overlaySlug: 'about',
    pixelArtSrc: '',
    roofColor: '#2980E8',
    content: {
      title: 'About Pupi',
      body: `Hey there! I'm **Pupi** — a creative developer who builds experiences that live at the intersection of design and technology.\n\nI love crafting pixel-perfect interfaces, game-inspired UIs, and anything that makes people smile when they use it.\n\nWhen I'm not coding, you'll find me exploring retro games, experimenting with pixel art, or drinking too much coffee.`,
      tags: ['React', 'TypeScript', 'Phaser', 'Node.js', 'Python', 'Figma', 'Pixel Art'],
      links: [
        { label: 'GitHub', href: 'https://github.com' },
        { label: 'LinkedIn', href: 'https://linkedin.com' },
        { label: 'Email', href: 'mailto:pupi@example.com' },
      ],
    },
  },
  {
    id: 'project-alpha',
    name: 'Project House α',
    tilePosition: { x: 13, y: 3 },
    overlaySlug: 'project-alpha',
    pixelArtSrc: '',
    roofColor: '#E85030',
    content: {
      title: 'Pupi Town Portfolio',
      body: `This very portfolio you're exploring right now!\n\nA Pokémon Emerald-inspired interactive experience built with **React**, **TypeScript**, and **Phaser 3**. Visitors explore a pixel-art town and discover portfolio content by entering buildings.\n\nThe goal: make a portfolio that feels like a game, not a webpage.`,
      tags: ['React', 'TypeScript', 'Phaser 3', 'Tailwind CSS', 'Vite'],
      links: [
        { label: 'GitHub', href: 'https://github.com' },
        { label: 'Live Demo', href: '#' },
      ],
    },
  },
  {
    id: 'stack',
    name: 'Item Shop',
    tilePosition: { x: 13, y: 10 },
    overlaySlug: 'stack',
    pixelArtSrc: '',
    roofColor: '#48B858',
    content: {
      title: 'Skills & Stack',
      body: `My toolkit for building great things:\n\n**Frontend** — React, TypeScript, Tailwind CSS, Phaser 3, HTML/CSS/JS\n\n**Backend** — Node.js, Python, REST APIs, GraphQL\n\n**Tools** — Vite, Git, Figma, VS Code, Docker\n\n**Design** — Pixel Art, UI/UX, Responsive Design`,
      tags: ['React', 'TypeScript', 'Node.js', 'Python', 'Figma', 'Docker', 'GraphQL'],
      links: [
        { label: 'Full Resume', href: '#' },
      ],
    },
  },
];

export const NPCS: NPC[] = [
  {
    id: 'guide',
    name: 'Guide',
    tilePosition: { x: 9, y: 12 },
    dialogue: [
      'Welcome to PUPI TOWN!',
      'Use Arrow Keys or WASD to explore.',
      'Press SPACE near a building to enter.',
      'Press ESC to exit any building.',
      'Enjoy your visit!',
    ],
    color: '#F8C068',
  },
];

export const SPAWN_TILE = { x: 9, y: 17 };

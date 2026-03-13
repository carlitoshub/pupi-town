# PRD — Pupi Town Portfolio
**Product Type:** Interactive Web Portfolio  
**Visual Style:** Pokémon Emerald (GBA, 16-bit pixel art, top-down RPG)  
**Codename:** Pupi Town  
**Target IDE:** Antigravity (edited via Claude Code)

---

## 1. Overview

Pupi Town is a browser-based, interactive portfolio experience styled after Pokémon Emerald. Visitors take control of a pixel-art character and explore a small town. Every building in the town represents a section of the portfolio (projects, about, contact, etc.). When the player walks up to a building and interacts with it, a full-screen overlay opens and presents that section's content — illustrated in 16-bit pixel art style.

The experience is designed to be memorable, delightful, and fully navigable via keyboard (and optionally gamepad/touch). A persistent top bar provides orientation, controls reference, and quick-nav shortcuts.

---

## 2. Goals

- Make a strong first impression: the portfolio should feel like a game, not a webpage.
- Communicate work, personality, and skills through spatial exploration rather than scrolling.
- Be fully accessible via a fallback "classic" home section for visitors who opt out of the game.
- Perform well in modern browsers with no plugin dependencies (pure HTML/CSS/JS or lightweight canvas framework).
- Be easy to extend: adding a new portfolio section = adding a new building to the map.

---

## 3. Non-Goals

- This is **not** a multiplayer experience.
- This is **not** a full Pokémon game (no battles, no items, no save system).
- Mobile support is a **stretch goal**, not an MVP requirement.
- Accessibility beyond keyboard navigation is out of scope for v1.

---

## 4. Reference Map — Pupi Town

The town layout is inspired by the uploaded reference image (`Smeraldopoli.png`). The canonical map layout for v1 is:

```
┌─────────────────────────────────────────────────────────┐
│  [Forest border — top]                                  │
│                                                         │
│  [Fenced area / Berry patch]   [Gym / Skills House]     │
│                                [Pokémon Center / About] │
│  [Water feature / pond]                                 │
│                                [PokéMart / Contact]     │
│  [Path exits — bottom]         [Project House 1]        │
│                                [Project House 2]        │
└─────────────────────────────────────────────────────────┘
```

Every interactive location is a **Named Building** (see Section 6). The map tile size is **16×16 px** per tile, rendered on a canvas sized to the viewport.

---

## 5. Site Structure

```
/                   → Game boots, player spawns in Pupi Town
/?classic=true      → Skips game, renders standard Home section
/[building-slug]    → Deep-link that opens a building's overlay directly
```

---

## 6. Named Buildings & Portfolio Sections

| Building Name         | Portfolio Section     | Content Type                         |
|-----------------------|-----------------------|--------------------------------------|
| **Pupi Center**       | About Me              | Character sprite + bio text, skills  |
| **Project House α**   | Project 1             | Pixel art mockup, description, links |
| **Project House β**   | Project 2             | Pixel art mockup, description, links |
| **Project House γ**   | Project 3             | Pixel art mockup, description, links |
| **Item Shop**         | Services / Stack      | Icon grid of tools/tech used         |
| **Gym**               | Experience / Resume   | Timeline rendered as gym badge wall  |
| **Notice Board**      | Blog / Writing        | Pinned pixel-art post cards          |
| **Exit Path South**   | Contact               | Dialogue box with email/social links |

> Buildings are added/removed via a single config file (`town.config.ts` or equivalent). The map auto-adjusts tile placement.

---

## 7. Core Features

### 7.1 Game Canvas
- Renders the town map using a **tile-based engine** (Tiled-compatible JSON map or hardcoded tileset).
- Tileset is custom-drawn in the style of Pokémon Emerald (16-bit GBA palette).
- The camera follows the player character, centering on them as they walk.
- Collision detection prevents the player from walking through walls, trees, and water.
- Animated tiles: water shimmer, flowers swaying, etc.

### 7.2 Player Character
- Moves with **Arrow Keys** or **WASD**.
- 4-directional walking animation (3-frame walk cycle per direction).
- Character sprite is a custom pixel-art avatar representing the portfolio owner.
- Interaction key: **Space** or **Enter** — used to interact with buildings and signs.

### 7.3 Building Interaction
- When the player is **1 tile in front of a building door** and presses the interaction key, an overlay opens.
- A small **"!" bubble** or **flashing indicator** appears above the building when the player is in range.
- Transition animation: screen fades to black → overlay appears (mimicking entering a building in Pokémon).

### 7.4 Portfolio Overlay (Full-Screen)
- Each building has its own **full-screen overlay panel**.
- Layout per overlay:
  - **Header**: Building name (styled as a Pokémon location banner).
  - **Pixel Art Panel**: 16-bit illustration of the project/content (static image or simple sprite animation).
  - **Content Area**: Text, tags, links, and media in a clean layout alongside the pixel art.
  - **Navigation**: `← Prev` / `Next →` arrows to cycle through portfolio items within the same building.
  - **Close**: `Esc` key or an `[X]` button returns the player to the town.
- Overlays support: text, images, video embeds, and external links.

### 7.5 Top Bar Menu
Always visible, fixed to the top of the viewport.

| Element              | Description                                                      |
|----------------------|------------------------------------------------------------------|
| **Logo / Title**     | "Pupi Town" in pixel font, links to map reset / home spawn       |
| **Controls Legend**  | Inline icons: `↑↓←→ Move` · `Space Interact` · `Esc Close`      |
| **Mini Map**         | Small thumbnail of the full town with player dot (toggle button) |
| **Quick Nav**        | Dropdown listing all buildings by name for direct overlay access |
| **Classic View**     | Button to switch to standard (non-game) portfolio layout          |
| **Theme Toggle**     | Day / Night mode (changes ambient lighting on the map)           |

### 7.6 Classic Home Section
Accessible via top bar or `/?classic=true`. Renders a standard single-page portfolio layout:
- Hero section with name, title, and avatar.
- Grid of project cards.
- Skills/stack section.
- Contact form or links.
- Styled to match the pixel art / Pokémon aesthetic (pixel fonts, tile borders, etc.) but fully scrollable.

### 7.7 Dialogue System
- Signs and NPCs in town display **Pokémon-style dialogue boxes** at the bottom of the screen.
- Dialogue advances with Space/Enter. Dismiss with Esc.
- Used for: building intros, easter eggs, and the Contact "exit path" interaction.

---

## 8. NPCs

| NPC Sprite      | Location         | Dialogue / Purpose                              |
|-----------------|------------------|-------------------------------------------------|
| **Guide NPC**   | Town center      | Welcome message, explains controls on first load|
| **Old Man**     | Near berry patch | Easter egg / fun fact about the portfolio owner |
| **Rival NPC**   | Near gym         | Humorous "challenge" referencing the owner's skills |

NPCs are optional for MVP but should be stubbed in the map config.

---

## 9. Audio

| Sound             | Trigger                              |
|-------------------|--------------------------------------|
| BGM (Pokémon Emerald-style chiptune) | Plays on map load, loops     |
| Door open SFX     | Entering a building                  |
| Text blip SFX     | Dialogue box character-by-character  |
| Step SFX          | Every 2nd player movement tile       |
| Mute toggle       | Top bar audio icon                   |

Audio files are small `.ogg`/`.mp3` chiptune clips. All audio is **off by default** and only starts after first user interaction (browser autoplay policy compliance).

---

## 10. Tech Stack (Recommended)

| Layer           | Choice                                      | Notes                                      |
|-----------------|---------------------------------------------|--------------------------------------------|
| Framework       | **React + TypeScript**                      | Component-based overlays + state management|
| Canvas Rendering| **Phaser 3** or **PixiJS**                  | Handles tilemap, sprites, animation loop   |
| Map Format      | **Tiled JSON** (`.tmj`)                     | Industry standard, easy to edit            |
| Styling         | **Tailwind CSS**                            | For overlay UI, top bar, classic view      |
| Pixel Font      | **Press Start 2P** (Google Fonts)           | Matches GBA aesthetic                      |
| Audio           | **Howler.js**                               | Cross-browser audio with Web Audio API     |
| Routing         | **React Router v6**                         | For `/?classic=true` and deep links        |
| Hosting         | **Vercel / Netlify**                        | Static deploy, zero config                 |

> If Phaser is too heavy, a lightweight alternative is a custom canvas loop with a simple tilemap renderer (~200 lines).

---

## 11. File Structure

```
pupi-town/
├── public/
│   ├── assets/
│   │   ├── tilesets/          # GBA-style tileset PNGs
│   │   ├── sprites/           # Player + NPC sprite sheets
│   │   ├── buildings/         # Building pixel art overlays
│   │   └── audio/             # BGM + SFX files
│   └── maps/
│       └── pupi-town.tmj      # Tiled map definition
├── src/
│   ├── game/
│   │   ├── engine/            # Canvas loop, tilemap renderer, collision
│   │   ├── entities/          # Player, NPC classes
│   │   └── scenes/            # Town scene, transition logic
│   ├── components/
│   │   ├── TopBar/            # Top bar menu
│   │   ├── Overlay/           # Full-screen portfolio panel
│   │   ├── DialogueBox/       # Pokémon-style text box
│   │   └── ClassicView/       # Standard portfolio fallback
│   ├── data/
│   │   └── town.config.ts     # Building definitions, NPC data, content
│   ├── hooks/                 # usePlayer, useGameLoop, useOverlay
│   ├── App.tsx
│   └── main.tsx
├── PRD_PupiTown_Portfolio.md  # This document
└── README.md
```

---

## 12. `town.config.ts` — Building Schema

```typescript
export interface Building {
  id: string;                  // e.g. "about"
  name: string;                // e.g. "Pupi Center"
  tilePosition: { x: number; y: number };  // Door tile on map
  overlaySlug: string;         // Route slug for deep-link
  pixelArtSrc: string;         // Path to 16-bit illustration
  content: {
    title: string;
    body: string;              // Markdown supported
    tags?: string[];
    links?: { label: string; href: string }[];
    media?: { type: "image" | "video"; src: string }[];
  };
}
```

---

## 13. Player Spawn & First-Time Experience

1. On first load, player spawns at the **south entrance** of Pupi Town.
2. The **Guide NPC** walks up and triggers an auto-dialogue:  
   *"Welcome to Pupi Town! Use arrow keys to explore. Press Space near a building to enter."*
3. After dismissing dialogue, the player is free to roam.
4. A `localStorage` flag (`pupi_visited`) suppresses the intro on repeat visits.

---

## 14. Responsive Behavior

| Breakpoint     | Behavior                                                         |
|----------------|------------------------------------------------------------------|
| Desktop (≥1024px) | Full game canvas, top bar, all features enabled             |
| Tablet (768–1023px) | Game canvas scales down, touch D-pad overlay shown        |
| Mobile (<768px) | Game auto-pauses, prompt shown: "Best on desktop. View Classic?" |

Touch controls (virtual D-pad + action button) are a **v2 feature**.

---

## 15. Performance Requirements

- Initial load ≤ 3 seconds on a 10 Mbps connection (assets lazy-loaded after first render).
- Canvas targets **60 fps** on modern hardware.
- Total bundle size ≤ 2 MB gzipped (excluding audio).
- Tileset sprite sheets use **texture atlases** to minimize draw calls.

---

## 16. Accessibility

- Top bar "Classic View" button is always reachable via Tab key.
- All overlay content is screen-reader accessible (ARIA labels, semantic HTML).
- Keyboard-only navigation must be fully functional.
- Color contrast in overlays meets WCAG AA.

---

## 17. Analytics (Optional)

- Track: page load, time spent in game view, which buildings are entered, classic view switches.
- Use: **Plausible.io** (privacy-first, no cookies required).

---

## 18. MVP Scope (v1)

| Feature                         | In MVP? |
|---------------------------------|---------|
| Town map with walkable tiles    | ✅      |
| Player movement + collision     | ✅      |
| 3 buildings with overlays       | ✅      |
| Dialogue box system             | ✅      |
| Top bar (controls + quick nav)  | ✅      |
| Classic view fallback           | ✅      |
| BGM + SFX                       | ✅      |
| Full 8-building town            | v2      |
| NPCs                            | v2      |
| Touch / mobile D-pad            | v2      |
| Mini-map                        | v2      |
| Day/Night mode                  | v2      |
| Blog / Notice Board             | v2      |

---

## 19. Open Questions

1. **Character sprite**: custom avatar or selectable preset?
2. **Tileset source**: commission a pixel artist, use free GBA-rip assets (check licensing), or generate with AI pixel art tools?
3. **Content CMS**: Is `town.config.ts` sufficient, or do we want a headless CMS (Notion API, Sanity) for easy content updates?
4. **Domain**: Will this live at `[name].dev`, `[name].com`, or a subdomain?
5. **Analytics consent**: Is Plausible sufficient, or is a consent banner needed?

---

## 20. Success Metrics

- Visitors spend **> 90 seconds** on the site on average.
- **> 40%** of visitors enter at least one building overlay.
- Zero reported crashes or canvas failures on Chrome/Firefox/Safari latest.
- Portfolio leads to at least one meaningful professional contact per month.

---

*Last updated: March 2026 — v1.0 draft*

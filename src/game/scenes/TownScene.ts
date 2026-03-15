import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { BUILDINGS, NPCS, SPAWN_TILE } from '../../data/town.config';

const TILE = 16;
const MAP_W = 20;
const MAP_H = 20;
const CAMERA_ZOOM = 3;
const INTERACT_RADIUS = 72;   // show "!" within this world-px distance
const AUTO_ENTER_RADIUS = 24; // walk-in auto-open (no key press needed)

interface BuildingDef {
  id: string;
  tx: number; ty: number; tw: number; th: number;
  roofColor: number; roofLight: number; roofDark: number;
  wallColor: number;
  name: string;
  doorTx: number;
}

export class TownScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private buildingColliders!: Phaser.Physics.Arcade.StaticGroup;

  // Direct door/npc positions — no Phaser zones needed
  private doorPoints: Array<{ id: string; x: number; y: number }> = [];
  private npcPoints: Array<{ id: string; x: number; y: number }> = [];

  private exclamationMarks: Map<string, Phaser.GameObjects.Text> = new Map();
  private exclamationBaseY: Map<string, number> = new Map();
  private activeNearby: string | null = null;

  private overlayOpen = false;
  private dialogueOpen = false;
  private interactCooldown = 0;
  private hintText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'TownScene' });
  }

  preload() {
    this.load.spritesheet('player', '/assets/sprites/player.png', {
      frameWidth: 16,
      frameHeight: 24,
    });
  }

  create() {
    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.drawMap();
    this.createBuildingBlockers();
    this.spawnPlayer();
    this.spawnNPCs();
    this.setupInteractionPoints();
    this.setupCamera();
    this.setupWorldBounds();
    this.createHUD();

    this.game.events.on('overlay-close', this.onOverlayClosed, this);
    this.game.events.on('dialogue-close', this.onDialogueClosed, this);
    this.game.events.on('open-building', (id: string) => this.openBuilding(id), this);
  }

  // ─── MAP DRAWING ─────────────────────────────────────────────────────────────

  private drawMap() {
    const g = this.add.graphics().setDepth(0);
    this.drawGround(g);
    this.drawPaths(g);
    this.drawPond(g);
    this.drawFlowers(g);
    this.drawTrees(g);
    this.drawBuildings(g);
  }

  private drawGround(g: Phaser.GameObjects.Graphics) {
    const inner = [0x528B41, 0x4A7A3A, 0x5A9648, 0x4E8040];
    for (let row = 0; row < MAP_H; row++) {
      for (let col = 0; col < MAP_W; col++) {
        const x = col * TILE;
        const y = row * TILE;
        if (row === 0 || row === MAP_H - 1 || col === 0 || col === MAP_W - 1) {
          g.fillStyle(0x224411);
          g.fillRect(x, y, TILE, TILE);
          g.fillStyle(0x1A3A0E);
          g.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
        } else {
          g.fillStyle(inner[(row * 7 + col * 13) % 4]);
          g.fillRect(x, y, TILE, TILE);
          if ((row * 3 + col * 5) % 7 === 0) {
            g.fillStyle(0x3F6E30);
            g.fillRect(x + 3, y + 7, 2, 1);
          }
          if ((row * 11 + col * 7) % 9 === 0) {
            g.fillStyle(0x68B050);
            g.fillRect(x + 11, y + 4, 1, 2);
          }
        }
      }
    }
  }

  private drawPaths(g: Phaser.GameObjects.Graphics) {
    const main = 0xCCA860;
    const light = 0xDDBB70;
    const dark = 0xAA8840;

    // Horizontal path rows 14–15
    for (let col = 1; col < MAP_W - 1; col++) {
      for (let row = 14; row <= 15; row++) {
        const x = col * TILE;
        const y = row * TILE;
        g.fillStyle(main);
        g.fillRect(x, y, TILE, TILE);
        if (row === 14) { g.fillStyle(dark); g.fillRect(x, y, TILE, 2); }
        if (row === 15) { g.fillStyle(light); g.fillRect(x, y + 14, TILE, 2); }
        if ((col * 3 + row * 7) % 5 === 0) { g.fillStyle(dark); g.fillRect(x + 4, y + 5, 2, 2); }
        if ((col * 7 + row * 3) % 6 === 0) { g.fillStyle(light); g.fillRect(x + 10, y + 9, 2, 2); }
      }
    }

    // Vertical path cols 8–10
    for (let row = 1; row < MAP_H - 1; row++) {
      for (let col = 8; col <= 10; col++) {
        const x = col * TILE;
        const y = row * TILE;
        g.fillStyle(main);
        g.fillRect(x, y, TILE, TILE);
        if (col === 8) { g.fillStyle(dark); g.fillRect(x, y, 2, TILE); }
        if (col === 10) { g.fillStyle(light); g.fillRect(x + 14, y, 2, TILE); }
        if ((col * 5 + row * 4) % 7 === 0) { g.fillStyle(dark); g.fillRect(x + 7, y + 3, 2, 2); }
      }
    }
  }

  private drawPond(g: Phaser.GameObjects.Graphics) {
    // Pond moved to rows 10–13 so Pupi Center's south entrance is unobstructed
    for (let row = 10; row <= 13; row++) {
      for (let col = 2; col <= 6; col++) {
        const x = col * TILE;
        const y = row * TILE;
        const edge = row === 10 || col === 2;
        g.fillStyle(edge ? 0x2070B8 : (row === 13 || col === 6) ? 0x48A8E0 : 0x3898D8);
        g.fillRect(x, y, TILE, TILE);
        if ((row + col) % 2 === 0) {
          g.fillStyle(0x60C0F0);
          g.fillRect(x + 2, y + 5, 6, 1);
          g.fillRect(x + 9, y + 11, 4, 1);
        }
      }
    }

    // Sandy rim
    g.fillStyle(0xB89840);
    for (let col = 2; col <= 6; col++) {
      g.fillRect(col * TILE, 9 * TILE + 13, TILE, 3);
      g.fillRect(col * TILE, 14 * TILE, TILE, 3);
    }
    for (let row = 10; row <= 13; row++) {
      g.fillRect(TILE + 13, row * TILE, 3, TILE);
      g.fillRect(7 * TILE, row * TILE, 3, TILE);
    }

    // Fence posts and rails
    const post = 0x7A4E1A;
    const rail = 0xAA7030;
    for (let col = 1; col <= 7; col++) {
      const px = col * TILE + 6;
      g.fillStyle(post);
      g.fillRect(px, 9 * TILE + 8, 4, 10);
      g.fillRect(px, 14 * TILE - 2, 4, 10);
    }
    g.fillStyle(rail);
    g.fillRect(TILE + 8, 9 * TILE + 11, 7 * TILE - 8, 2);
    g.fillRect(TILE + 8, 14 * TILE + 1, 7 * TILE - 8, 2);
  }

  private drawFlowers(g: Phaser.GameObjects.Graphics) {
    const positions = [
      [3,2],[5,2],[7,2],[12,2],[15,2],[17,2],
      [2,4],[4,5],[6,5],[11,5],[16,5],[18,5],
      [2,11],[4,11],[6,11],[12,11],[15,11],[17,11],
      [2,16],[4,16],[7,16],[12,16],[16,16],[18,7],[18,10],[18,13],
    ];
    const pColors = [0xFF6060, 0xFF88FF, 0xFFE040, 0xFF8840];
    for (const [col, row] of positions) {
      const x = col * TILE;
      const y = row * TILE;
      const pc = pColors[(col * 7 + row * 11) % 4];
      g.fillStyle(0x2A6818); g.fillRect(x + 7, y + 9, 2, 5);
      g.fillStyle(pc);
      g.fillRect(x + 5, y + 5, 2, 2);
      g.fillRect(x + 9, y + 5, 2, 2);
      g.fillRect(x + 7, y + 3, 2, 2);
      g.fillRect(x + 7, y + 7, 2, 2);
      g.fillStyle(0xFFFFA0); g.fillRect(x + 7, y + 5, 2, 2);
    }
  }

  private drawTrees(g: Phaser.GameObjects.Graphics) {
    const trees = [
      [1,1],[3,1],[6,1],[11,1],[14,1],[17,1],[18,1],
      [1,3],[1,6],[1,9],[1,12],
      [18,3],[18,12],
      [1,16],[2,17],[5,17],[6,16],[13,17],[14,16],[17,17],[18,16],
      [11,7],[11,10],
    ];
    for (const [col, row] of trees) {
      this.drawTree(g, col, row);
    }
  }

  private drawTree(g: Phaser.GameObjects.Graphics, col: number, row: number) {
    const x = col * TILE;
    const y = row * TILE;
    g.fillStyle(0x1A6018); g.fillRect(x + 1, y + 2, 14, 10);
    g.fillStyle(0x2E9828); g.fillRect(x + 2, y + 1, 12, 9);
    g.fillStyle(0x52C840); g.fillRect(x + 4, y + 2, 6, 4); g.fillRect(x + 11, y + 4, 3, 3);
    g.fillStyle(0x186010); g.fillRect(x + 2, y + 9, 12, 3);
    g.fillStyle(0x6A3A18); g.fillRect(x + 6, y + 12, 4, 4);
    g.fillStyle(0x082808);
    g.fillRect(x + 2, y, 12, 1);
    g.fillRect(x, y + 2, 1, 10);
    g.fillRect(x + 15, y + 2, 1, 10);
  }

  private drawBuildings(g: Phaser.GameObjects.Graphics) {
    for (const bd of this.getBuildingDefs()) {
      this.drawBuilding(g, bd);
    }
  }

  private drawBuilding(g: Phaser.GameObjects.Graphics, bd: BuildingDef) {
    const x = bd.tx * TILE;
    const y = bd.ty * TILE;
    const w = bd.tw * TILE;
    const h = bd.th * TILE;
    const roofH = Math.round(h * 0.52);
    const wallH = h - roofH;

    // Roof
    g.fillStyle(bd.roofColor);     g.fillRect(x, y, w, roofH);
    g.fillStyle(bd.roofLight);     g.fillRect(x + 2, y + 1, w - 4, 4);
    g.fillStyle(bd.roofDark);      g.fillRect(x, y + roofH - 4, w, 4);

    // Wall
    g.fillStyle(bd.wallColor);     g.fillRect(x, y + roofH, w, wallH);
    g.fillStyle(0xBBAA98);
    g.fillRect(x,         y + roofH, 2, wallH);
    g.fillRect(x + w - 2, y + roofH, 2, wallH);

    // Wall texture lines
    g.fillStyle(0xC8BCB0);
    for (let wy = y + roofH + 7; wy < y + h - TILE; wy += 7) {
      g.fillRect(x + 2, wy, w - 4, 1);
    }

    // Outline + divider
    g.lineStyle(1, 0x1A1A1A, 1);
    g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    g.fillStyle(0x333333); g.fillRect(x, y + roofH, w, 1);

    // Windows
    this.drawWindow(g, x + 3,      y + roofH + 3, 11, 8);
    this.drawWindow(g, x + w - 14, y + roofH + 3, 11, 8);

    // Door + steps
    const doorX = bd.doorTx * TILE + 3;
    const doorY = y + h - TILE + 1;
    this.drawDoor(g, doorX, doorY, 10, 13);
    g.fillStyle(0xBBAA98); g.fillRect(doorX - 2, doorY + 13, 14, 2);
  }

  private drawWindow(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number) {
    g.fillStyle(0x445566);   g.fillRect(x - 1, y - 1, w + 2, h + 2);
    const mx = x + Math.floor(w / 2);
    const my = y + Math.floor(h / 2);
    g.fillStyle(0xAADDFF); g.fillRect(x,      y,      mx - x - 1,      my - y - 1);
    g.fillStyle(0x88CCFF); g.fillRect(mx + 1, y,      x + w - mx - 1,  my - y - 1);
    g.fillStyle(0x88CCFF); g.fillRect(x,      my + 1, mx - x - 1,      y + h - my - 1);
    g.fillStyle(0xAADDFF); g.fillRect(mx + 1, my + 1, x + w - mx - 1,  y + h - my - 1);
    g.fillStyle(0x334455);
    g.fillRect(mx, y, 1, h);
    g.fillRect(x,  my, w, 1);
  }

  private drawDoor(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number) {
    g.fillStyle(0x3A1A08); g.fillRect(x - 1, y - 1, w + 2, h + 1);
    g.fillStyle(0x7A4A20); g.fillRect(x, y, w, h);
    g.fillStyle(0x9A6A40); g.fillRect(x + 1, y + 1, w - 2, Math.floor(h / 2) - 2);
    g.fillStyle(0x88CCFF); g.fillRect(x + 2, y + 2, w - 4, 4);
    g.fillStyle(0x334455); g.fillRect(x + Math.floor(w / 2), y + 2, 1, 4);
    g.fillStyle(0xD4C040); g.fillRect(x + w - 3, y + Math.floor(h * 0.55), 2, 2);
  }

  private getBuildingDefs(): BuildingDef[] {
    return [
      {
        id: 'about', tx: 3, ty: 3, tw: 4, th: 4,
        roofColor: 0x2980E8, roofLight: 0x52A8FF, roofDark: 0x1060C0,
        wallColor: 0xD4C8B4, name: 'PUPI CENTER', doorTx: 5,
      },
      {
        id: 'project-alpha', tx: 13, ty: 3, tw: 4, th: 4,
        roofColor: 0xE85030, roofLight: 0xFF7858, roofDark: 0xB03010,
        wallColor: 0xD4C8B4, name: 'PROJECT α', doorTx: 15,
      },
      {
        id: 'stack', tx: 13, ty: 10, tw: 4, th: 4,
        roofColor: 0x48B858, roofLight: 0x70E080, roofDark: 0x208840,
        wallColor: 0xD4C8B4, name: 'ITEM SHOP', doorTx: 15,
      },
    ];
  }

  // ─── BUILDING BLOCKERS ────────────────────────────────────────────────────────

  private createBuildingBlockers() {
    this.buildingColliders = this.physics.add.staticGroup();
    for (const bd of this.getBuildingDefs()) {
      const bw = bd.tw * TILE;
      const bh = (bd.th - 1) * TILE; // top 3 rows — leave door row walkable
      const cx = bd.tx * TILE + bw / 2;
      const cy = bd.ty * TILE + bh / 2;
      const blocker = this.buildingColliders.create(cx, cy, '__DEFAULT') as Phaser.Physics.Arcade.Sprite;
      blocker.setVisible(false).setAlpha(0);
      (blocker.body as Phaser.Physics.Arcade.StaticBody).setSize(bw, bh);
    }
    this.buildingColliders.refresh();
  }

  // ─── ENTITIES ─────────────────────────────────────────────────────────────────

  private spawnPlayer() {
    const x = SPAWN_TILE.x * TILE + TILE / 2;
    const y = SPAWN_TILE.y * TILE + TILE / 2;
    this.player = new Player(this, x, y);
    this.player.init(this.cursors);
    this.physics.add.collider(this.player, this.buildingColliders);
  }

  private spawnNPCs() {
    for (const npc of NPCS) {
      const x = npc.tilePosition.x * TILE + TILE / 2;
      const y = npc.tilePosition.y * TILE + TILE / 2;
      const color = parseInt(npc.color.replace('#', ''), 16);
      this.add.rectangle(x, y, 12, 18, color).setDepth(8);
      this.add.text(x, y - 14, npc.name, {
        fontSize: '5px',
        color: '#FFFFFF',
        fontFamily: '"Press Start 2P", monospace',
        resolution: CAMERA_ZOOM,
      }).setOrigin(0.5).setDepth(9);
      this.npcPoints.push({ id: npc.id, x, y });
    }
  }

  // ─── INTERACTION POINTS ───────────────────────────────────────────────────────

  private setupInteractionPoints() {
    for (const building of BUILDINGS) {
      const bd = this.getBuildingDefs().find((b) => b.id === building.id);
      if (!bd) continue;

      // Door center — one tile south of building bottom so auto-enter fires
      // before the player hits the building blocker
      const doorX = bd.doorTx * TILE + TILE / 2;
      const doorY = (bd.ty + bd.th) * TILE + TILE;
      this.doorPoints.push({ id: building.id, x: doorX, y: doorY });

      // "!" bobbing indicator
      const markX = doorX;
      const markY = doorY - TILE * 3 - 2; // above the door, not inside building
      const excText = this.add
        .text(markX, markY, '!', {
          fontSize: '12px',
          color: '#FFE040',
          fontFamily: '"Press Start 2P", monospace',
          stroke: '#333333',
          strokeThickness: 3,
          resolution: CAMERA_ZOOM,
        })
        .setOrigin(0.5, 1)
        .setDepth(20)
        .setVisible(false);
      this.exclamationMarks.set(building.id, excText);
      this.exclamationBaseY.set(building.id, markY);

      // Building name sign above roof
      this.add
        .text(bd.tx * TILE + (bd.tw * TILE) / 2, bd.ty * TILE - 3, bd.name, {
          fontSize: '6px',
          color: '#FFE040',
          fontFamily: '"Press Start 2P", monospace',
          stroke: '#000000',
          strokeThickness: 3,
          resolution: CAMERA_ZOOM,
          align: 'center',
        })
        .setOrigin(0.5, 1)
        .setDepth(25);
    }
  }

  // ─── CAMERA & WORLD BOUNDS ────────────────────────────────────────────────────

  private setupCamera() {
    this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(CAMERA_ZOOM);
    this.cameras.main.setRoundPixels(true);
  }

  private setupWorldBounds() {
    this.physics.world.setBounds(TILE, TILE, (MAP_W - 2) * TILE, (MAP_H - 2) * TILE);
  }

  // ─── HUD ──────────────────────────────────────────────────────────────────────

  private createHUD() {
    this.hintText = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height - 24, '[ SPACE ] Enter', {
        fontSize: '10px',
        color: '#FFE040',
        fontFamily: '"Press Start 2P", monospace',
        stroke: '#000000',
        strokeThickness: 4,
        backgroundColor: '#00000088',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(50)
      .setVisible(false);
  }

  // ─── UPDATE LOOP ──────────────────────────────────────────────────────────────

  update(_time: number, delta: number) {
    if (this.overlayOpen || this.dialogueOpen) return;

    this.player.update();
    this.interactCooldown = Math.max(0, this.interactCooldown - delta);
    this.checkNearby();

    // Auto-enter: walk up to a door and it opens automatically (Pokémon style)
    if (this.interactCooldown === 0) {
      for (const dp of this.doorPoints) {
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, dp.x, dp.y);
        if (d < AUTO_ENTER_RADIUS) {
          this.openBuilding(dp.id);
          return;
        }
      }
    }

    // SPACE / Enter fallback
    if (
      this.interactCooldown === 0 &&
      (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
        Phaser.Input.Keyboard.JustDown(this.enterKey))
    ) {
      this.tryInteract();
    }
  }

  private checkNearby() {
    let nearest: string | null = null;
    let nearestDist = INTERACT_RADIUS;

    for (const dp of this.doorPoints) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, dp.x, dp.y);
      if (d < nearestDist) { nearestDist = d; nearest = dp.id; }
    }
    for (const np of this.npcPoints) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, np.x, np.y);
      if (d < nearestDist) { nearestDist = d; nearest = `npc_${np.id}`; }
    }

    if (nearest !== this.activeNearby) {
      // Hide old marker
      if (this.activeNearby && !this.activeNearby.startsWith('npc_')) {
        const mark = this.exclamationMarks.get(this.activeNearby);
        const baseY = this.exclamationBaseY.get(this.activeNearby);
        if (mark) {
          this.tweens.killTweensOf(mark);
          if (baseY !== undefined) mark.setY(baseY);
          mark.setVisible(false);
        }
      }
      // Show new marker
      if (nearest && !nearest.startsWith('npc_')) {
        const mark = this.exclamationMarks.get(nearest);
        const baseY = this.exclamationBaseY.get(nearest);
        if (mark && baseY !== undefined) {
          mark.setY(baseY).setVisible(true);
          this.tweens.add({ targets: mark, y: baseY - 4, duration: 400, yoyo: true, repeat: -1 });
        }
      }
      this.activeNearby = nearest;
    }

    this.hintText.setVisible(!!nearest && !nearest.startsWith('npc_'));
  }

  // ─── ACTIONS ──────────────────────────────────────────────────────────────────

  private tryInteract() {
    if (!this.activeNearby) return;
    this.interactCooldown = 500;
    if (this.activeNearby.startsWith('npc_')) {
      this.openNPCDialogue(this.activeNearby.slice(4));
    } else {
      this.openBuilding(this.activeNearby);
    }
  }

  private openBuilding(buildingId: string) {
    const building = BUILDINGS.find((b) => b.id === buildingId);
    if (!building) return;
    this.overlayOpen = true;
    this.player.isInputLocked = true;
    this.hintText.setVisible(false);
    // Direct emit — camera fade removed for reliability
    this.game.events.emit('open-overlay', building);
  }

  private openNPCDialogue(npcId: string) {
    const npc = NPCS.find((n) => n.id === npcId);
    if (!npc) return;
    this.dialogueOpen = true;
    this.player.isInputLocked = true;
    this.game.events.emit('open-dialogue', npc.dialogue);
  }

  private onOverlayClosed() {
    this.overlayOpen = false;
    this.player.isInputLocked = false;
    this.interactCooldown = 600;
  }

  private onDialogueClosed() {
    this.dialogueOpen = false;
    this.player.isInputLocked = false;
    this.interactCooldown = 600;
  }

  shutdown() {
    this.game.events.off('overlay-close', this.onOverlayClosed, this);
    this.game.events.off('dialogue-close', this.onDialogueClosed, this);
  }
}

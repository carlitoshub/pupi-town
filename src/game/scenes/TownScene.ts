import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { BUILDINGS, NPCS, SPAWN_TILE } from '../../data/town.config';

const TILE = 16;
const MAP_W = 20;
const MAP_H = 20;

export class TownScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private buildingZones: Map<string, Phaser.GameObjects.Zone> = new Map();
  private exclamationMarks: Map<string, Phaser.GameObjects.Text> = new Map();
  private exclamationBaseY: Map<string, number> = new Map();
  private activeNearby: string | null = null;
  private overlayOpen = false;
  private dialogueOpen = false;
  private interactCooldown = 0;
  private hintText!: Phaser.GameObjects.Text;
  private buildingColliders!: Phaser.Physics.Arcade.StaticGroup;

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
    this.createBuildingColliders();
    this.spawnPlayer();
    this.spawnNPCs();
    this.createBuildingZones();
    this.setupCamera();
    this.setupWorldBounds();
    this.createHint();

    this.game.events.on('overlay-close', this.onOverlayClosed, this);
    this.game.events.on('dialogue-close', this.onDialogueClosed, this);
    this.game.events.on('open-building', (id: string) => this.openBuilding(id), this);
  }

  // ─── MAP ──────────────────────────────────────────────────────────────────

  private drawMap() {
    const g = this.add.graphics();
    g.setDepth(0);

    // Grass base
    for (let row = 0; row < MAP_H; row++) {
      for (let col = 0; col < MAP_W; col++) {
        const x = col * TILE;
        const y = row * TILE;
        if (row === 0 || row === MAP_H - 1 || col === 0 || col === MAP_W - 1) {
          g.fillStyle(0x224411);
          g.fillRect(x, y, TILE, TILE);
          g.fillStyle(0x1A4A10);
          g.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
        } else {
          g.fillStyle(0x528B41);
          g.fillRect(x, y, TILE, TILE);
          g.fillStyle(0x4A7A3A);
          g.fillRect(x, y, 1, 1);
        }
      }
    }

    // Paths
    const pathColor = 0xCCA860;
    const pathBorder = 0x8B7030;
    for (let col = 1; col < MAP_W - 1; col++) {
      for (let row = 14; row <= 15; row++) {
        g.fillStyle(pathColor);
        g.fillRect(col * TILE, row * TILE, TILE, TILE);
        g.fillStyle(pathBorder);
        g.fillRect(col * TILE, row * TILE, TILE, 1);
      }
    }
    for (let row = 1; row < MAP_H - 1; row++) {
      for (let col = 8; col <= 10; col++) {
        g.fillStyle(pathColor);
        g.fillRect(col * TILE, row * TILE, TILE, TILE);
        g.fillStyle(pathBorder);
        g.fillRect(col * TILE, row * TILE, 1, TILE);
      }
    }

    // Water pond
    for (let row = 6; row <= 9; row++) {
      for (let col = 2; col <= 6; col++) {
        g.fillStyle(0x298ED6);
        g.fillRect(col * TILE, row * TILE, TILE, TILE);
        g.fillStyle(0x38A0E0);
        if ((row + col) % 2 === 0) {
          g.fillRect(col * TILE + 2, row * TILE + 4, 5, 1);
          g.fillRect(col * TILE + 9, row * TILE + 10, 4, 1);
        }
      }
    }

    // Flowers
    const flowerPositions = [
      [3,2],[5,2],[7,2],[12,2],[15,2],[17,2],[18,2],
      [2,4],[4,5],[6,5],[11,5],[16,5],[18,5],
      [2,11],[4,11],[6,11],[12,11],[15,11],[17,11],
      [2,16],[4,16],[7,16],[12,16],[16,16],
    ];
    for (const [col, row] of flowerPositions) {
      const x = col * TILE;
      const y = row * TILE;
      g.fillStyle(0x528B41);
      g.fillRect(x, y, TILE, TILE);
      g.fillStyle(0xFFE040);
      g.fillRect(x + 7, y + 4, 2, 2);
      g.fillStyle(0xFF8040);
      g.fillRect(x + 5, y + 6, 2, 2);
      g.fillRect(x + 9, y + 6, 2, 2);
    }

    // Fence around pond
    const fenceColor = 0xD48E38;
    for (let col = 2; col <= 7; col++) {
      g.fillStyle(fenceColor);
      g.fillRect(col * TILE, 5 * TILE + 12, TILE, 4);
      g.fillRect(col * TILE, 5 * TILE + 12, 3, TILE - 12 + 1 * TILE);
      g.fillRect(col * TILE, 10 * TILE, TILE, 4);
    }

    this.drawBuildings(g);
  }

  private drawBuildings(g: Phaser.GameObjects.Graphics) {
    const defs = this.getBuildingDefs();
    for (const bd of defs) {
      const x = bd.tx * TILE;
      const y = bd.ty * TILE;
      const w = bd.tw * TILE;
      const h = bd.th * TILE;

      // Roof
      g.fillStyle(bd.roofColor);
      g.fillRect(x, y, w, Math.floor(h * 0.55));
      g.fillStyle(Phaser.Display.Color.ValueToColor(bd.roofColor).darken(30).color);
      g.fillRect(x, y + Math.floor(h * 0.55) - 2, w, 2);

      // Wall
      g.fillStyle(bd.wallColor);
      g.fillRect(x, y + Math.floor(h * 0.55), w, Math.ceil(h * 0.45));

      // Outline
      g.lineStyle(1, 0x333333, 1);
      g.strokeRect(x, y, w, h);

      // Door
      const doorX = bd.doorTx * TILE + 3;
      const doorY = y + h - TILE + 2;
      g.fillStyle(0x8B4E20);
      g.fillRect(doorX, doorY, 10, 14);
      g.fillStyle(0xD4A040);
      g.fillRect(doorX + 7, doorY + 6, 2, 2);

      // Windows
      g.fillStyle(0x88CCFF);
      g.fillRect(x + 4, y + Math.floor(h * 0.55) + 2, 8, 6);
      g.fillRect(x + w - 12, y + Math.floor(h * 0.55) + 2, 8, 6);

      // Building name sign
      this.add.text(x + w / 2, y - 6, bd.name, {
        fontSize: '4px',
        color: '#FFE040',
        fontFamily: '"Press Start 2P", monospace',
        stroke: '#000',
        strokeThickness: 2,
      }).setOrigin(0.5, 1).setDepth(6);
    }
  }

  private getBuildingDefs() {
    return [
      { tx: 3,  ty: 3,  tw: 4, th: 4, roofColor: 0x2980E8, wallColor: 0xD4C8B4, name: 'PUPI\nCENTER', doorTx: 5  },
      { tx: 13, ty: 3,  tw: 4, th: 4, roofColor: 0xE85030, wallColor: 0xD4C8B4, name: 'PROJECT α', doorTx: 15 },
      { tx: 13, ty: 10, tw: 4, th: 4, roofColor: 0x48B858, wallColor: 0xD4C8B4, name: 'ITEM SHOP', doorTx: 15 },
    ];
  }

  // ─── COLLISION ────────────────────────────────────────────────────────────

  private createBuildingColliders() {
    this.buildingColliders = this.physics.add.staticGroup();
    for (const bd of this.getBuildingDefs()) {
      // Block top 3 rows of each building (leave door row open)
      const cx = bd.tx * TILE + (bd.tw * TILE) / 2;
      const cy = bd.ty * TILE + ((bd.th - 1) * TILE) / 2;
      const cw = bd.tw * TILE;
      const ch = (bd.th - 1) * TILE;
      const blocker = this.add.rectangle(cx, cy, cw, ch, 0x000000, 0);
      this.buildingColliders.add(blocker);
    }
  }

  // ─── ENTITIES ─────────────────────────────────────────────────────────────

  private spawnPlayer() {
    const x = SPAWN_TILE.x * TILE + TILE / 2;
    const y = SPAWN_TILE.y * TILE + TILE / 2;
    this.player = new Player(this, x, y);
    this.player.init(this.cursors);
    // Collide with buildings
    this.physics.add.collider(this.player, this.buildingColliders);
  }

  private spawnNPCs() {
    for (const npc of NPCS) {
      const x = npc.tilePosition.x * TILE + TILE / 2;
      const y = npc.tilePosition.y * TILE + TILE / 2;
      const color = parseInt(npc.color.replace('#', ''), 16);
      const rect = this.add.rectangle(x, y, 12, 18, color);
      rect.setDepth(8);
      this.add.text(x, y - 14, npc.name, {
        fontSize: '5px',
        color: '#ffffff',
        fontFamily: '"Press Start 2P", monospace',
      }).setOrigin(0.5).setDepth(9);

      const zone = this.add.zone(x, y, 24, 24);
      this.physics.add.existing(zone, true);
      zone.setData('npcId', npc.id);
      zone.setData('type', 'npc');
      this.buildingZones.set(`npc_${npc.id}`, zone);
    }
  }

  // ─── INTERACTION ZONES ────────────────────────────────────────────────────

  private createBuildingZones() {
    for (const building of BUILDINGS) {
      // Zone is centered on the door tile (tilePos.x+2) one row below the building
      const doorWorldX = (building.tilePosition.x + 2) * TILE + TILE / 2;
      const doorWorldY = (building.tilePosition.y + 4) * TILE + TILE / 2;

      // Large zone: 4 tiles wide × 2 tiles tall so it's easy to trigger
      const zone = this.add.zone(doorWorldX, doorWorldY, TILE * 4, TILE * 2);
      this.physics.add.existing(zone, true);
      zone.setData('buildingId', building.id);
      zone.setData('type', 'building');
      this.buildingZones.set(building.id, zone);

      // "!" above the door
      const baseY = doorWorldY - TILE - 2;
      const excText = this.add.text(doorWorldX, baseY, '!', {
        fontSize: '12px',
        color: '#FFE040',
        fontFamily: '"Press Start 2P", monospace',
        stroke: '#333333',
        strokeThickness: 2,
      }).setOrigin(0.5).setDepth(20).setVisible(false);
      this.exclamationMarks.set(building.id, excText);
      this.exclamationBaseY.set(building.id, baseY);
    }
  }

  // ─── CAMERA + BOUNDS ──────────────────────────────────────────────────────

  private setupCamera() {
    this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(3);
  }

  private setupWorldBounds() {
    this.physics.world.setBounds(TILE, TILE, (MAP_W - 2) * TILE, (MAP_H - 2) * TILE);
  }

  // ─── HUD HINT ─────────────────────────────────────────────────────────────

  private createHint() {
    // Fixed to camera — shows "SPACE" when player is near a door
    this.hintText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 24,
      '[ SPACE ] Enter',
      {
        fontSize: '6px',
        color: '#FFE040',
        fontFamily: '"Press Start 2P", monospace',
        stroke: '#000000',
        strokeThickness: 3,
        backgroundColor: '#00000088',
        padding: { x: 6, y: 3 },
      }
    )
      .setOrigin(0.5, 1)
      .setScrollFactor(0)   // fixed to camera
      .setDepth(50)
      .setVisible(false);
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────

  update(_time: number, delta: number) {
    if (this.overlayOpen || this.dialogueOpen) return;

    this.player.update();
    this.interactCooldown = Math.max(0, this.interactCooldown - delta);
    this.checkNearbyBuildings();

    if (
      this.interactCooldown === 0 &&
      (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
        Phaser.Input.Keyboard.JustDown(this.enterKey))
    ) {
      this.tryInteract();
    }
  }

  private checkNearbyBuildings() {
    let foundNearby: string | null = null;

    for (const [id, zone] of this.buildingZones) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        zone.x, zone.y
      );
      if (dist < 48) {
        foundNearby = id;
        break;
      }
    }

    if (foundNearby !== this.activeNearby) {
      // Hide old
      if (this.activeNearby) {
        const oldMark = this.exclamationMarks.get(this.activeNearby);
        if (oldMark) {
          this.tweens.killTweensOf(oldMark);
          // Reset to base Y before hiding
          const baseY = this.exclamationBaseY.get(this.activeNearby);
          if (baseY !== undefined) oldMark.setY(baseY);
          oldMark.setVisible(false);
        }
      }
      // Show new
      if (foundNearby && !foundNearby.startsWith('npc_')) {
        const mark = this.exclamationMarks.get(foundNearby);
        const baseY = this.exclamationBaseY.get(foundNearby);
        if (mark && baseY !== undefined) {
          mark.setY(baseY);
          mark.setVisible(true);
          this.tweens.add({
            targets: mark,
            y: baseY - 4,
            duration: 400,
            yoyo: true,
            repeat: -1,
          });
        }
      }
      this.activeNearby = foundNearby;
    }

    // HUD hint
    const nearBuilding = foundNearby && !foundNearby.startsWith('npc_');
    this.hintText.setVisible(!!nearBuilding);
  }

  // ─── ACTIONS ──────────────────────────────────────────────────────────────

  private tryInteract() {
    if (!this.activeNearby) return;
    this.interactCooldown = 500;

    const zone = this.buildingZones.get(this.activeNearby);
    if (!zone) return;

    const type = zone.getData('type');
    if (type === 'building') {
      this.openBuilding(zone.getData('buildingId') as string);
    } else if (type === 'npc') {
      this.openNPCDialogue(zone.getData('npcId') as string);
    }
  }

  private openBuilding(buildingId: string) {
    const building = BUILDINGS.find((b) => b.id === buildingId);
    if (!building) return;

    this.overlayOpen = true;
    this.player.isInputLocked = true;
    this.hintText.setVisible(false);

    // Use event-based fade — more reliable than progress === 1 callback
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.game.events.emit('open-overlay', building);
        this.cameras.main.fadeIn(300, 0, 0, 0);
      }
    );
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

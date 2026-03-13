import Phaser from 'phaser';

const SPEED = 96;
const TILE_SIZE = 16;

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private facing: 'down' | 'up' | 'left' | 'right' = 'down';
  public isInputLocked = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setDepth(10);
    // Shrink physics body slightly so player fits through gaps
    this.setSize(10, 10);
    this.setOffset(3, 14);
  }

  init(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    this.cursors = cursors;
    const kb = this.scene.input.keyboard!;
    this.wasd = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.createAnimations();
    this.play('walk_down_idle');
  }

  private createAnimations() {
    const anims = this.scene.anims;
    const frameRate = 8;

    // Spritesheet: 3 frames wide, 4 rows tall
    // Row 0 = down, Row 1 = left, Row 2 = right, Row 3 = up
    const dirs = [
      { key: 'down', row: 0 },
      { key: 'left', row: 1 },
      { key: 'right', row: 2 },
      { key: 'up', row: 3 },
    ];

    for (const { key, row } of dirs) {
      const frames = [row * 3, row * 3 + 1, row * 3 + 2];
      if (!anims.exists(`walk_${key}`)) {
        anims.create({
          key: `walk_${key}`,
          frames: anims.generateFrameNumbers('player', { frames }),
          frameRate,
          repeat: -1,
        });
      }
      if (!anims.exists(`walk_${key}_idle`)) {
        anims.create({
          key: `walk_${key}_idle`,
          frames: anims.generateFrameNumbers('player', { frames: [row * 3] }),
          frameRate: 1,
          repeat: -1,
        });
      }
    }
  }

  update() {
    if (this.isInputLocked) {
      this.setVelocity(0, 0);
      this.play(`walk_${this.facing}_idle`, true);
      return;
    }

    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    this.setVelocity(0, 0);
    let moving = false;

    if (left) {
      this.setVelocityX(-SPEED);
      this.facing = 'left';
      moving = true;
    } else if (right) {
      this.setVelocityX(SPEED);
      this.facing = 'right';
      moving = true;
    }

    if (up) {
      this.setVelocityY(-SPEED);
      this.facing = 'up';
      moving = true;
    } else if (down) {
      this.setVelocityY(SPEED);
      this.facing = 'down';
      moving = true;
    }

    if (moving) {
      this.play(`walk_${this.facing}`, true);
    } else {
      this.play(`walk_${this.facing}_idle`, true);
    }
  }

  getFacing() {
    return this.facing;
  }

  getTileX() {
    return Math.floor(this.x / TILE_SIZE);
  }

  getTileY() {
    return Math.floor(this.y / TILE_SIZE);
  }
}

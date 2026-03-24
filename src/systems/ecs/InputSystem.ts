// 输入系统 - 处理玩家输入

import { World, BaseSystem, SystemPriority, Entity } from '@/ecs';
import { Transform, TurnBased } from '@/components';
import { worldToTile, tileToWorld } from '@/components';

interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action: boolean;
  wait: boolean;
}

export class InputSystem extends BaseSystem {
  private scene: Phaser.Scene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  private lastInput: InputState = { up: false, down: false, left: false, right: false, action: false, wait: false };
  private mapSystem: { isWall: (x: number, y: number) => boolean };
  private onMoveCallback: ((entity: Entity, dx: number, dy: number) => void) | null = null;

  constructor(scene: Phaser.Scene, mapSystem: { isWall: (x: number, y: number) => boolean }) {
    super(SystemPriority.INPUT);
    this.scene = scene;
    this.mapSystem = mapSystem;
  }

  onInit(_world: World): void {
    this.cursors = this.scene.input.keyboard!.createCursorKeys();
    this.wasd = this.scene.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as { [key: string]: Phaser.Input.Keyboard.Key };

    this.scene.input.keyboard?.on('keydown-SPACE', () => {
      this.lastInput.wait = true;
    });
  }

  update(world: World, _deltaTime: number): void {
    // 只处理玩家回合
    const player = this.findPlayer(world);
    if (!player) return;

    const turnBased = world.getComponent<TurnBased>(player, 'TurnBased');
    if (turnBased?.hasActed) return;

    // 读取输入
    let dx = 0;
    let dy = 0;

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up!) || Phaser.Input.Keyboard.JustDown(this.wasd.up)) {
      dy = -1;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down!) || Phaser.Input.Keyboard.JustDown(this.wasd.down)) {
      dy = 1;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left!) || Phaser.Input.Keyboard.JustDown(this.wasd.left)) {
      dx = -1;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right!) || Phaser.Input.Keyboard.JustDown(this.wasd.right)) {
      dx = 1;
    }

    if (dx !== 0 || dy !== 0) {
      this.handleMove(world, player, dx, dy);
    } else if (this.lastInput.wait) {
      this.handleWait(world, player);
      this.lastInput.wait = false;
    }
  }

  private findPlayer(world: World): Entity | null {
    const players = world.query('PlayerTag', 'Transform');
    return players.length > 0 ? players[0] : null;
  }

  private handleMove(world: World, player: Entity, dx: number, dy: number): void {
    const transform = world.getComponent<Transform>(player, 'Transform')!;
    const tileSize = 32;

    const currentTile = worldToTile(transform.x, transform.y, tileSize);
    const targetTileX = currentTile.x + dx;
    const targetTileY = currentTile.y + dy;

    // 检查墙壁
    if (this.mapSystem.isWall(targetTileX, targetTileY)) {
      return;
    }

    // 移动
    const targetPos = tileToWorld(targetTileX, targetTileY, tileSize);
    
    import('./MovementSystem').then(({ MovementSystem }) => {
      MovementSystem.setTarget(transform, targetPos.x, targetPos.y);
    });

    // 标记已行动
    this.markAsActed(world, player);

    // 回调
    this.onMoveCallback?.(player, dx, dy);
  }

  private handleWait(world: World, player: Entity): void {
    this.markAsActed(world, player);
  }

  private markAsActed(world: World, entity: Entity): void {
    const turnBased = world.getComponent<TurnBased>(entity, 'TurnBased');
    if (turnBased) {
      turnBased.hasActed = true;
    }
  }

  setOnMoveCallback(callback: (entity: Entity, dx: number, dy: number) => void): void {
    this.onMoveCallback = callback;
  }

  // 重置所有实体的行动状态
  static resetTurns(world: World): void {
    const entities = world.query('TurnBased');
    for (const entity of entities) {
      const turnBased = world.getComponent<TurnBased>(entity, 'TurnBased')!;
      turnBased.hasActed = false;
    }
  }
}

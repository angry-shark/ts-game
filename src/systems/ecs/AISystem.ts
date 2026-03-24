// AI 系统 - 处理敌人行为

import { World, BaseSystem, SystemPriority, Entity } from '@/ecs';
import { AI, TurnBased, Transform, Stats, Combatant, GridPosition } from '@/components';
import { worldToTile, tileToWorld } from '@/components';
import { MovementSystem } from './MovementSystem';
import { dealDamage } from './CombatSystem';

export class AISystem extends BaseSystem {
  private scene: Phaser.Scene;
  private mapSystem: { isWall: (x: number, y: number) => boolean };
  private tileSize: number = 32;

  constructor(scene: Phaser.Scene, mapSystem: { isWall: (x: number, y: number) => boolean }) {
    super(SystemPriority.AI);
    this.scene = scene;
    this.mapSystem = mapSystem;
  }

  update(world: World, deltaTime: number): void {
    const enemies = world.query('AI', 'TurnBased', 'Transform');
    const player = this.findPlayer(world);

    if (!player) return;

    const playerTransform = world.getComponent<Transform>(player, 'Transform')!;

    for (const enemy of enemies) {
      const turnBased = world.getComponent<TurnBased>(enemy, 'TurnBased')!;
      if (turnBased.hasActed) continue;

      const ai = world.getComponent<AI>(enemy, 'AI')!;
      const enemyTransform = world.getComponent<Transform>(enemy, 'Transform')!;

      // 延迟处理
      ai.currentDelay -= deltaTime;
      if (ai.currentDelay > 0) continue;
      ai.currentDelay = ai.actionDelay;

      // 决策
      this.makeDecision(world, enemy, enemyTransform, player, playerTransform);

      // 标记已行动
      turnBased.hasActed = true;
    }
  }

  private findPlayer(world: World): Entity | null {
    const players = world.query('PlayerTag', 'Transform');
    return players.length > 0 ? players[0] : null;
  }

  private makeDecision(
    world: World,
    enemy: Entity,
    enemyTransform: Transform,
    player: Entity,
    playerTransform: Transform
  ): void {
    const ai = world.getComponent<AI>(enemy, 'AI')!;
    
    const enemyTile = worldToTile(enemyTransform.x, enemyTransform.y, this.tileSize);
    const playerTile = worldToTile(playerTransform.x, playerTransform.y, this.tileSize);

    const dx = playerTile.x - enemyTile.x;
    const dy = playerTile.y - enemyTile.y;
    const distance = Math.abs(dx) + Math.abs(dy);

    // 如果在攻击范围内
    if (distance === 1) {
      this.attackPlayer(world, enemy, player);
      return;
    }

    // 如果在视野内，追逐玩家
    if (distance <= ai.visionRange) {
      this.moveTowardsPlayer(world, enemyTransform, enemyTile, playerTile);
      return;
    }

    // 否则待机
    ai.state = 'idle';
  }

  private attackPlayer(world: World, enemy: Entity, player: Entity): void {
    const stats = world.getComponent<Stats>(enemy, 'Stats');
    if (stats) {
      const damage = Math.max(1, stats.attack + Phaser.Math.Between(-1, 1));
      dealDamage(world, player, damage, enemy);
    }

    // 攻击动画
    const sprite = world.getComponent<import('@/components').Sprite>(enemy, 'Sprite');
    if (sprite?.phaserSprite) {
      this.scene.tweens.add({
        targets: sprite.phaserSprite,
        scale: { from: 1.1, to: 1 },
        duration: 150,
      });
    }
  }

  private moveTowardsPlayer(
    world: World,
    enemyTransform: Transform,
    enemyTile: GridPosition,
    playerTile: GridPosition
  ): void {
    const dx = playerTile.x - enemyTile.x;
    const dy = playerTile.y - enemyTile.y;

    let moveX = 0;
    let moveY = 0;

    if (Math.abs(dx) > Math.abs(dy)) {
      moveX = dx > 0 ? 1 : -1;
    } else {
      moveY = dy > 0 ? 1 : -1;
    }

    const targetX = enemyTile.x + moveX;
    const targetY = enemyTile.y + moveY;

    // 检查是否可以移动
    if (!this.mapSystem.isWall(targetX, targetY) && !this.isOccupied(world, targetX, targetY)) {
      const targetPos = tileToWorld(targetX, targetY, this.tileSize);
      MovementSystem.setTarget(enemyTransform, targetPos.x, targetPos.y);
    }
  }

  private isOccupied(world: World, tileX: number, tileY: number): boolean {
    const entities = world.query('Transform', 'Combatant');
    for (const entity of entities) {
      const transform = world.getComponent<Transform>(entity, 'Transform')!;
      const combatant = world.getComponent<Combatant>(entity, 'Combatant')!;
      
      if (combatant.isDead) continue;
      
      const pos = worldToTile(transform.x, transform.y, this.tileSize);
      if (pos.x === tileX && pos.y === tileY) {
        return true;
      }
    }
    return false;
  }
}

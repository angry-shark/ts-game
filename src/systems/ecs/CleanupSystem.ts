// 清理系统 - 移除死亡的实体和过期效果

import { World, BaseSystem, SystemPriority, Entity } from '@/ecs';
import { Combatant, Sprite, GameStateComponent, EnemyTag } from '@/components';

interface DeathEvent {
  time: number;
}

export class CleanupSystem extends BaseSystem {
  private deathAnimationDuration: number = 0.3;

  constructor() {
    super(SystemPriority.CLEANUP);
  }

  update(world: World, deltaTime: number): void {
    this.processDeathEvents(world, deltaTime);
    this.cleanupDeadEntities(world);
  }

  private processDeathEvents(world: World, deltaTime: number): void {
    const entities = world.query('DeathEvent', 'Combatant');

    for (const entity of entities) {
      const deathEvent = world.getComponent<DeathEvent>(entity, 'DeathEvent')!;
      deathEvent.time += deltaTime;

      if (deathEvent.time >= this.deathAnimationDuration) {
        // 死亡动画完成，可以安全移除
        world.removeComponent(entity, 'DeathEvent');
        
        // 隐藏精灵
        const sprite = world.getComponent<Sprite>(entity, 'Sprite');
        if (sprite?.phaserSprite) {
          sprite.phaserSprite.setVisible(false);
        }

        // 更新游戏状态分数（如果是敌人）
        this.updateScoreOnDeath(world, entity);
      }
    }
  }

  private cleanupDeadEntities(world: World): void {
    const entities = world.query('Combatant');

    for (const entity of entities) {
      const combatant = world.getComponent<Combatant>(entity, 'Combatant')!;
      
      if (combatant.isDead && !world.hasComponent(entity, 'DeathEvent')) {
        // 延迟销毁实体，给死亡动画时间
        // 实际销毁由 World 在合适的时候处理
      }
    }
  }

  private updateScoreOnDeath(world: World, entity: Entity): void {
    const enemyTag = world.getComponent<EnemyTag>(entity, 'EnemyTag');
    if (!enemyTag) return;

    const gameStateEntities = world.query('GameStateComponent');
    for (const gs of gameStateEntities) {
      const gameState = world.getComponent<GameStateComponent>(gs, 'GameStateComponent');
      if (gameState) {
        gameState.score += enemyTag.scoreValue;
      }
    }
  }
}

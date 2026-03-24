// 战斗系统 - 处理伤害和治疗

import { World, BaseSystem, SystemPriority, Entity } from '@/ecs';
import { Stats, Combatant, DamageEvent, HealEvent, createFloatingText, Transform, Sprite } from '@/components';

export class CombatSystem extends BaseSystem {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    super(SystemPriority.COMBAT);
    this.scene = scene;
  }

  update(world: World, deltaTime: number): void {
    this.processDamageEvents(world);
    this.processHealEvents(world);
    this.updateInvulnerability(world, deltaTime);
    this.checkDeath(world);
  }

  private processDamageEvents(world: World): void {
    const entities = world.query('Stats', 'Combatant');

    for (const entity of entities) {
      const damageEvent = world.getComponent<DamageEvent>(entity, 'DamageEvent');
      if (!damageEvent) continue;

      const stats = world.getComponent<Stats>(entity, 'Stats')!;
      const combatant = world.getComponent<Combatant>(entity, 'Combatant')!;
      const transform = world.getComponent<Transform>(entity, 'Transform');
      const sprite = world.getComponent<Sprite>(entity, 'Sprite');

      if (combatant.invulnerable || combatant.isDead) {
        world.removeComponent(entity, 'DamageEvent');
        continue;
      }

      // 计算实际伤害
      const actualDamage = Math.max(1, damageEvent.amount - stats.defense);
      stats.hp = Math.max(0, stats.hp - actualDamage);

      // 创建伤害数字
      if (transform) {
        this.createDamageNumber(transform.x, transform.y, actualDamage, world);
      }

      // 受伤效果
      if (sprite) {
        sprite.tint = 0xff0000;
        setTimeout(() => {
          if (!world.getComponent<Combatant>(entity, 'Combatant')?.isDead) {
            sprite.tint = 0xffffff;
          }
        }, 200);
      }

      // 设置无敌时间
      combatant.invulnerable = true;
      combatant.invulnerableTime = 0.3;

      // 移除事件
      world.removeComponent(entity, 'DamageEvent');
    }
  }

  private processHealEvents(world: World): void {
    const entities = world.query('Stats');

    for (const entity of entities) {
      const healEvent = world.getComponent<HealEvent>(entity, 'HealEvent');
      if (!healEvent) continue;

      const stats = world.getComponent<Stats>(entity, 'Stats')!;
      const transform = world.getComponent<Transform>(entity, 'Transform');

      const actualHeal = Math.min(healEvent.amount, stats.maxHp - stats.hp);
      stats.hp += actualHeal;

      // 创建治疗数字
      if (transform && actualHeal > 0) {
        this.createHealNumber(transform.x, transform.y, actualHeal, world);
      }

      world.removeComponent(entity, 'HealEvent');
    }
  }

  private updateInvulnerability(world: World, deltaTime: number): void {
    const entities = world.query('Combatant');

    for (const entity of entities) {
      const combatant = world.getComponent<Combatant>(entity, 'Combatant')!;
      
      if (combatant.invulnerable) {
        combatant.invulnerableTime -= deltaTime;
        if (combatant.invulnerableTime <= 0) {
          combatant.invulnerable = false;
        }
      }
    }
  }

  private checkDeath(world: World): void {
    const entities = world.query('Stats', 'Combatant');

    for (const entity of entities) {
      const stats = world.getComponent<Stats>(entity, 'Stats')!;
      const combatant = world.getComponent<Combatant>(entity, 'Combatant')!;

      if (stats.hp <= 0 && !combatant.isDead) {
        combatant.isDead = true;
        this.onEntityDeath(world, entity);
      }
    }
  }

  private onEntityDeath(world: World, entity: Entity): void {
    const sprite = world.getComponent<Sprite>(entity, 'Sprite');
    
    if (sprite?.phaserSprite) {
      // 死亡动画
      this.scene.tweens.add({
        targets: sprite.phaserSprite,
        alpha: 0,
        scale: 0,
        duration: 300,
      });
    }

    // 可以触发死亡事件
    world.addComponent(entity, 'DeathEvent', { time: 0 });
  }

  private createDamageNumber(x: number, y: number, damage: number, world: World): void {
    createFloatingTextEntity(world, x, y, damage.toString(), '#ffffff');
  }

  private createHealNumber(x: number, y: number, amount: number, world: World): void {
    createFloatingTextEntity(world, x, y, `+${amount}`, '#4ade80');
  }
}

// 创建浮动文字实体
function createFloatingTextEntity(world: World, x: number, y: number, text: string, color: string): Entity {
  const entity = world.createEntity();
  world.addComponent(entity, 'Transform', { x, y, previousX: x, previousY: y, targetX: null, targetY: null, isMoving: false });
  world.addComponent(entity, 'FloatingText', createFloatingText(text, color));
  return entity;
}

// 导出便捷函数
export function dealDamage(world: World, target: Entity, amount: number, source: Entity): void {
  world.addComponent(target, 'DamageEvent', { amount, source, isCritical: false });
}

export function healEntity(world: World, target: Entity, amount: number): void {
  world.addComponent(target, 'HealEvent', { amount });
}

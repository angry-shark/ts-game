// 战斗系统

import { World, BaseSystem, SystemPriority, Entity } from '@/ecs';
import { Combat, DamageEvent, HealEvent, Attributes } from '@/components';

export class CombatSystem extends BaseSystem {
  constructor() {
    super(SystemPriority.COMBAT);
  }

  update(world: World, deltaTime: number): void {
    // 处理伤害事件
    this.processDamageEvents(world);
    
    // 处理治疗事件
    this.processHealEvents(world);
    
    // 更新战斗状态
    this.updateCombatStates(world, deltaTime);
  }

  private processDamageEvents(world: World): void {
    const entities = world.query('DamageEvent', 'Combat');

    for (const entity of entities) {
      const damageEvent = world.getComponent<DamageEvent>(entity, 'DamageEvent');
      if (!damageEvent) continue;

      const combat = world.getComponent<Combat>(damageEvent.target, 'Combat');
      if (!combat) continue;

      // 计算实际伤害
      let damage = damageEvent.amount;
      
      // 应用防御减免
      const targetAttrs = world.getComponent<Attributes>(damageEvent.target, 'Attributes');
      if (targetAttrs) {
        const reduction = targetAttrs.defense / (targetAttrs.defense + 100);
        damage = damage * (1 - reduction);
      }

      // 应用伤害
      combat.hp = Math.max(0, combat.hp - damage);

      // 设置战斗状态
      combat.inCombat = true;
      
      // 移除事件
      world.removeComponent(entity, 'DamageEvent');
    }
  }

  private processHealEvents(world: World): void {
    const entities = world.query('HealEvent', 'Combat');

    for (const entity of entities) {
      const healEvent = world.getComponent<HealEvent>(entity, 'HealEvent');
      if (!healEvent) continue;

      const combat = world.getComponent<Combat>(healEvent.target, 'Combat');
      const attrs = world.getComponent<Attributes>(healEvent.target, 'Attributes');
      
      if (combat && attrs) {
        combat.hp = Math.min(attrs.maxHp, combat.hp + healEvent.amount);
      }

      world.removeComponent(entity, 'HealEvent');
    }
  }

  private updateCombatStates(world: World, deltaTime: number): void {
    const entities = world.query('Combat');

    for (const entity of entities) {
      const combat = world.getComponent<Combat>(entity, 'Combat')!;
      const attrs = world.getComponent<Attributes>(entity, 'Attributes');

      if (!attrs) continue;

      // 灵气回复
      combat.qi = Math.min(attrs.maxQi, combat.qi + attrs.qiRegen * deltaTime);

      // 检查死亡
      if (combat.hp <= 0) {
        combat.hp = 0;
        combat.inCombat = false;
      }
    }
  }

  // 造成伤害的便捷方法
  static dealDamage(
    world: World,
    source: Entity,
    target: Entity,
    amount: number,
    type: 'physical' | 'magical' | 'true' = 'physical',
    skillId?: string
  ): void {
    const sourceAttrs = world.getComponent<Attributes>(source, 'Attributes');
    
    let finalDamage = amount;
    let isCrit = false;

    // 计算暴击
    if (sourceAttrs && Math.random() < sourceAttrs.critRate) {
      finalDamage *= sourceAttrs.critDamage;
      isCrit = true;
    }

    world.addComponent(source, 'DamageEvent', {
      source,
      target,
      amount: finalDamage,
      type,
      isCrit,
      skillId,
    });
  }
}

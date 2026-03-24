// 属性计算系统 - 根据境界和装备计算最终属性

import { World, BaseSystem, SystemPriority } from '@/ecs';
import { Cultivation, Attributes, calculateAttributesByRealm } from '@/components/core';
import { calculateEquipmentStats } from '@/components/items';

export class AttributeSystem extends BaseSystem {
  constructor() {
    super(SystemPriority.INPUT);
  }

  update(world: World, _deltaTime: number): void {
    const entities = world.query('Cultivation', 'Attributes');

    for (const entity of entities) {
      const cultivation = world.getComponent<Cultivation>(entity, 'Cultivation')!;
      const attributes = world.getComponent<Attributes>(entity, 'Attributes')!;
      const equipment = world.getComponent(entity, 'Equipment');

      // 计算基础属性（来自境界）
      const baseAttrs = calculateAttributesByRealm(
        cultivation.realm, 
        cultivation.stage
      );

      // 计算装备属性（如果没有装备组件则返回0）
      let equipAttrs = { attack: 0, defense: 0, maxHp: 0, maxQi: 0, critRate: 0, moveSpeed: 0 };
      if (equipment) {
        const stats = calculateEquipmentStats(equipment);
        equipAttrs = stats;
      }

      // 合并属性
      attributes.maxHp = (baseAttrs.maxHp || 100) + equipAttrs.maxHp;
      attributes.maxQi = (baseAttrs.maxQi || 100) + equipAttrs.maxQi;
      attributes.attack = (baseAttrs.attack || 10) + equipAttrs.attack;
      attributes.defense = (baseAttrs.defense || 5) + equipAttrs.defense;
      attributes.critRate = 0.05 + equipAttrs.critRate;
      attributes.moveSpeed = 150 + equipAttrs.moveSpeed;
    }
  }
}

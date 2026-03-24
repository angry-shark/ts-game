// 装备组件

import type { Item } from './Inventory';

export interface Equipment {
  weapon: Item | null;     // 法宝
  armor: Item | null;      // 防具
  accessory1: Item | null; // 饰品1
  accessory2: Item | null; // 饰品2
}

export function createEquipment(): Equipment {
  return {
    weapon: null,
    armor: null,
    accessory1: null,
    accessory2: null,
  };
}

// 计算装备总属性
export function calculateEquipmentStats(equipment: Partial<Equipment>): {
  attack: number;
  defense: number;
  maxHp: number;
  maxQi: number;
  critRate: number;
  moveSpeed: number;
} {
  const stats = {
    attack: 0,
    defense: 0,
    maxHp: 0,
    maxQi: 0,
    critRate: 0,
    moveSpeed: 0,
  };
  
  const items = [equipment.weapon, equipment.armor, 
                 equipment.accessory1, equipment.accessory2];
  
  for (const item of items) {
    if (item?.stats) {
      stats.attack += item.stats.attack || 0;
      stats.defense += item.stats.defense || 0;
      stats.maxHp += item.stats.maxHp || 0;
      stats.maxQi += item.stats.maxQi || 0;
      stats.critRate += item.stats.critRate || 0;
      stats.moveSpeed += item.stats.moveSpeed || 0;
    }
  }
  
  return stats;
}

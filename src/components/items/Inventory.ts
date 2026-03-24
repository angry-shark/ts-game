// 背包组件

export type ItemType = 
  | 'weapon'      // 法宝
  | 'armor'       // 防具
  | 'accessory'   // 饰品
  | 'pill'        // 丹药
  | 'material'    // 材料
  | 'skillBook'   // 功法
  | 'treasure';   // 宝物

export type ItemQuality = 
  | 'common'      // 白
  | 'uncommon'    // 绿
  | 'rare'        // 蓝
  | 'epic'        // 紫
  | 'legendary'   // 橙
  | 'mythic';     // 红

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  quality: ItemQuality;
  level: number;        // 使用等级要求
  
  // 堆叠信息
  stackable: boolean;
  count: number;
  maxStack: number;
  
  // 属性加成
  stats?: {
    attack?: number;
    defense?: number;
    maxHp?: number;
    maxQi?: number;
    critRate?: number;
    moveSpeed?: number;
  };
  
  // 特殊效果
  effects?: string[];
}

export interface Inventory {
  capacity: number;
  items: (Item | null)[];
  gold: number;
  spiritStones: number;  // 灵石
}

export function createInventory(capacity: number = 50): Inventory {
  return {
    capacity,
    items: new Array(capacity).fill(null),
    gold: 0,
    spiritStones: 100,
  };
}

// 获取品质颜色
export function getQualityColor(quality: ItemQuality): string {
  const colors: Record<ItemQuality, string> = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f97316',
    mythic: '#ef4444',
  };
  return colors[quality];
}

// 获取品质中文名
export function getQualityName(quality: ItemQuality): string {
  const names: Record<ItemQuality, string> = {
    common: '普通',
    uncommon: '精良',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
    mythic: '神话',
  };
  return names[quality];
}

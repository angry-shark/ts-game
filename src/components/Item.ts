// 物品组件

export interface Item {
  type: 'potion' | 'coin' | 'weapon' | 'armor';
  value: number;
  isCollected: boolean;
}

export function createItem(type: Item['type'], value: number): Item {
  return {
    type,
    value,
    isCollected: false,
  };
}

// 拾取事件
export interface PickupEvent {
  collector: number; // 实体 ID
}

// 背包组件
export interface Inventory {
  items: number[]; // 实体 ID 列表
  maxSize: number;
}

export function createInventory(maxSize = 10): Inventory {
  return {
    items: [],
    maxSize,
  };
}

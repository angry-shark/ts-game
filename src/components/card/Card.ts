// 卡牌组件 - 杀戮尖塔风格

export type CardType = 'attack' | 'skill' | 'power' | 'status';
export type CardRarity = 'common' | 'uncommon' | 'rare';
export type CardTarget = 'enemy' | 'self' | 'all_enemies' | 'none';

export interface Card {
  id: string;
  name: string;
  description: string;
  type: CardType;
  rarity: CardRarity;
  
  // 费用
  cost: number;
  upgradedCost?: number;
  
  // 目标
  target: CardTarget;
  
  // 数值
  damage?: number;
  block?: number;
  
  // 升级后数值
  upgradedDamage?: number;
  upgradedBlock?: number;
  
  // 效果
  effects: CardEffect[];
  
  // 状态
  upgraded: boolean;
  ethereal: boolean;    // 虚无（回合结束丢弃）
  exhaust: boolean;     // 消耗（打出后移出战斗）
  innate: boolean;      // 固有（开局加入手牌）
}

export interface CardEffect {
  type: 'damage' | 'block' | 'heal' | 'draw' | 'energy' | 'buff' | 'debuff' | 'vulnerable' | 'weak' | 'frail' | 'poison' | 'strength' | 'dexterity';
  value: number;
  target?: 'self' | 'enemy';
}

// 创建基础打击牌（调试版本 - 高伤害）
export function createStrike(upgraded: boolean = false): Card {
  return {
    id: 'strike',
    name: upgraded ? '打击+' : '打击',
    description: upgraded ? '造成99点伤害。' : '造成50点伤害。',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    target: 'enemy',
    damage: upgraded ? 99 : 50,
    upgradedDamage: 99,
    effects: [{ type: 'damage', value: upgraded ? 99 : 50 }],
    upgraded,
    ethereal: false,
    exhaust: false,
    innate: false,
  };
}

// 创建基础防御牌
export function createDefend(upgraded: boolean = false): Card {
  return {
    id: 'defend',
    name: upgraded ? '防御+' : '防御',
    description: upgraded ? '获得8点格挡。' : '获得5点格挡。',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    target: 'self',
    block: upgraded ? 8 : 5,
    upgradedBlock: 8,
    effects: [{ type: 'block', value: upgraded ? 8 : 5, target: 'self' }],
    upgraded,
    ethereal: false,
    exhaust: false,
    innate: false,
  };
}

// 创建重击牌
export function createBash(upgraded: boolean = false): Card {
  return {
    id: 'bash',
    name: upgraded ? '重击+' : '重击',
    description: upgraded ? '造成10点伤害。给予2层易伤。' : '造成8点伤害。给予2层易伤。',
    type: 'attack',
    rarity: 'common',
    cost: 2,
    target: 'enemy',
    damage: upgraded ? 10 : 8,
    effects: [
      { type: 'damage', value: upgraded ? 10 : 8 },
      { type: 'vulnerable', value: 2, target: 'enemy' },
    ],
    upgraded,
    ethereal: false,
    exhaust: false,
    innate: false,
  };
}

// 创建伤口（诅咒牌）
export function createWound(): Card {
  return {
    id: 'wound',
    name: '伤口',
    description: '无法打出。',
    type: 'status',
    rarity: 'common',
    cost: 999,
    target: 'none',
    effects: [],
    upgraded: false,
    ethereal: false,
    exhaust: false,
    innate: false,
  } as Card;
}

// 升级卡牌
export function upgradeCard(card: Card): Card {
  if (card.upgraded) return card;
  
  const upgraded = { ...card, upgraded: true };
  
  if (card.upgradedCost !== undefined) {
    upgraded.cost = card.upgradedCost;
  }
  if (card.upgradedDamage !== undefined) {
    upgraded.damage = card.upgradedDamage;
  }
  if (card.upgradedBlock !== undefined) {
    upgraded.block = card.upgradedBlock;
  }
  
  // 更新效果数值
  upgraded.effects = card.effects.map(effect => {
    if (effect.type === 'damage' && card.upgradedDamage) {
      return { ...effect, value: card.upgradedDamage };
    }
    if (effect.type === 'block' && card.upgradedBlock) {
      return { ...effect, value: card.upgradedBlock };
    }
    return effect;
  });
  
  return upgraded;
}

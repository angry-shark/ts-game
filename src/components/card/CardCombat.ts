// 卡牌战斗状态组件

// Deck type imported when needed

export interface CardCombatState {
  // 能量
  energy: number;
  maxEnergy: number;
  
  // 生命值
  hp: number;
  maxHp: number;
  
  // 格挡
  block: number;
  
  // 回合
  turn: number;
  isPlayerTurn: boolean;
  combatEnded: boolean;
  victory: boolean;
  
  // 状态效果
  buffs: Buff[];
  debuffs: Debuff[];
}

export interface Buff {
  type: 'strength' | 'dexterity' | 'ritual' | 'regen' | 'artifact' | 'barricade' | 'berserk' | 'brutality';
  amount: number;
  duration: number; // 0 = 永久
}

export interface Debuff {
  type: 'vulnerable' | 'weak' | 'frail' | 'poison' | 'bleed' | 'stun';
  amount: number;
  duration: number;
}

export function createCardCombatState(maxHp: number, maxEnergy: number = 3): CardCombatState {
  return {
    energy: maxEnergy,
    maxEnergy,
    hp: maxHp,
    maxHp,
    block: 0,
    turn: 1,
    isPlayerTurn: true,
    combatEnded: false,
    victory: false,
    buffs: [],
    debuffs: [],
  };
}

// 添加buff
export function addBuff(state: CardCombatState, type: Buff['type'], amount: number, duration: number = 0): void {
  const existing = state.buffs.find(b => b.type === type);
  if (existing) {
    existing.amount += amount;
    if (duration > 0) {
      existing.duration = Math.max(existing.duration, duration);
    }
  } else {
    state.buffs.push({ type, amount, duration });
  }
}

// 添加debuff
export function addDebuff(state: CardCombatState, type: Debuff['type'], amount: number, duration: number): void {
  const existing = state.debuffs.find(d => d.type === type);
  if (existing) {
    existing.amount += amount;
    existing.duration = Math.max(existing.duration, duration);
  } else {
    state.debuffs.push({ type, amount, duration });
  }
}

// 获取力量值
export function getStrength(state: CardCombatState): number {
  const strength = state.buffs.find(b => b.type === 'strength');
  const weak = state.debuffs.find(d => d.type === 'weak');
  
  let value = strength?.amount || 0;
  if (weak) {
    value = Math.floor(value * 0.75); // 虚弱减少25%伤害加成
  }
  
  return value;
}

// 获取敏捷值
export function getDexterity(state: CardCombatState): number {
  const dex = state.buffs.find(b => b.type === 'dexterity');
  const frail = state.debuffs.find(d => d.type === 'frail');
  
  let value = dex?.amount || 0;
  if (frail) {
    value = Math.floor(value * 0.75); // 脆弱减少25%格挡加成
  }
  
  return value;
}

// 回合结束处理
export function endTurnEffects(state: CardCombatState): void {
  // 失去格挡（如果有 barricade buff 则保留）
  if (!state.buffs.find(b => b.type === 'barricade')) {
    state.block = 0;
  }
  
  // 毒伤
  const poison = state.debuffs.find(d => d.type === 'poison');
  if (poison && poison.amount > 0) {
    state.hp -= poison.amount;
    poison.amount--;
  }
  
  // 减少buff/debuff持续时间
  state.buffs = state.buffs.filter(b => b.duration === 0 || --b.duration > 0);
  state.debuffs = state.debuffs.filter(d => --d.duration > 0);
}

// 计算受到的伤害（考虑格挡和易伤）
export function calculateIncomingDamage(state: CardCombatState, baseDamage: number): number {
  let damage = baseDamage;
  
  // 易伤增加50%伤害
  const vulnerable = state.debuffs.find(d => d.type === 'vulnerable');
  if (vulnerable) {
    damage = Math.floor(damage * 1.5);
  }
  
  // 先扣格挡
  if (state.block > 0) {
    const blocked = Math.min(state.block, damage);
    state.block -= blocked;
    damage -= blocked;
  }
  
  return damage;
}

// 计算造成的伤害（考虑力量）
export function calculateOutgoingDamage(state: CardCombatState, baseDamage: number): number {
  let damage = baseDamage + getStrength(state);
  
  // 虚弱减少25%伤害
  const weak = state.debuffs.find(d => d.type === 'weak');
  if (weak) {
    damage = Math.floor(damage * 0.75);
  }
  
  return damage;
}

// 计算格挡值（考虑敏捷）
export function calculateBlock(state: CardCombatState, baseBlock: number): number {
  return baseBlock + getDexterity(state);
}

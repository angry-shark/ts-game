// 战斗相关组件

export interface Stats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
}

export function createStats(hp: number, attack: number, defense: number): Stats {
  return {
    hp,
    maxHp: hp,
    attack,
    defense,
  };
}

// 战斗标记组件
export interface Combatant {
  team: 'player' | 'enemy' | 'neutral';
  isDead: boolean;
  invulnerable: boolean;
  invulnerableTime: number;
}

export function createCombatant(team: 'player' | 'enemy' | 'neutral'): Combatant {
  return {
    team,
    isDead: false,
    invulnerable: false,
    invulnerableTime: 0,
  };
}

// 伤害事件组件（一次性，处理后移除）
export interface DamageEvent {
  amount: number;
  source: number; // 实体 ID
  isCritical: boolean;
}

// 治疗效果组件
export interface HealEvent {
  amount: number;
}

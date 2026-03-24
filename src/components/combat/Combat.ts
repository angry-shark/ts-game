// 战斗状态组件

export interface Combat {
  inCombat: boolean;
  target: number | null;  // 目标实体ID
  
  // 战斗属性
  hp: number;
  maxHp: number;
  qi: number;
  maxQi: number;
  
  // 临时状态
  isInvulnerable: boolean;  // 无敌
  isStunned: boolean;       // 眩晕
  isSilenced: boolean;      // 沉默
  
  // 连击计数
  comboCount: number;
  lastHitTime: number;
}

export function createCombat(maxHp: number, maxQi: number): Combat {
  return {
    inCombat: false,
    target: null,
    hp: maxHp,
    maxHp: maxHp,
    qi: maxQi,
    maxQi: maxQi,
    isInvulnerable: false,
    isStunned: false,
    isSilenced: false,
    comboCount: 0,
    lastHitTime: 0,
  };
}

// 伤害事件（用于ECS事件系统）
export interface DamageEvent {
  source: number;       // 攻击者ID
  target: number;       // 目标ID
  amount: number;       // 伤害数值
  type: 'physical' | 'magical' | 'true';
  isCrit: boolean;
  skillId?: string;     // 使用的技能ID
}

// 治疗事件
export interface HealEvent {
  source: number;
  target: number;
  amount: number;
}

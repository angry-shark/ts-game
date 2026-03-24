// 属性组件 - 战斗属性

export interface Attributes {
  // 基础属性
  maxHp: number;
  maxQi: number;
  
  // 战斗属性
  attack: number;       // 攻击力
  defense: number;      // 防御力
  critRate: number;     // 暴击率 (0-1)
  critDamage: number;   // 暴击伤害 (1.5 = 150%)
  
  // 移动属性
  moveSpeed: number;    // 移动速度
  
  // 特殊属性
  qiRegen: number;      // 灵气回复
  damageReduction: number; // 伤害减免 (0-1)
  
  // 元素亲和
  elements: {
    metal: number;  // 金
    wood: number;   // 木
    water: number;  // 水
    fire: number;   // 火
    earth: number;  // 土
  };
}

export function createAttributes(): Attributes {
  return {
    maxHp: 100,
    maxQi: 100,
    attack: 10,
    defense: 5,
    critRate: 0.05,
    critDamage: 1.5,
    moveSpeed: 150,
    qiRegen: 1,
    damageReduction: 0,
    elements: {
      metal: 0,
      wood: 0,
      water: 0,
      fire: 0,
      earth: 0,
    },
  };
}

// 根据境界计算基础属性
export function calculateAttributesByRealm(realm: string, stage: number): Partial<Attributes> {
  const realmIndex = ['mortal', 'qiRefining', 'foundation', 'crystallization', 'goldenCore', 
                      'nascentSoul', 'deityTransformation', 'enlightenment', 'ascension', 'immortal']
                      .indexOf(realm);
  
  const multiplier = Math.pow(1.5, realmIndex) * (1 + (stage - 1) * 0.2);
  
  return {
    maxHp: Math.floor(100 * multiplier),
    maxQi: Math.floor(100 * multiplier),
    attack: Math.floor(10 * multiplier),
    defense: Math.floor(5 * multiplier),
  };
}

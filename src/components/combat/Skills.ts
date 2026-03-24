// 技能组件 - 功法技能系统

export type SkillType = 'active' | 'passive' | 'movement' | 'ultimate';
export type ElementType = 'metal' | 'wood' | 'water' | 'fire' | 'earth' | 'wind' | 'none';
export type CultivationPath = 
  | 'sword'      // 剑修
  | 'blade'      // 刀修
  | 'fist'       // 拳修
  | 'finger'     // 指修
  | 'thunder'    // 雷修
  | 'fire'       // 火修
  | 'water'      // 水修
  | 'earth'      // 土修
  | 'wind'       // 风修
  | 'wood';      // 木修

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  path: CultivationPath;
  element: ElementType;
  
  // 使用条件
  requiredRealm: string;    // 最低境界要求
  qiCost: number;           // 灵气消耗
  cooldown: number;         // 冷却时间(秒)
  currentCooldown: number;  // 当前冷却
  
  // 效果参数
  damage: number;           // 基础伤害
  damageType: 'physical' | 'magical' | 'true';
  range: number;            // 射程
  area: number;             // 范围
  duration: number;         // 持续时间
  
  // 特殊效果
  effects: SkillEffect[];
}

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'control' | 'dash';
  target: 'self' | 'enemy' | 'area';
  value: number;
  duration: number;
}

export interface Skills {
  activeSkills: (Skill | null)[];    // 4个主动技能槽
  passiveSkills: (Skill | null)[];   // 4个被动技能槽
  movementSkill: Skill | null;       // 身法
  ultimateSkill: Skill | null;       // 神通
  
  // 当前激活的功法流派
  mainPath: CultivationPath;
  secondaryPath: CultivationPath | null;
}

export function createSkills(mainPath: CultivationPath = 'sword'): Skills {
  return {
    activeSkills: [null, null, null, null],
    passiveSkills: [null, null, null, null],
    movementSkill: null,
    ultimateSkill: null,
    mainPath,
    secondaryPath: null,
  };
}

// 获取流派中文名
export function getPathName(path: CultivationPath): string {
  const names: Record<CultivationPath, string> = {
    sword: '剑修',
    blade: '刀修',
    fist: '拳修',
    finger: '指修',
    thunder: '雷修',
    fire: '火修',
    water: '水修',
    earth: '土修',
    wind: '风修',
    wood: '木修',
  };
  return names[path];
}

// 创建基础技能
export function createBasicSkill(path: CultivationPath): Skill {
  const basicSkills: Record<CultivationPath, Partial<Skill>> = {
    sword: { name: '剑气', damage: 15, range: 150, element: 'metal' },
    blade: { name: '刀芒', damage: 20, range: 100, element: 'metal' },
    fist: { name: '拳劲', damage: 12, range: 80, element: 'earth' },
    finger: { name: '指风', damage: 10, range: 200, element: 'wind' },
    thunder: { name: '雷击', damage: 18, range: 180, element: 'metal' },
    fire: { name: '火球', damage: 22, range: 160, element: 'fire' },
    water: { name: '水弹', damage: 12, range: 150, element: 'water' },
    earth: { name: '石击', damage: 16, range: 120, element: 'earth' },
    wind: { name: '风刃', damage: 14, range: 170, element: 'wind' },
    wood: { name: '荆棘', damage: 13, range: 140, element: 'wood' },
  };
  
  const base = basicSkills[path];
  
  return {
    id: `${path}_basic`,
    name: base.name || '普通攻击',
    description: `基础的${getPathName(path)}攻击`,
    type: 'active',
    path,
    element: base.element || 'none',
    requiredRealm: 'qiRefining',
    qiCost: 5,
    cooldown: 0.5,
    currentCooldown: 0,
    damage: base.damage || 10,
    damageType: 'magical',
    range: base.range || 100,
    area: 0,
    duration: 0,
    effects: [],
  };
}

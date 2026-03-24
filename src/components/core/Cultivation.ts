// 修炼境界组件 - 鬼谷八荒境界系统

export type Realm =
  | 'mortal'      // 凡人
  | 'qiRefining'  // 炼气
  | 'foundation'  // 筑基
  | 'crystallization' // 结晶
  | 'goldenCore'  // 金丹
  | 'nascentSoul' // 元婴
  | 'deityTransformation' // 化神
  | 'enlightenment' // 悟道
  | 'ascension'   // 羽化
  | 'immortal';   // 登仙

export const REALM_ORDER: Realm[] = [
  'mortal',
  'qiRefining',
  'foundation',
  'crystallization',
  'goldenCore',
  'nascentSoul',
  'deityTransformation',
  'enlightenment',
  'ascension',
  'immortal',
];

export interface Cultivation {
  realm: Realm;
  stage: number;        // 小境界 (1-3 前期/中期/后期)
  qi: number;           // 当前灵气
  maxQi: number;        // 灵气上限
  comprehension: number; // 悟性 (影响修炼速度)
  breakthroughProgress: number; // 突破进度 (0-100)
  isInBreakthrough: boolean;    // 是否正在突破
}

export function createCultivation(): Cultivation {
  return {
    realm: 'qiRefining',
    stage: 1,
    qi: 100,
    maxQi: 100,
    comprehension: 10,
    breakthroughProgress: 0,
    isInBreakthrough: false,
  };
}

// 获取境界中文名
export function getRealmName(realm: Realm): string {
  const names: Record<Realm, string> = {
    mortal: '凡人',
    qiRefining: '炼气',
    foundation: '筑基',
    crystallization: '结晶',
    goldenCore: '金丹',
    nascentSoul: '元婴',
    deityTransformation: '化神',
    enlightenment: '悟道',
    ascension: '羽化',
    immortal: '登仙',
  };
  return names[realm];
}

// 获取境界阶段名
export function getStageName(stage: number): string {
  const stages = ['', '前期', '中期', '后期'];
  return stages[stage] || '';
}

// 计算突破所需灵气
export function getBreakthroughRequirement(realm: Realm): number {
  const requirements: Record<Realm, number> = {
    mortal: 0,
    qiRefining: 1000,
    foundation: 5000,
    crystallization: 20000,
    goldenCore: 50000,
    nascentSoul: 100000,
    deityTransformation: 200000,
    enlightenment: 500000,
    ascension: 1000000,
    immortal: Infinity,
  };
  return requirements[realm];
}

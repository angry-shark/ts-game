// 身份信息组件

export interface Identity {
  name: string;
  age: number;
  lifespan: number;     // 寿元
  gender: 'male' | 'female';
  title: string;        // 称号
  background: string;   // 出身背景
}

export function createIdentity(name: string, gender: 'male' | 'female' = 'male'): Identity {
  return {
    name,
    age: 18,
    lifespan: 80,
    gender,
    title: '无名小卒',
    background: '散修',
  };
}

// 获取剩余寿元
export function getRemainingLifespan(identity: Identity): number {
  return identity.lifespan - identity.age;
}

// 根据境界增加寿元
export function increaseLifespanByRealm(identity: Identity, realm: string): void {
  const lifespanBonus: Record<string, number> = {
    qiRefining: 10,
    foundation: 30,
    crystallization: 50,
    goldenCore: 100,
    nascentSoul: 200,
    deityTransformation: 300,
    enlightenment: 500,
    ascension: 800,
    immortal: 1000,
  };
  
  const bonus = lifespanBonus[realm] || 0;
  identity.lifespan += bonus;
}

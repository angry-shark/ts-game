// 核心组件导出

export type { Realm, Cultivation } from './Cultivation';
export { 
  createCultivation, 
  getRealmName, 
  getStageName, 
  getBreakthroughRequirement,
  REALM_ORDER 
} from './Cultivation';

export type { Attributes } from './Attributes';
export { createAttributes, calculateAttributesByRealm } from './Attributes';

export type { Identity } from './Identity';
export { createIdentity, getRemainingLifespan, increaseLifespanByRealm } from './Identity';

export type { Transform } from './Transform';
export { createTransform, distance, angleTo } from './Transform';

export type { Vision, Wall } from './Vision';
export { createVision, createWall } from './Vision';

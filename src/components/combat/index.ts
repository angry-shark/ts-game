// 战斗组件导出

export type { Skill, SkillEffect, Skills, SkillType, ElementType, CultivationPath } from './Skills';
export { 
  createSkills, 
  getPathName, 
  createBasicSkill 
} from './Skills';

export type { Combat, DamageEvent, HealEvent } from './Combat';
export { createCombat } from './Combat';

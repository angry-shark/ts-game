// 技能系统

import { World, BaseSystem, SystemPriority, Entity } from '@/ecs';
import { Skill, Skills, Combat, Transform } from '@/components';
import { CombatSystem } from './CombatSystem';

export class SkillSystem extends BaseSystem {
  constructor() {
    super(SystemPriority.COMBAT + 10);
  }

  update(world: World, deltaTime: number): void {
    // 更新技能冷却
    this.updateCooldowns(world, deltaTime);
    
    // 处理技能释放请求
    this.processSkillCasts(world);
  }

  private updateCooldowns(world: World, deltaTime: number): void {
    const entities = world.query('Skills');

    for (const entity of entities) {
      const skills = world.getComponent<Skills>(entity, 'Skills')!;

      // 更新所有技能的冷却
      const allSkills = [
        ...skills.activeSkills.filter(Boolean),
        ...skills.passiveSkills.filter(Boolean),
        skills.movementSkill,
        skills.ultimateSkill,
      ];

      for (const skill of allSkills) {
        if (skill && skill.currentCooldown > 0) {
          skill.currentCooldown = Math.max(0, skill.currentCooldown - deltaTime);
        }
      }
    }
  }

  private processSkillCasts(world: World): void {
    const entities = world.query('SkillCastRequest', 'Skills', 'Combat', 'Transform');

    for (const entity of entities) {
      const request = world.getComponent<{ skillIndex: number; target?: Entity }>(
        entity, 
        'SkillCastRequest'
      );
      if (!request) continue;

      const skills = world.getComponent<Skills>(entity, 'Skills')!;
      const combat = world.getComponent<Combat>(entity, 'Combat')!;
      const transform = world.getComponent<Transform>(entity, 'Transform')!;

      const skill = skills.activeSkills[request.skillIndex];
      if (!skill) continue;

      // 检查释放条件
      if (!this.canCastSkill(skill, combat)) {
        world.removeComponent(entity, 'SkillCastRequest');
        continue;
      }

      // 执行技能效果
      this.executeSkill(world, entity, skill, request.target, transform);

      // 设置冷却
      skill.currentCooldown = skill.cooldown;
      combat.qi -= skill.qiCost;

      world.removeComponent(entity, 'SkillCastRequest');
    }
  }

  private canCastSkill(skill: Skill, combat: Combat): boolean {
    return (
      skill.currentCooldown <= 0 &&
      combat.qi >= skill.qiCost &&
      !combat.isStunned &&
      !combat.isSilenced
    );
  }

  private executeSkill(
    world: World,
    caster: Entity,
    skill: Skill,
    target: Entity | undefined,
    transform: Transform
  ): void {
    // 根据技能类型执行不同效果
    switch (skill.type) {
      case 'active':
        this.executeActiveSkill(world, caster, skill, target);
        break;
      case 'movement':
        this.executeMovementSkill(world, caster, skill, transform);
        break;
      case 'ultimate':
        this.executeUltimateSkill(world, caster, skill, target);
        break;
    }
  }

  private executeActiveSkill(
    world: World,
    caster: Entity,
    skill: Skill,
    target: Entity | undefined
  ): void {
    if (!target) return;

    // 造成伤害
    CombatSystem.dealDamage(
      world,
      caster,
      target,
      skill.damage,
      skill.damageType,
      skill.id
    );

    // 应用技能效果
    for (const effect of skill.effects) {
      this.applyEffect(world, caster, target, effect);
    }
  }

  private executeMovementSkill(
    _world: World,
    _caster: Entity,
    skill: Skill,
    transform: Transform
  ): void {
    // 位移效果
    const dashDistance = skill.range;
    transform.x += Math.cos(transform.rotation) * dashDistance;
    transform.y += Math.sin(transform.rotation) * dashDistance;
  }

  private executeUltimateSkill(
    world: World,
    caster: Entity,
    skill: Skill,
    target: Entity | undefined
  ): void {
    // 神通通常是大范围高伤害
    if (target) {
      CombatSystem.dealDamage(
        world,
        caster,
        target,
        skill.damage * 2, // 神通伤害加成
        skill.damageType,
        skill.id
      );
    }
  }

  private applyEffect(
    _world: World,
    _caster: Entity,
    target: Entity,
    effect: { type: string; target: string; value: number; duration: number }
  ): void {
    // 根据效果类型应用
    switch (effect.type) {
      case 'heal':
        const combat = _world.getComponent<Combat>(target, 'Combat');
        if (combat) {
          combat.hp += effect.value;
        }
        break;
      case 'buff':
        // 添加buff逻辑
        break;
      case 'debuff':
        // 添加debuff逻辑
        break;
    }
  }

  // 请求释放技能的便捷方法
  static castSkill(
    world: World,
    entity: Entity,
    skillIndex: number,
    target?: Entity
  ): void {
    world.addComponent(entity, 'SkillCastRequest', { skillIndex, target });
  }
}

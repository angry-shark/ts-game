// 实体工厂 - 创建游戏实体

import { World, Entity } from '@/ecs';
import {
  createTransform, createSprite, createCultivation,
  createAttributes, createIdentity, createCombat,
  createSkills, createInventory, createEquipment,
  createAnimation, createVision, createWall, CultivationPath,
} from '@/components';

export class EntityFactory {
  private world: World;

  constructor(world: World, _scene: Phaser.Scene) {
    this.world = world;
  }

  // 创建玩家
  createPlayer(x: number, y: number, name: string, path: CultivationPath = 'sword'): Entity {
    const entity = this.world.createEntity();

    // 核心组件
    this.world.addComponent(entity, 'Transform', createTransform(x, y));
    this.world.addComponent(entity, 'Sprite', createSprite('player'));
    this.world.addComponent(entity, 'Animation', createAnimation());
    this.world.addComponent(entity, 'Identity', createIdentity(name));
    this.world.addComponent(entity, 'Cultivation', createCultivation());
    this.world.addComponent(entity, 'Attributes', createAttributes());
    this.world.addComponent(entity, 'Combat', createCombat(100, 100));
    this.world.addComponent(entity, 'Skills', createSkills(path));
    this.world.addComponent(entity, 'Inventory', createInventory());
    this.world.addComponent(entity, 'Equipment', createEquipment());
    this.world.addComponent(entity, 'Vision', createVision());
    this.world.addComponent(entity, 'PlayerTag', {});

    return entity;
  }

  // 创建敌人
  createEnemy(x: number, y: number, name: string, level: number): Entity {
    const entity = this.world.createEntity();

    this.world.addComponent(entity, 'Transform', createTransform(x, y));
    this.world.addComponent(entity, 'Sprite', createSprite('enemy'));
    this.world.addComponent(entity, 'Animation', createAnimation());
    this.world.addComponent(entity, 'Identity', createIdentity(name));
    this.world.addComponent(entity, 'Cultivation', createCultivation());
    this.world.addComponent(entity, 'Attributes', createAttributes());
    this.world.addComponent(entity, 'Combat', createCombat(80 + level * 10, 80));
    this.world.addComponent(entity, 'EnemyTag', { level });

    return entity;
  }

  // 创建NPC
  createNPC(x: number, y: number, name: string): Entity {
    const entity = this.world.createEntity();

    this.world.addComponent(entity, 'Transform', createTransform(x, y));
    this.world.addComponent(entity, 'Sprite', createSprite('npc'));
    this.world.addComponent(entity, 'Animation', createAnimation());
    this.world.addComponent(entity, 'Identity', createIdentity(name));
    this.world.addComponent(entity, 'NPCTag', {});

    return entity;
  }

  // 创建墙体
  createWall(x: number, y: number, blockRadius: number = 24): Entity {
    const entity = this.world.createEntity();

    this.world.addComponent(entity, 'Transform', createTransform(x, y));
    this.world.addComponent(entity, 'Sprite', createSprite('wall'));
    this.world.addComponent(entity, 'Animation', createAnimation());
    this.world.addComponent(entity, 'Wall', createWall(blockRadius));

    return entity;
  }

  // 创建技能弹道
  createProjectile(
    x: number,
    y: number,
    rotation: number,
    skillId: string,
    owner: Entity
  ): Entity {
    const entity = this.world.createEntity();

    const transform = createTransform(x, y);
    transform.rotation = rotation;

    this.world.addComponent(entity, 'Transform', transform);
    this.world.addComponent(entity, 'Sprite', createSprite('projectile'));
    this.world.addComponent(entity, 'Animation', createAnimation());
    this.world.addComponent(entity, 'Projectile', { skillId, owner, speed: 300 });

    return entity;
  }
}

// 实体工厂 - 创建游戏实体

import { World, Entity } from '@/ecs';
import {
  createTransform, createSprite, createStats, createCombatant,
  createAI, createTurnBased, createItem, createEnemyTag,
  Transform, Sprite, Stats, Combatant, AI, TurnBased, Item,
} from '@/components';

export class EntityFactory {
  private world: World;

  constructor(world: World, _scene: Phaser.Scene) {
    this.world = world;
  }

  // 创建玩家
  createPlayer(x: number, y: number): Entity {
    const entity = this.world.createEntity();

    this.world.addComponent<Transform>(entity, 'Transform', createTransform(x, y));
    this.world.addComponent<Sprite>(entity, 'Sprite', createSprite('player'));
    this.world.addComponent<Stats>(entity, 'Stats', createStats(30, 5, 2));
    this.world.addComponent<Combatant>(entity, 'Combatant', createCombatant('player'));
    this.world.addComponent<TurnBased>(entity, 'TurnBased', createTurnBased(1));
    this.world.addComponent(entity, 'PlayerTag', {});

    return entity;
  }

  // 创建敌人
  createEnemy(x: number, y: number, floor: number): Entity {
    const entity = this.world.createEntity();
    const multiplier = 1 + (floor - 1) * 0.2;

    this.world.addComponent<Transform>(entity, 'Transform', createTransform(x, y));
    this.world.addComponent<Sprite>(entity, 'Sprite', createSprite('enemy'));
    this.world.addComponent<Stats>(entity, 'Stats', createStats(
      Math.floor(10 * multiplier),
      Math.floor(3 * multiplier),
      Math.floor(1 * multiplier)
    ));
    this.world.addComponent<Combatant>(entity, 'Combatant', createCombatant('enemy'));
    this.world.addComponent<AI>(entity, 'AI', createAI('aggressive', 8));
    this.world.addComponent<TurnBased>(entity, 'TurnBased', createTurnBased(1));
    this.world.addComponent(entity, 'EnemyTag', createEnemyTag(floor));

    return entity;
  }

  // 创建药水
  createPotion(x: number, y: number): Entity {
    const entity = this.world.createEntity();

    this.world.addComponent<Transform>(entity, 'Transform', createTransform(x, y));
    this.world.addComponent<Sprite>(entity, 'Sprite', createSprite('potion'));
    this.world.addComponent<Item>(entity, 'Item', createItem('potion', 10));

    return entity;
  }

  // 创建金币
  createCoin(x: number, y: number): Entity {
    const entity = this.world.createEntity();

    this.world.addComponent<Transform>(entity, 'Transform', createTransform(x, y));
    this.world.addComponent<Sprite>(entity, 'Sprite', createSprite('coin'));
    this.world.addComponent<Item>(entity, 'Item', createItem('coin', 10));

    return entity;
  }

  // 创建游戏状态实体
  createGameState(): Entity {
    const entity = this.world.createEntity();
    this.world.addComponent(entity, 'GameStateComponent', {
      floor: 1,
      score: 0,
      turn: 0,
      isPlayerTurn: true,
      gameOver: false,
      victory: false,
    });
    return entity;
  }

  // 创建楼梯
  createStairs(x: number, y: number, targetFloor: number): Entity {
    const entity = this.world.createEntity();
    
    this.world.addComponent<Transform>(entity, 'Transform', createTransform(x, y));
    this.world.addComponent<Sprite>(entity, 'Sprite', createSprite('stairs'));
    this.world.addComponent(entity, 'Stairs', { targetFloor });

    return entity;
  }
}

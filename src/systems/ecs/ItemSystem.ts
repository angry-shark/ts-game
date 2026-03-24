// 物品系统 - 处理物品收集和使用

import { World, BaseSystem, SystemPriority, Entity } from '@/ecs';
import { Item, Stats, PickupEvent, Transform } from '@/components';
import { worldToTile, createFloatingText } from '@/components';

export class ItemSystem extends BaseSystem {
  private tileSize: number = 32;

  constructor() {
    super(SystemPriority.COMBAT - 10);
  }

  update(world: World, _deltaTime: number): void {
    this.processCollisions(world);
    this.processPickupEvents(world);
  }

  private processCollisions(world: World): void {
    const players = world.query('PlayerTag', 'Transform');
    if (players.length === 0) return;

    const player = players[0];
    const playerTransform = world.getComponent<Transform>(player, 'Transform')!;
    const playerTile = worldToTile(playerTransform.x, playerTransform.y, this.tileSize);

    const items = world.query('Item', 'Transform');

    for (const item of items) {
      const itemComponent = world.getComponent<Item>(item, 'Item')!;
      if (itemComponent.isCollected) continue;

      const itemTransform = world.getComponent<Transform>(item, 'Transform')!;
      const itemTile = worldToTile(itemTransform.x, itemTransform.y, this.tileSize);

      // 检查碰撞
      if (playerTile.x === itemTile.x && playerTile.y === itemTile.y) {
        this.collectItem(world, player, item);
      }
    }
  }

  private processPickupEvents(world: World): void {
    const entities = world.query('PickupEvent');

    for (const entity of entities) {
      const event = world.getComponent<PickupEvent>(entity, 'PickupEvent');
      if (!event) continue;

      // 可以在这里添加拾取逻辑
      world.removeComponent(entity, 'PickupEvent');
    }
  }

  private collectItem(world: World, collector: Entity, item: Entity): void {
    const itemComponent = world.getComponent<Item>(item, 'Item')!;

    itemComponent.isCollected = true;

    // 应用效果
    switch (itemComponent.type) {
      case 'potion':
        this.applyPotionEffect(world, collector, itemComponent.value);
        break;
      case 'coin':
        this.applyCoinEffect(world, collector, itemComponent.value);
        break;
    }

    // 隐藏物品
    const sprite = world.getComponent<import('@/components').Sprite>(item, 'Sprite');
    if (sprite) {
      sprite.visible = false;
      sprite.alpha = 0;
    }

    // 销毁物品实体
    world.destroyEntity(item);
  }

  private applyPotionEffect(world: World, collector: Entity, value: number): void {
    const stats = world.getComponent<Stats>(collector, 'Stats');
    const transform = world.getComponent<Transform>(collector, 'Transform');

    if (stats) {
      const actualHeal = Math.min(value, stats.maxHp - stats.hp);
      stats.hp += actualHeal;

      // 创建治疗数字
      if (transform) {
        this.createFloatingText(world, transform.x, transform.y - 20, `+${actualHeal} HP`, '#4ade80');
      }
    }
  }

  private applyCoinEffect(world: World, collector: Entity, value: number): void {
    const transform = world.getComponent<Transform>(collector, 'Transform');

    if (transform) {
      this.createFloatingText(world, transform.x, transform.y - 20, `+${value} 💰`, '#facc15');
    }

    // 更新游戏状态分数
    const gameStateEntities = world.query('GameStateComponent');
    for (const gs of gameStateEntities) {
      const gameState = world.getComponent<import('@/components').GameStateComponent>(gs, 'GameStateComponent');
      if (gameState) {
        gameState.score += value;
      }
    }
  }

  private createFloatingText(world: World, x: number, y: number, text: string, color: string): void {
    const entity = world.createEntity();
    world.addComponent(entity, 'Transform', {
      x,
      y,
      previousX: x,
      previousY: y,
      targetX: null,
      targetY: null,
      isMoving: false,
    });
    world.addComponent(entity, 'FloatingText', createFloatingText(text, color));
  }
}

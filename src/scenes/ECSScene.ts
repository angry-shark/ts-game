// ECS 游戏场景 - 使用 ECS 架构的主游戏场景

import Phaser from 'phaser';
import { World } from '@/ecs';
import { MapSystem } from '@/systems/MapSystem';
import { EntityFactory } from '@/factories/EntityFactory';
import {
  RenderSystem, MovementSystem, CombatSystem, InputSystem,
  AISystem, TurnSystem, ItemSystem, CleanupSystem,
} from '@/systems/ecs';
import { GameStateComponent, Transform } from '@/components';
import { tileToWorld, worldToTile } from '@/components';

export class ECSScene extends Phaser.Scene {
  private world!: World;
  private mapSystem!: MapSystem;
  private entityFactory!: EntityFactory;
  private playerEntity!: number;

  // 系统引用
  private renderSystem!: RenderSystem;
  private inputSystem!: InputSystem;
  private turnSystem!: TurnSystem;

  constructor() {
    super({ key: 'ECSScene' });
  }

  create(): void {
    // 初始化 ECS World
    this.world = new World();

    // 初始化地图
    this.mapSystem = new MapSystem(this, 40, 30);
    this.mapSystem.generate();

    // 初始化实体工厂
    this.entityFactory = new EntityFactory(this.world, this);

    // 创建游戏状态
    this.entityFactory.createGameState();

    // 创建玩家
    const startRoom = this.mapSystem.getRooms()[0];
    const playerPos = tileToWorld(startRoom.center.x, startRoom.center.y, 32);
    this.playerEntity = this.entityFactory.createPlayer(playerPos.x, playerPos.y);

    // 生成敌人
    this.spawnEnemies();

    // 生成物品
    this.spawnItems();

    // 放置楼梯
    this.placeStairs();

    // 初始化系统
    this.initSystems();

    // 相机设置
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setLerp(0.1, 0.1);

    // 启动 UI 场景
    this.scene.launch('UIScene', { world: this.world });

    // 设置回合结束回调
    this.turnSystem.setOnTurnEndCallback(() => {
      this.updateUI();
    });

    this.turnSystem.setOnPlayerDeathCallback(() => {
      this.gameOver();
    });

    // 输入系统的移动回调
    this.inputSystem.setOnMoveCallback((entity, dx, dy) => {
      this.checkCombatInteraction(entity, dx, dy);
      this.checkStairsInteraction(entity);
    });

    // 初始 UI 更新
    this.updateUI();
  }

  update(_time: number, delta: number): void {
    const deltaTime = delta / 1000; // 转换为秒
    this.world.update(deltaTime);
    
    // 更新相机跟随玩家
    this.updateCameraFollow();
  }

  private updateCameraFollow(): void {
    const playerTransform = this.world.getComponent<Transform>(this.playerEntity, 'Transform');
    if (playerTransform) {
      this.cameras.main.centerOn(playerTransform.x, playerTransform.y);
    }
  }

  private initSystems(): void {
    // 渲染系统
    this.renderSystem = new RenderSystem(this);
    this.world.addSystem(this.renderSystem);

    // 移动系统
    this.world.addSystem(new MovementSystem());

    // 输入系统
    this.inputSystem = new InputSystem(this, {
      isWall: (x, y) => this.mapSystem.isWall(x, y),
    });
    this.world.addSystem(this.inputSystem);

    // AI 系统
    this.world.addSystem(new AISystem(this, {
      isWall: (x, y) => this.mapSystem.isWall(x, y),
    }));

    // 回合系统
    this.turnSystem = new TurnSystem(this);
    this.world.addSystem(this.turnSystem);

    // 物品系统
    this.world.addSystem(new ItemSystem());

    // 战斗系统
    this.world.addSystem(new CombatSystem(this));

    // 清理系统
    this.world.addSystem(new CleanupSystem());
  }

  private spawnEnemies(): void {
    const rooms = this.mapSystem.getRooms().slice(1);
    const gameState = this.getGameState();
    const enemyCount = Math.min(3 + Math.floor(gameState.floor * 1.5), rooms.length);

    for (let i = 0; i < enemyCount; i++) {
      const room = Phaser.Utils.Array.GetRandom(rooms);
      const x = Phaser.Math.Between(room.x + 1, room.x + room.width - 2);
      const y = Phaser.Math.Between(room.y + 1, room.y + room.height - 2);
      const pos = tileToWorld(x, y, 32);

      this.entityFactory.createEnemy(pos.x, pos.y, gameState.floor);
    }
  }

  private spawnItems(): void {
    const rooms = this.mapSystem.getRooms();
    const itemCount = Phaser.Math.Between(2, 5);

    for (let i = 0; i < itemCount; i++) {
      const room = Phaser.Utils.Array.GetRandom(rooms);
      const x = Phaser.Math.Between(room.x + 1, room.x + room.width - 2);
      const y = Phaser.Math.Between(room.y + 1, room.y + room.height - 2);
      const pos = tileToWorld(x, y, 32);

      if (Math.random() > 0.5) {
        this.entityFactory.createPotion(pos.x, pos.y);
      } else {
        this.entityFactory.createCoin(pos.x, pos.y);
      }
    }
  }

  private placeStairs(): void {
    const rooms = this.mapSystem.getRooms();
    const lastRoom = rooms[rooms.length - 1];
    const gameState = this.getGameState();
    const pos = tileToWorld(
      Math.floor(lastRoom.center.x),
      Math.floor(lastRoom.center.y),
      32
    );
    this.entityFactory.createStairs(pos.x, pos.y, gameState.floor + 1);
  }

  private checkCombatInteraction(entity: number, dx: number, dy: number): void {
    const transform = this.world.getComponent<Transform>(entity, 'Transform');
    if (!transform) return;

    const tileSize = 32;
    const currentTile = worldToTile(transform.x, transform.y, tileSize);
    const targetTileX = currentTile.x + dx;
    const targetTileY = currentTile.y + dy;

    // 检查是否有敌人在目标位置
    const enemies = this.world.query('EnemyTag', 'Transform', 'Combatant');
    for (const enemy of enemies) {
      const enemyTransform = this.world.getComponent<Transform>(enemy, 'Transform')!;
      const enemyCombatant = this.world.getComponent<import('@/components').Combatant>(enemy, 'Combatant')!;
      
      if (enemyCombatant.isDead) continue;

      const enemyTile = worldToTile(enemyTransform.x, enemyTransform.y, tileSize);
      if (enemyTile.x === targetTileX && enemyTile.y === targetTileY) {
        // 攻击敌人
        import('@/systems/ecs').then(({ dealDamage }) => {
          const stats = this.world.getComponent<import('@/components').Stats>(entity, 'Stats');
          if (stats) {
            const damage = Math.max(1, stats.attack + Phaser.Math.Between(-2, 2));
            dealDamage(this.world, enemy, damage, entity);
          }
        });
        
        // 攻击动画
        const sprite = this.world.getComponent<import('@/components').Sprite>(entity, 'Sprite');
        if (sprite?.phaserSprite) {
          this.tweens.add({
            targets: sprite.phaserSprite,
            scale: { from: 1.2, to: 1 },
            duration: 150,
            ease: 'Back.easeOut',
          });
        }
        break;
      }
    }
  }

  private checkStairsInteraction(entity: number): void {
    const transform = this.world.getComponent<Transform>(entity, 'Transform');
    if (!transform) return;

    const tileSize = 32;
    const playerTile = worldToTile(transform.x, transform.y, tileSize);

    // 检查是否在楼梯上
    const stairs = this.world.query('Stairs', 'Transform');
    for (const stair of stairs) {
      const stairTransform = this.world.getComponent<Transform>(stair, 'Transform')!;
      const stairTile = worldToTile(stairTransform.x, stairTransform.y, tileSize);

      if (playerTile.x === stairTile.x && playerTile.y === stairTile.y) {
        this.nextFloor();
        return;
      }
    }
  }

  private nextFloor(): void {
    const gameState = this.getGameState();
    gameState.floor++;
    this.scene.restart();
  }

  private getGameState(): GameStateComponent {
    const entities = this.world.query('GameStateComponent');
    return this.world.getComponent<GameStateComponent>(entities[0], 'GameStateComponent')!;
  }

  private updateUI(): void {
    this.events.emit('updateGameState', { world: this.world });
  }

  private gameOver(): void {
    const gameState = this.getGameState();
    this.scene.stop('UIScene');
    this.scene.start('GameOverScene', {
      score: gameState.score,
      floor: gameState.floor,
    });
  }

  getWorld(): World {
    return this.world;
  }
}

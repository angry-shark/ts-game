// 大世界场景 - 鬼谷八荒风格开放世界

import Phaser from 'phaser';
import { World } from '@/ecs';
import { EntityFactory } from '@/factories/EntityFactory';
import {
  RenderSystem, MovementSystem, AttributeSystem,
  CombatSystem, SkillSystem,
} from '@/systems/ecs';
import { MovementSystem as MS } from '@/systems/ecs/core/MovementSystem';
import { CultivationPath } from '@/components';


export class WorldScene extends Phaser.Scene {
  private world!: World;
  private entityFactory!: EntityFactory;
  private playerEntity!: number;
  
  // 输入
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  
  // 系统
  private renderSystem!: RenderSystem;
  
  // 敌人实体列表
  private enemies: number[] = [];
  
  // 当前战斗的敌人
  private currentEnemy: number | null = null;

  constructor() {
    super({ key: 'WorldScene' });
  }

  create(): void {
    // 初始化 ECS World
    this.world = new World();

    // 初始化实体工厂
    this.entityFactory = new EntityFactory(this.world, this);

    // 创建玩家
    this.playerEntity = this.entityFactory.createPlayer(
      400, 300, 
      '修仙者', 
      'sword' as CultivationPath
    );

    // 创建一些测试敌人
    this.spawnTestEnemies();

    // 初始化系统
    this.initSystems();

    // 设置输入
    this.setupInput();

    // 相机跟随
    this.setupCamera();

    // 生成程序化纹理
    this.generateTextures();

    // 监听战斗结束事件
    this.game.events.on('combatEnd', (data: { victory: boolean; enemyId?: number }) => {
      console.log('WorldScene 收到战斗结束事件:', data);
      if (data.victory && this.currentEnemy !== null) {
        this.destroyEnemy(this.currentEnemy);
      }
      this.currentEnemy = null;
    });
  }

  update(_time: number, delta: number): void {
    const deltaTime = delta / 1000;
    this.world.update(deltaTime);
    this.handleInput();
    this.checkEnemyCollision();
  }

  private initSystems(): void {
    // 属性系统
    this.world.addSystem(new AttributeSystem());
    
    // 移动系统
    this.world.addSystem(new MovementSystem());
    
    // 战斗系统
    this.world.addSystem(new CombatSystem());
    this.world.addSystem(new SkillSystem());
    
    // 渲染系统
    this.renderSystem = new RenderSystem(this);
    this.world.addSystem(this.renderSystem);
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
    }) as { [key: string]: Phaser.Input.Keyboard.Key };
  }

  private handleInput(): void {
    let vx = 0;
    let vy = 0;

    if (this.cursors.left?.isDown || this.wasd.a?.isDown) vx = -1;
    if (this.cursors.right?.isDown || this.wasd.d?.isDown) vx = 1;
    if (this.cursors.up?.isDown || this.wasd.w?.isDown) vy = -1;
    if (this.cursors.down?.isDown || this.wasd.s?.isDown) vy = 1;

    MS.setVelocity(this.world, this.playerEntity, vx, vy);
  }

  private setupCamera(): void {
    const transform = this.world.getComponent<{ x: number; y: number }>(
      this.playerEntity, 
      'Transform'
    );
    
    // 相机跟随玩家
    const followTarget = this.add.container(transform?.x || 400, transform?.y || 300);
    this.cameras.main.startFollow(followTarget, true, 0.1, 0.1);
    
    this.cameras.main.setZoom(1.2);
  }

  private spawnTestEnemies(): void {
    const spawnPoints = [
      { x: 600, y: 300, name: '妖兽1', hp: 50 },
      { x: 200, y: 500, name: '妖兽2', hp: 60 },
      { x: 800, y: 500, name: '妖兽3', hp: 55 },
      { x: 300, y: 150, name: '妖兽4', hp: 45 },
      { x: 700, y: 600, name: '妖兽5', hp: 70 },
    ];
    
    spawnPoints.forEach((point) => {
      const enemy = this.entityFactory.createEnemy(point.x, point.y, point.name, 1);
      this.enemies.push(enemy);
    });
  }

  private checkEnemyCollision(): void {
    const playerTransform = this.world.getComponent<{ x: number; y: number }>(
      this.playerEntity, 
      'Transform'
    );
    if (!playerTransform) return;

    for (const enemy of this.enemies) {
      const enemyTransform = this.world.getComponent<{ x: number; y: number }>(
        enemy, 
        'Transform'
      );
      const enemyCombat = this.world.getComponent<{ hp: number }>(enemy, 'Combat');
      
      if (!enemyTransform || !enemyCombat || enemyCombat.hp <= 0) continue;

      const dist = Math.sqrt(
        Math.pow(playerTransform.x - enemyTransform.x, 2) +
        Math.pow(playerTransform.y - enemyTransform.y, 2)
      );

      // 距离小于50触发战斗
      if (dist < 50) {
        this.startCardBattle(enemy);
        break;
      }
    }
  }

  private startCardBattle(enemy: number): void {
    const enemyCombat = this.world.getComponent<{ hp: number; maxHp: number }>(enemy, 'Combat');
    const playerCombat = this.world.getComponent<{ maxHp: number }>(this.playerEntity, 'Combat');
    
    if (!enemyCombat || !playerCombat) return;

    // 记录当前敌人
    this.currentEnemy = enemy;

    // 暂停当前场景
    this.scene.pause();
    
    // 启动卡牌战斗场景
    this.scene.launch('CardBattleScene', {
      playerMaxHp: playerCombat.maxHp,
      enemyName: '妖兽',
      enemyMaxHp: enemyCombat.maxHp,
    });
  }

  private destroyEnemy(enemy: number): void {
    // 从ECS世界销毁实体
    const sprite = this.world.getComponent<{ phaserSprite?: Phaser.GameObjects.Sprite | null }>(enemy, 'Sprite');
    if (sprite?.phaserSprite) {
      sprite.phaserSprite.destroy();
    }
    
    this.world.destroyEntity(enemy);
    
    // 从敌人列表移除
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
  }

  private generateTextures(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // 玩家 - 蓝色圆形
    graphics.fillStyle(0x3b82f6);
    graphics.fillCircle(16, 16, 12);
    graphics.generateTexture('player', 32, 32);
    graphics.clear();

    // 敌人 - 红色圆形
    graphics.fillStyle(0xef4444);
    graphics.fillCircle(16, 16, 12);
    graphics.generateTexture('enemy', 32, 32);
    graphics.clear();

    // NPC - 绿色圆形
    graphics.fillStyle(0x22c55e);
    graphics.fillCircle(16, 16, 12);
    graphics.generateTexture('npc', 32, 32);
    graphics.clear();

    // 弹道 - 黄色小圆
    graphics.fillStyle(0xfacc15);
    graphics.fillCircle(8, 8, 6);
    graphics.generateTexture('projectile', 16, 16);
    graphics.clear();

    graphics.destroy();
  }

  getPlayerEntity(): number {
    return this.playerEntity;
  }

  getWorld(): World {
    return this.world;
  }
}

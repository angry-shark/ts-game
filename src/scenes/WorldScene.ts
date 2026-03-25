// 大世界场景 - 鬼谷八荒风格开放世界

import Phaser from 'phaser';
import { World } from '@/ecs';
import { EntityFactory } from '@/factories/EntityFactory';
import {
  RenderSystem, MovementSystem, AttributeSystem, VisionSystem,
  CombatSystem, SkillSystem,
} from '@/systems/ecs';
import { MovementSystem as MS } from '@/systems/ecs/core/MovementSystem';
import { CultivationPath, Transform, Vision } from '@/components';

export class WorldScene extends Phaser.Scene {
  private world!: World;
  private entityFactory!: EntityFactory;
  private playerEntity!: number;

  // 地图参数
  private readonly worldWidth = 1600;
  private readonly worldHeight = 1200;
  private readonly gridSize = 64;

  // 输入
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };

  // 系统
  private renderSystem!: RenderSystem;

  // 视野可视化（视野外灰化）
  private fogOverlay!: Phaser.GameObjects.Rectangle;
  private fogMaskGraphics!: Phaser.GameObjects.Graphics;
  private visionTipText!: Phaser.GameObjects.Text;

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

    // 先生成纹理与地图底图，保证可见性更直观
    this.generateTextures();
    this.createWorldBackdrop();

    // 创建玩家
    this.playerEntity = this.entityFactory.createPlayer(
      400, 300,
      '修仙者',
      'sword' as CultivationPath
    );

    // 创建测试墙体（用于视野遮挡）
    this.spawnTestWalls();

    // 创建一些测试敌人
    this.spawnTestEnemies();

    // 初始化系统
    this.initSystems();

    // 设置输入
    this.setupInput();

    // 相机跟随
    this.setupCamera();

    // 创建视野调试层（扇形范围可视化）
    this.createVisionDebugLayer();

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
    this.drawVisionDebug();
  }

  private initSystems(): void {
    // 属性系统
    this.world.addSystem(new AttributeSystem());
    
    // 移动系统
    this.world.addSystem(new MovementSystem());

    // 视野系统（扇形可见 + 墙体遮挡）
    this.world.addSystem(new VisionSystem());
    
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

    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setZoom(1.2);
  }

  private createWorldBackdrop(): void {
    this.cameras.main.setBackgroundColor('#0f172a');

    const bg = this.add.rectangle(
      this.worldWidth / 2,
      this.worldHeight / 2,
      this.worldWidth,
      this.worldHeight,
      0x111827
    );
    bg.setDepth(-100);

    const grid = this.add.graphics();
    grid.lineStyle(1, 0x334155, 0.25);

    for (let x = 0; x <= this.worldWidth; x += this.gridSize) {
      grid.lineBetween(x, 0, x, this.worldHeight);
    }

    for (let y = 0; y <= this.worldHeight; y += this.gridSize) {
      grid.lineBetween(0, y, this.worldWidth, y);
    }

    grid.lineStyle(3, 0x1e293b, 0.8);
    grid.strokeRect(0, 0, this.worldWidth, this.worldHeight);
    grid.setDepth(-90);
  }

  private createVisionDebugLayer(): void {
    this.fogOverlay = this.add.rectangle(
      this.worldWidth / 2,
      this.worldHeight / 2,
      this.worldWidth,
      this.worldHeight,
      0x000000,
      0.42
    );
    this.fogOverlay.setDepth(880);

    this.fogMaskGraphics = this.add.graphics({ x: 0, y: 0 });
    this.fogMaskGraphics.setVisible(false);
    const mask = this.fogMaskGraphics.createGeometryMask();
    mask.invertAlpha = true;
    this.fogOverlay.setMask(mask);

    this.visionTipText = this.add.text(16, 16, '', {
      color: '#f8fafc',
      fontSize: '14px',
      backgroundColor: '#0f172a',
      padding: { left: 8, right: 8, top: 6, bottom: 6 },
    });
    this.visionTipText.setScrollFactor(0);
    this.visionTipText.setDepth(950);
  }

  private drawVisionDebug(): void {
    if (!this.fogMaskGraphics) return;

    const transform = this.world.getComponent<Transform>(this.playerEntity, 'Transform');
    const vision = this.world.getComponent<Vision>(this.playerEntity, 'Vision');
    if (!transform || !vision) return;

    const halfFov = Phaser.Math.DegToRad(vision.fovAngle / 2);
    const startAngle = transform.rotation - halfFov;
    const endAngle = transform.rotation + halfFov;

    this.fogMaskGraphics.clear();
    this.fogMaskGraphics.fillStyle(0xffffff, 1);
    this.fogMaskGraphics.beginPath();
    this.fogMaskGraphics.moveTo(transform.x, transform.y);
    this.fogMaskGraphics.arc(transform.x, transform.y, vision.range, startAngle, endAngle, false);
    this.fogMaskGraphics.closePath();
    this.fogMaskGraphics.fillPath();

    if (this.visionTipText) {
      const visibleCount = Math.max(0, vision.visibleEntities.length - 1);
      this.visionTipText.setText(
        `扇形视野: ${vision.fovAngle}° / 半径: ${(vision.range / this.gridSize).toFixed(1)}格\n` +
        `可见敌人数: ${visibleCount}`
      );
    }
  }

  private spawnTestWalls(): void {
    const wallPoints = [
      { x: 520, y: 236 },
      { x: 520, y: 300 },
      { x: 520, y: 364 },
      { x: 584, y: 300 },
      { x: 328, y: 236 },
      { x: 328, y: 300 },
      { x: 776, y: 492 },
      { x: 776, y: 556 },
    ];

    wallPoints.forEach((point) => {
      this.entityFactory.createWall(point.x, point.y, 24);
    });
  }

  private spawnTestEnemies(): void {
    const spawnPoints = [
      { x: 610, y: 300, name: '妖兽1(墙后)', hp: 50 },
      { x: 560, y: 210, name: '妖兽2(扇形内)', hp: 60 },
      { x: 260, y: 500, name: '妖兽3(背后)', hp: 55 },
      { x: 300, y: 150, name: '妖兽4(侧方)', hp: 45 },
      { x: 840, y: 600, name: '妖兽5(远处)', hp: 70 },
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

    // 墙体 - 灰色方块
    graphics.fillStyle(0x6b7280);
    graphics.fillRoundedRect(4, 4, 24, 24, 4);
    graphics.generateTexture('wall', 32, 32);
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

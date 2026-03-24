import Phaser from 'phaser';
import { MapSystem } from '@systems/MapSystem';
import { Player } from '@entities/Player';
import { Enemy } from '@entities/Enemy';
import { Item } from '@entities/Item';
import type { Position, GameState } from '@/types/game';

export class GameScene extends Phaser.Scene {
  private mapSystem!: MapSystem;
  private player!: Player;
  private enemies: Enemy[] = [];
  private items: Item[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  private gameState: GameState = { floor: 1, score: 0, turn: 0 };
  private isPlayerTurn: boolean = true;
  private stairsPosition!: Position;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // 初始化地图系统
    this.mapSystem = new MapSystem(this, 40, 30);
    this.mapSystem.generate();

    // 获取起始房间中心作为玩家出生点
    const startRoom = this.mapSystem.getRooms()[0];
    const playerPos = this.mapSystem.tileToWorld(startRoom.center.x, startRoom.center.y);

    // 创建玩家
    this.player = new Player(this, playerPos.x, playerPos.y);

    // 生成敌人
    this.spawnEnemies();

    // 生成物品
    this.spawnItems();

    // 放置楼梯
    this.placeStairs();

    // 相机跟随
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);

    // 输入控制
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as { [key: string]: Phaser.Input.Keyboard.Key };

    // 启动 UI 场景
    this.scene.launch('UIScene', { gameState: this.gameState, player: this.player });

    // 键盘事件
    this.input.keyboard?.on('keydown-SPACE', () => this.playerWait());
  }

  update(): void {
    if (!this.isPlayerTurn) return;

    let dx = 0;
    let dy = 0;

    // 处理移动输入
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up!) || Phaser.Input.Keyboard.JustDown(this.wasd.up)) {
      dy = -1;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down!) || Phaser.Input.Keyboard.JustDown(this.wasd.down)) {
      dy = 1;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left!) || Phaser.Input.Keyboard.JustDown(this.wasd.left)) {
      dx = -1;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right!) || Phaser.Input.Keyboard.JustDown(this.wasd.right)) {
      dx = 1;
    }

    if (dx !== 0 || dy !== 0) {
      this.handlePlayerMove(dx, dy);
    }
  }

  private handlePlayerMove(dx: number, dy: number): void {
    const currentTile = this.mapSystem.worldToTile(this.player.sprite.x, this.player.sprite.y);
    const targetTile = { x: currentTile.x + dx, y: currentTile.y + dy };

    // 检查墙壁碰撞
    if (this.mapSystem.isWall(targetTile.x, targetTile.y)) {
      return;
    }

    // 检查敌人
    const enemy = this.getEnemyAt(targetTile.x, targetTile.y);
    if (enemy && !enemy.isDead()) {
      this.player.attack(enemy);
      if (enemy.isDead()) {
        this.gameState.score += enemy.getScoreValue();
        this.updateUI();
      }
      this.endPlayerTurn();
      return;
    }

    // 检查物品
    const item = this.getItemAt(targetTile.x, targetTile.y);
    if (item) {
      item.collect(this.player);
      item.destroy();
      this.items = this.items.filter(i => i !== item);
    }

    // 检查楼梯
    if (targetTile.x === this.stairsPosition.x && targetTile.y === this.stairsPosition.y) {
      this.nextFloor();
      return;
    }

    // 移动玩家
    const targetPos = this.mapSystem.tileToWorld(targetTile.x, targetTile.y);
    this.player.moveTo(targetPos.x, targetPos.y);
    this.endPlayerTurn();
  }

  private playerWait(): void {
    this.endPlayerTurn();
  }

  private endPlayerTurn(): void {
    this.isPlayerTurn = false;
    this.gameState.turn++;
    this.updateUI();

    // 敌人回合
    this.time.delayedCall(200, () => {
      this.enemyTurn();
    });
  }

  private enemyTurn(): void {
    let enemyIndex = 0;

    const processNextEnemy = () => {
      while (enemyIndex < this.enemies.length) {
        const enemy = this.enemies[enemyIndex++];
        if (enemy.isDead()) continue;

        enemy.takeTurn(this.player, this.mapSystem);

        if (this.player.isDead()) {
          this.gameOver();
          return;
        }

        this.time.delayedCall(100, processNextEnemy);
        return;
      }

      // 所有敌人行动完毕
      this.isPlayerTurn = true;
      this.updateUI();
    };

    processNextEnemy();
  }

  private getEnemyAt(tileX: number, tileY: number): Enemy | undefined {
    return this.enemies.find(e => {
      if (e.isDead()) return false;
      const pos = this.mapSystem.worldToTile(e.sprite.x, e.sprite.y);
      return pos.x === tileX && pos.y === tileY;
    });
  }

  private getItemAt(tileX: number, tileY: number): Item | undefined {
    return this.items.find(item => {
      const pos = this.mapSystem.worldToTile(item.sprite.x, item.sprite.y);
      return pos.x === tileX && pos.y === tileY;
    });
  }

  private spawnEnemies(): void {
    const rooms = this.mapSystem.getRooms().slice(1); // 跳过起始房间
    const enemyCount = Math.min(3 + Math.floor(this.gameState.floor * 1.5), rooms.length);

    for (let i = 0; i < enemyCount; i++) {
      const room = Phaser.Utils.Array.GetRandom(rooms);
      const x = Phaser.Math.Between(room.x + 1, room.x + room.width - 2);
      const y = Phaser.Math.Between(room.y + 1, room.y + room.height - 2);
      const pos = this.mapSystem.tileToWorld(x, y);

      const enemy = new Enemy(this, pos.x, pos.y, this.gameState.floor);
      this.enemies.push(enemy);
    }
  }

  private spawnItems(): void {
    const rooms = this.mapSystem.getRooms();
    const itemCount = Phaser.Math.Between(2, 5);

    for (let i = 0; i < itemCount; i++) {
      const room = Phaser.Utils.Array.GetRandom(rooms);
      const x = Phaser.Math.Between(room.x + 1, room.x + room.width - 2);
      const y = Phaser.Math.Between(room.y + 1, room.y + room.height - 2);
      const pos = this.mapSystem.tileToWorld(x, y);

      const type = Math.random() > 0.5 ? 'potion' : 'coin';
      const item = new Item(this, pos.x, pos.y, type);
      this.items.push(item);
    }
  }

  private placeStairs(): void {
    const rooms = this.mapSystem.getRooms();
    const lastRoom = rooms[rooms.length - 1];
    this.stairsPosition = {
      x: Math.floor(lastRoom.center.x),
      y: Math.floor(lastRoom.center.y),
    };
    const pos = this.mapSystem.tileToWorld(this.stairsPosition.x, this.stairsPosition.y);
    this.add.image(pos.x, pos.y, 'stairs').setOrigin(0.5);
  }

  private nextFloor(): void {
    this.gameState.floor++;
    this.scene.restart();
  }

  private updateUI(): void {
    this.scene.get('UIScene').events.emit('updateUI', {
      gameState: this.gameState,
      player: this.player,
    });
  }

  private gameOver(): void {
    this.scene.stop('UIScene');
    this.scene.start('GameOverScene', {
      score: this.gameState.score,
      floor: this.gameState.floor,
    });
  }

  getMapSystem(): MapSystem {
    return this.mapSystem;
  }
}

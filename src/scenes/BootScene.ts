import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // 创建加载进度条
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const percentText = this.add.text(width / 2, height / 2 - 5, '0%', {
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      percentText.setText(`${Math.round(value * 100)}%`);
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 加载资源（使用程序化生成的图形，无需外部资源）
    this.load.setPath('assets');
    
    // 这里可以加载真实资源
    // this.load.image('player', 'sprites/player.png');
    // this.load.image('enemy', 'sprites/enemy.png');
    // this.load.tilemapTiledJSON('dungeon', 'maps/dungeon.json');
  }

  create(): void {
    // 生成程序化纹理
    this.generateTextures();
    
    // 进入主菜单
    this.scene.start('MainMenuScene');
  }

  private generateTextures(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // 玩家纹理
    graphics.fillStyle(0x4ade80);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.clear();

    // 敌人纹理
    graphics.fillStyle(0xf87171);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('enemy', 32, 32);
    graphics.clear();

    // 墙壁纹理
    graphics.fillStyle(0x475569);
    graphics.fillRect(0, 0, 32, 32);
    graphics.lineStyle(2, 0x334155);
    graphics.strokeRect(0, 0, 32, 32);
    graphics.generateTexture('wall', 32, 32);
    graphics.clear();

    // 地板纹理
    graphics.fillStyle(0x1e293b);
    graphics.fillRect(0, 0, 32, 32);
    graphics.lineStyle(1, 0x334155);
    graphics.strokeRect(0, 0, 32, 32);
    graphics.generateTexture('floor', 32, 32);
    graphics.clear();

    // 楼梯纹理
    graphics.fillStyle(0xfbbf24);
    graphics.fillRect(4, 4, 24, 24);
    graphics.generateTexture('stairs', 32, 32);
    graphics.clear();

    // 药水纹理
    graphics.fillStyle(0x60a5fa);
    graphics.fillCircle(16, 16, 10);
    graphics.generateTexture('potion', 32, 32);
    graphics.clear();

    // 金币纹理
    graphics.fillStyle(0xfacc15);
    graphics.fillCircle(16, 16, 8);
    graphics.generateTexture('coin', 32, 32);
    graphics.clear();

    graphics.destroy();
  }
}

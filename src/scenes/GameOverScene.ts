import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  private score: number = 0;
  private floor: number = 0;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score: number; floor: number }): void {
    this.score = data.score;
    this.floor = data.floor;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // 游戏结束标题
    this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontSize: '72px',
      fontStyle: 'bold',
      color: '#f87171',
    }).setOrigin(0.5);

    // 最终得分
    this.add.text(width / 2, height / 2, `最终得分: ${this.score}`, {
      fontSize: '36px',
      color: '#facc15',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 50, `到达层数: ${this.floor}`, {
      fontSize: '28px',
      color: '#fbbf24',
    }).setOrigin(0.5);

    // 重新开始按钮
    const restartText = this.add.text(width / 2, height / 2 + 150, '重新开始', {
      fontSize: '32px',
      color: '#4ade80',
      backgroundColor: '#166534',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restartText.on('pointerover', () => restartText.setScale(1.1));
    restartText.on('pointerout', () => restartText.setScale(1));
    restartText.on('pointerdown', () => this.scene.start('GameScene'));

    // 返回主菜单
    const menuText = this.add.text(width / 2, height / 2 + 220, '主菜单', {
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuText.on('pointerover', () => menuText.setScale(1.1));
    menuText.on('pointerout', () => menuText.setScale(1));
    menuText.on('pointerdown', () => this.scene.start('MainMenuScene'));

    // 键盘控制
    this.input.keyboard?.on('keydown-ENTER', () => this.scene.start('GameScene'));
    this.input.keyboard?.on('keydown-SPACE', () => this.scene.start('GameScene'));
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('MainMenuScene'));
  }
}

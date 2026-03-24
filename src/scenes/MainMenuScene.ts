import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private selectedIndex: number = 0;
  private menuItems: Phaser.GameObjects.Text[] = [];
  private readonly menuOptions = ['开始游戏', '操作说明', '退出'];

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // 标题
    const title = this.add.text(width / 2, height / 3, '修仙传说\n鬼谷八荒', {
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#4ade80',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5);

    // 标题动画
    this.tweens.add({
      targets: title,
      scale: { from: 0.8, to: 1 },
      duration: 1000,
      ease: 'Elastic.easeOut',
    });

    // 菜单项
    this.menuOptions.forEach((option, index) => {
      const text = this.add.text(width / 2, height / 2 + 50 + index * 60, option, {
        fontSize: '28px',
        color: '#ffffff',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      text.on('pointerover', () => this.selectMenu(index));
      text.on('pointerdown', () => this.confirmSelection());

      this.menuItems.push(text);
    });

    // 键盘控制
    this.input.keyboard?.on('keydown-UP', () => this.navigateMenu(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.navigateMenu(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-SPACE', () => this.confirmSelection());

    this.updateMenuSelection();
  }

  private navigateMenu(direction: number): void {
    this.selectedIndex = Phaser.Math.Wrap(
      this.selectedIndex + direction,
      0,
      this.menuOptions.length
    );
    this.updateMenuSelection();
  }

  private selectMenu(index: number): void {
    this.selectedIndex = index;
    this.updateMenuSelection();
  }

  private updateMenuSelection(): void {
    this.menuItems.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.setColor('#4ade80');
        item.setScale(1.2);
        item.setText('▶ ' + this.menuOptions[index] + ' ◀');
      } else {
        item.setColor('#ffffff');
        item.setScale(1);
        item.setText(this.menuOptions[index]);
      }
    });
  }

  private confirmSelection(): void {
    switch (this.selectedIndex) {
      case 0:
        this.scene.start('WorldScene');
        break;
      case 1:
        this.showInstructions();
        break;
      case 2:
        // 在桌面应用中退出，在 Web 中无效果
        if (confirm('确定要退出游戏吗？')) {
          window.close();
        }
        break;
    }
  }

  private showInstructions(): void {
    const { width, height } = this.cameras.main;
    
    const overlay = this.add.container(0, 0);
    
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
    overlay.add(bg);

    const instructions = [
      '操作说明',
      '',
      '↑ ↓ ← → / WASD - 移动',
      'SPACE - 等待一回合',
      'I - 打开背包',
      'ESC - 返回/暂停',
      '',
      '点击任意处返回',
    ];

    instructions.forEach((line, index) => {
      const text = this.add.text(width / 2, height / 3 + index * 35, line, {
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
      }).setOrigin(0.5);
      overlay.add(text);
    });

    this.input.once('pointerdown', () => overlay.destroy());
    this.input.keyboard?.once('keydown-ESC', () => overlay.destroy());
  }
}

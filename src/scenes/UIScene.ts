import Phaser from 'phaser';
import type { Player } from '@/entities/Player';
import type { GameState } from '@/types/game';

interface UIEventData {
  gameState: GameState;
  player: Player;
}

export class UIScene extends Phaser.Scene {
  private hpText!: Phaser.GameObjects.Text;
  private floorText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  private hpBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(data: { gameState: GameState; player: Player }): void {
    const { width } = this.cameras.main;

    // 背景面板
    this.add.rectangle(width / 2, 30, width, 60, 0x000000, 0.7);

    // HP 条背景
    this.hpBar = this.add.graphics();

    // 状态文本
    this.hpText = this.add.text(20, 15, '', {
      fontSize: '18px',
      color: '#ffffff',
    });

    this.floorText = this.add.text(200, 15, '', {
      fontSize: '18px',
      color: '#fbbf24',
    });

    this.scoreText = this.add.text(350, 15, '', {
      fontSize: '18px',
      color: '#facc15',
    });

    this.turnText = this.add.text(550, 15, '', {
      fontSize: '18px',
      color: '#94a3b8',
    });

    // 监听更新事件
    this.events.on('updateUI', (data: UIEventData) => {
      this.updateDisplay(data);
    });

    // 初始显示
    this.updateDisplay(data);
  }

  private updateDisplay(data: UIEventData): void {
    const { gameState, player } = data;
    const stats = player.getStats();

    // 更新文本
    this.hpText.setText(`❤️ HP: ${stats.hp}/${stats.maxHp}`);
    this.floorText.setText(`🏰 Floor: ${gameState.floor}`);
    this.scoreText.setText(`💰 Score: ${gameState.score}`);
    this.turnText.setText(`🔄 Turn: ${gameState.turn}`);

    // 更新 HP 条
    this.hpBar.clear();
    const hpPercent = stats.hp / stats.maxHp;
    const barWidth = 150;
    const barHeight = 10;

    // 背景
    this.hpBar.fillStyle(0x334155);
    this.hpBar.fillRect(20, 40, barWidth, barHeight);

    // 血量
    const color = hpPercent > 0.5 ? 0x4ade80 : hpPercent > 0.25 ? 0xfbbf24 : 0xf87171;
    this.hpBar.fillStyle(color);
    this.hpBar.fillRect(20, 40, barWidth * hpPercent, barHeight);
  }
}

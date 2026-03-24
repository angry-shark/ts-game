// ECS UI 场景 - 与 ECS 架构兼容的 UI

import Phaser from 'phaser';
import { World } from '@/ecs';
import { Stats, GameStateComponent } from '@/components';

export class ECSUIScene extends Phaser.Scene {
  private hpText!: Phaser.GameObjects.Text;
  private floorText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  private hpBar!: Phaser.GameObjects.Graphics;
  private world: World | null = null;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(data: { world: World }): void {
    this.world = data.world;
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
    const gameScene = this.scene.get('ECSScene');
    gameScene.events.on('updateGameState', () => {
      this.updateDisplay();
    });

    // 初始显示
    this.updateDisplay();
  }

  update(): void {
    // 持续更新
    this.updateDisplay();
  }

  private updateDisplay(): void {
    if (!this.world) return;

    const gameState = this.getGameState();
    const playerStats = this.getPlayerStats();

    if (!gameState || !playerStats) return;

    // 更新文本
    this.hpText.setText(`❤️ HP: ${playerStats.hp}/${playerStats.maxHp}`);
    this.floorText.setText(`🏰 Floor: ${gameState.floor}`);
    this.scoreText.setText(`💰 Score: ${gameState.score}`);
    this.turnText.setText(`🔄 Turn: ${gameState.turn}`);

    // 更新 HP 条
    this.hpBar.clear();
    const hpPercent = playerStats.hp / playerStats.maxHp;
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

  private getGameState(): GameStateComponent | null {
    if (!this.world) return null;
    const entities = this.world.query('GameStateComponent');
    if (entities.length === 0) return null;
    return this.world.getComponent<GameStateComponent>(entities[0], 'GameStateComponent') ?? null;
  }

  private getPlayerStats(): Stats | null {
    if (!this.world) return null;
    const players = this.world.query('PlayerTag', 'Stats');
    if (players.length === 0) return null;
    return this.world.getComponent<Stats>(players[0], 'Stats') ?? null;
  }
}

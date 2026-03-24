import Phaser from 'phaser';
import type { Player } from './Player';

export class Item {
  sprite: Phaser.Physics.Arcade.Sprite;
  private type: 'potion' | 'coin';

  constructor(scene: Phaser.Scene, x: number, y: number, type: 'potion' | 'coin') {
    this.type = type;
    this.sprite = scene.physics.add.sprite(x, y, type);
    this.sprite.setOrigin(0.5);

    // 浮动动画
    scene.tweens.add({
      targets: this.sprite,
      y: y - 5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  collect(player: Player): void {
    switch (this.type) {
      case 'potion':
        player.heal(10);
        this.showFloatingText('+10 HP', '#4ade80');
        break;
      case 'coin':
        this.showFloatingText('+10 💰', '#facc15');
        break;
    }

    // 收集动画
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 1.5,
      alpha: 0,
      duration: 200,
    });
  }

  private showFloatingText(text: string, color: string): void {
    const floatingText = this.scene.add.text(this.sprite.x, this.sprite.y, text, {
      fontSize: '16px',
      color,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: floatingText,
      y: floatingText.y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => floatingText.destroy(),
    });
  }

  destroy(): void {
    this.sprite.destroy();
  }

  private get scene(): Phaser.Scene {
    return this.sprite.scene;
  }
}

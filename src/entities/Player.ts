import Phaser from 'phaser';
import type { Stats } from '@/types/game';

export class Player {
  sprite: Phaser.Physics.Arcade.Sprite;
  private stats: Stats;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setOrigin(0.5);
    
    this.stats = {
      hp: 30,
      maxHp: 30,
      attack: 5,
      defense: 2,
    };
  }

  moveTo(x: number, y: number): void {
    this.scene.tweens.add({
      targets: this.sprite,
      x,
      y,
      duration: 150,
      ease: 'Power2',
    });
  }

  attack(target: { takeDamage: (damage: number) => void }): void {
    const damage = Math.max(1, this.stats.attack + Phaser.Math.Between(-2, 2));
    target.takeDamage(damage);

    // 攻击动画
    this.scene.tweens.add({
      targets: this.sprite,
      scale: { from: 1.2, to: 1 },
      duration: 150,
      ease: 'Back.easeOut',
    });
  }

  takeDamage(damage: number): void {
    const actualDamage = Math.max(1, damage - this.stats.defense);
    this.stats.hp = Math.max(0, this.stats.hp - actualDamage);

    // 受伤闪烁
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.5, to: 1 },
      duration: 100,
      repeat: 3,
    });

    // 红色闪烁
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      this.sprite.clearTint();
    });
  }

  heal(amount: number): void {
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
  }

  increaseMaxHp(amount: number): void {
    this.stats.maxHp += amount;
    this.stats.hp += amount;
  }

  isDead(): boolean {
    return this.stats.hp <= 0;
  }

  getStats(): Stats {
    return { ...this.stats };
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  private get scene(): Phaser.Scene {
    return this.sprite.scene;
  }
}

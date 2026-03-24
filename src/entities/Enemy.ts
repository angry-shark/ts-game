import Phaser from 'phaser';
import type { Stats } from '@/types/game';
import { MapSystem } from '@/systems/MapSystem';
import type { Player } from './Player';

export class Enemy {
  sprite: Phaser.Physics.Arcade.Sprite;
  private stats: Stats;
  private scoreValue: number;

  constructor(scene: Phaser.Scene, x: number, y: number, floor: number) {
    this.sprite = scene.physics.add.sprite(x, y, 'enemy');
    this.sprite.setOrigin(0.5);

    // 根据层数调整属性
    const multiplier = 1 + (floor - 1) * 0.2;
    this.stats = {
      hp: Math.floor(10 * multiplier),
      maxHp: Math.floor(10 * multiplier),
      attack: Math.floor(3 * multiplier),
      defense: Math.floor(1 * multiplier),
    };

    this.scoreValue = 10 * floor;
  }

  takeTurn(player: Player, mapSystem: MapSystem): void {
    const playerPos = mapSystem.worldToTile(player.sprite.x, player.sprite.y);
    const enemyPos = mapSystem.worldToTile(this.sprite.x, this.sprite.y);

    const dx = playerPos.x - enemyPos.x;
    const dy = playerPos.y - enemyPos.y;
    const distance = Math.abs(dx) + Math.abs(dy);

    // 如果相邻，攻击玩家
    if (distance === 1) {
      this.attack(player);
      return;
    }

    // 如果在视野范围内（距离8以内），向玩家移动
    if (distance <= 8) {
      let moveX = 0;
      let moveY = 0;

      if (Math.abs(dx) > Math.abs(dy)) {
        moveX = dx > 0 ? 1 : -1;
      } else {
        moveY = dy > 0 ? 1 : -1;
      }

      const targetX = enemyPos.x + moveX;
      const targetY = enemyPos.y + moveY;

      // 检查是否可以移动
      if (!mapSystem.isWall(targetX, targetY)) {
        const targetPos = mapSystem.tileToWorld(targetX, targetY);
        this.moveTo(targetPos.x, targetPos.y);
      }
    }
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

  attack(target: Player): void {
    const damage = Math.max(1, this.stats.attack + Phaser.Math.Between(-1, 1));
    target.takeDamage(damage);

    // 攻击动画
    this.scene.tweens.add({
      targets: this.sprite,
      scale: { from: 1.1, to: 1 },
      duration: 150,
    });
  }

  takeDamage(damage: number): void {
    const actualDamage = Math.max(1, damage - this.stats.defense);
    this.stats.hp = Math.max(0, this.stats.hp - actualDamage);

    // 显示伤害数字
    this.showDamageNumber(actualDamage);

    if (this.isDead()) {
      this.die();
    } else {
      // 受伤闪烁
      this.sprite.setTint(0xff6666);
      this.scene.time.delayedCall(200, () => {
        this.sprite.clearTint();
      });
    }
  }

  private showDamageNumber(damage: number): void {
    const text = this.scene.add.text(this.sprite.x, this.sprite.y - 20, damage.toString(), {
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy(),
    });
  }

  private die(): void {
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: 0,
      duration: 300,
      onComplete: () => {
        this.sprite.setVisible(false);
        this.sprite.setActive(false);
      },
    });
  }

  isDead(): boolean {
    return this.stats.hp <= 0;
  }

  getScoreValue(): number {
    return this.scoreValue;
  }

  private get scene(): Phaser.Scene {
    return this.sprite.scene;
  }
}

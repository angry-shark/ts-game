// 渲染系统 - 同步 ECS 数据到 Phaser 渲染

import { World, BaseSystem, SystemPriority } from '@/ecs';
import { Transform, Sprite, Animation, FloatingText } from '@/components';

export class RenderSystem extends BaseSystem {
  private scene: Phaser.Scene;
  private floatingTexts: Map<number, Phaser.GameObjects.Text> = new Map();

  constructor(scene: Phaser.Scene) {
    super(SystemPriority.RENDER);
    this.scene = scene;
  }

  update(world: World, deltaTime: number): void {
    const entities = world.query('Transform', 'Sprite');

    for (const entity of entities) {
      const transform = world.getComponent<Transform>(entity, 'Transform')!;
      const sprite = world.getComponent<Sprite>(entity, 'Sprite')!;

      // 初始化 Phaser Sprite（如果还没有）
      if (!sprite.phaserSprite) {
        sprite.phaserSprite = this.scene.add.sprite(transform.x, transform.y, sprite.texture);
        sprite.phaserSprite.setOrigin(0.5);
        sprite.phaserSprite.setDepth(sprite.depth);
      }

      // 同步位置
      sprite.phaserSprite.setPosition(transform.x, transform.y);
      sprite.phaserSprite.setScale(sprite.scale);
      sprite.phaserSprite.setAlpha(sprite.alpha);
      sprite.phaserSprite.setTint(sprite.tint);
      sprite.phaserSprite.setVisible(sprite.visible);

      // 同步动画状态
      const animation = world.getComponent<Animation>(entity, 'Animation');
      if (animation) {
        sprite.phaserSprite.setFlipX(animation.flipX);
        sprite.phaserSprite.setFlipY(animation.flipY);
      }
    }

    // 处理浮动文字
    this.updateFloatingTexts(world, deltaTime);
  }

  private updateFloatingTexts(world: World, deltaTime: number): void {
    const entities = world.query('Transform', 'FloatingText');

    for (const entity of entities) {
      const transform = world.getComponent<Transform>(entity, 'Transform')!;
      const floatingText = world.getComponent<FloatingText>(entity, 'FloatingText')!;

      // 获取或创建文字对象
      let textObj = this.floatingTexts.get(entity);
      if (!textObj) {
        textObj = this.scene.add.text(transform.x, transform.y, floatingText.text, {
          fontSize: '16px',
          color: floatingText.color,
          stroke: '#000000',
          strokeThickness: 3,
        }).setOrigin(0.5);
        this.floatingTexts.set(entity, textObj);
      }

      // 更新位置
      transform.y += floatingText.velocityY * deltaTime;
      textObj.setPosition(transform.x, transform.y);

      // 更新生命周期
      floatingText.lifeTime -= deltaTime;
      const alpha = floatingText.lifeTime / floatingText.maxLifeTime;
      textObj.setAlpha(alpha);

      // 销毁
      if (floatingText.lifeTime <= 0) {
        textObj.destroy();
        this.floatingTexts.delete(entity);
        world.destroyEntity(entity);
      }
    }
  }

  onDestroy(): void {
    for (const text of this.floatingTexts.values()) {
      text.destroy();
    }
    this.floatingTexts.clear();
  }
}

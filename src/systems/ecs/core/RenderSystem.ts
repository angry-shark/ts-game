// 渲染系统

import { World, BaseSystem, SystemPriority } from '@/ecs';
import { Transform, Sprite, Animation } from '@/components';

export class RenderSystem extends BaseSystem {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    super(SystemPriority.RENDER);
    this.scene = scene;
  }

  update(world: World, _deltaTime: number): void {
    const entities = world.query('Transform', 'Sprite');

    for (const entity of entities) {
      const transform = world.getComponent<Transform>(entity, 'Transform')!;
      const sprite = world.getComponent<Sprite>(entity, 'Sprite')!;

      // 初始化 Phaser Sprite
      if (!sprite.phaserSprite) {
        sprite.phaserSprite = this.scene.add.sprite(
          transform.x, 
          transform.y, 
          sprite.texture
        );
        sprite.phaserSprite.setOrigin(0.5);
        sprite.phaserSprite.setDepth(sprite.depth);
      }

      // 同步位置和状态
      sprite.phaserSprite.setPosition(transform.x, transform.y);
      sprite.phaserSprite.setScale(sprite.scale);
      sprite.phaserSprite.setAlpha(sprite.alpha);
      sprite.phaserSprite.setVisible(sprite.visible);
      sprite.phaserSprite.setRotation(transform.rotation);

      // 同步动画
      const animation = world.getComponent<Animation>(entity, 'Animation');
      if (animation) {
        sprite.phaserSprite.setFlipX(animation.flipX);
      }
    }
  }

  onDestroy(): void {
    // 清理由场景自动处理
  }
}

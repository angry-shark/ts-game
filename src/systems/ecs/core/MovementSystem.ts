// 移动系统

import { World, BaseSystem, SystemPriority } from '@/ecs';
import { Transform } from '@/components/core';
import { Attributes } from '@/components/core';

export class MovementSystem extends BaseSystem {
  constructor() {
    super(SystemPriority.MOVEMENT);
  }

  update(world: World, deltaTime: number): void {
    const entities = world.query('Transform', 'Attributes');

    for (const entity of entities) {
      const transform = world.getComponent<Transform>(entity, 'Transform')!;
      const attributes = world.getComponent<Attributes>(entity, 'Attributes')!;

      // 应用速度
      if (transform.velocityX !== 0 || transform.velocityY !== 0) {
        const speed = attributes.moveSpeed;
        
        // 归一化速度向量
        const length = Math.sqrt(
          transform.velocityX * transform.velocityX + 
          transform.velocityY * transform.velocityY
        );
        
        if (length > 0) {
          transform.x += (transform.velocityX / length) * speed * deltaTime;
          transform.y += (transform.velocityY / length) * speed * deltaTime;
          
          // 更新朝向
          transform.rotation = Math.atan2(transform.velocityY, transform.velocityX);
        }
      }
    }
  }

  // 设置移动方向
  static setVelocity(
    world: World, 
    entity: number, 
    vx: number, 
    vy: number
  ): void {
    const transform = world.getComponent<Transform>(entity, 'Transform');
    if (transform) {
      transform.velocityX = vx;
      transform.velocityY = vy;
    }
  }

  // 停止移动
  static stop(world: World, entity: number): void {
    MovementSystem.setVelocity(world, entity, 0, 0);
  }
}

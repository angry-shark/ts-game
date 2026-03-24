// 移动系统 - 处理平滑移动

import { World, BaseSystem, SystemPriority } from '@/ecs';
import { Transform } from '@/components';

export class MovementSystem extends BaseSystem {
  private moveSpeed: number = 200; // 像素/秒

  constructor() {
    super(SystemPriority.MOVEMENT);
  }

  update(world: World, deltaTime: number): void {
    const entities = world.query('Transform');

    for (const entity of entities) {
      const transform = world.getComponent<Transform>(entity, 'Transform')!;

      if (transform.isMoving && transform.targetX !== null && transform.targetY !== null) {
        const dx = transform.targetX - transform.x;
        const dy = transform.targetY - transform.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 1) {
          // 到达目标
          transform.x = transform.targetX;
          transform.y = transform.targetY;
          transform.targetX = null;
          transform.targetY = null;
          transform.isMoving = false;
        } else {
          // 继续移动
          const moveDistance = this.moveSpeed * deltaTime;
          const ratio = Math.min(moveDistance / distance, 1);
          transform.x += dx * ratio;
          transform.y += dy * ratio;
        }
      }
    }
  }

  // 设置移动目标
  static setTarget(transform: Transform, x: number, y: number): void {
    transform.previousX = transform.x;
    transform.previousY = transform.y;
    transform.targetX = x;
    transform.targetY = y;
    transform.isMoving = true;
  }

  // 检查是否正在移动
  static isMoving(transform: Transform): boolean {
    return transform.isMoving;
  }
}

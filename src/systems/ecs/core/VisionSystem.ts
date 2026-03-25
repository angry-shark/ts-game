// 视野系统：前方扇形可见 + 墙体遮挡

import { BaseSystem, Entity, SystemPriority, World } from '@/ecs';
import { Sprite, Transform, Vision, Wall } from '@/components';

interface WallBlocker {
  entity: Entity;
  transform: Transform;
  wall: Wall;
}

export class VisionSystem extends BaseSystem {
  constructor() {
    super(SystemPriority.ANIMATION);
  }

  update(world: World, _deltaTime: number): void {
    const viewers = world.query('Transform', 'Vision', 'PlayerTag');
    if (viewers.length === 0) return;

    const viewer = viewers[0];
    const viewerTransform = world.getComponent<Transform>(viewer, 'Transform');
    const viewerVision = world.getComponent<Vision>(viewer, 'Vision');

    if (!viewerTransform || !viewerVision) return;

    const blockers = this.collectWallBlockers(world);
    const renderables = world.query('Transform', 'Sprite');
    const visibleSet = new Set<Entity>([viewer]);

    for (const entity of renderables) {
      if (entity === viewer) continue;

      const targetTransform = world.getComponent<Transform>(entity, 'Transform');
      if (!targetTransform) continue;

      if (!this.isInRange(viewerTransform, targetTransform, viewerVision.range)) continue;
      if (!this.isInFov(viewerTransform, targetTransform, viewerVision.fovAngle)) continue;
      if (this.isOccluded(viewerTransform, targetTransform, blockers, entity)) continue;

      visibleSet.add(entity);
    }

    viewerVision.visibleEntities = Array.from(visibleSet);

    for (const entity of renderables) {
      const sprite = world.getComponent<Sprite>(entity, 'Sprite');
      if (!sprite) continue;

      const isVisible = visibleSet.has(entity);
      const isEnemy = world.hasComponent(entity, 'EnemyTag');

      if (entity === viewer) {
        sprite.visible = true;
        sprite.alpha = 1;
        continue;
      }

      // 仅敌人在视野外隐藏；地图要素保持可见（由场景灰化遮罩处理）
      if (isEnemy) {
        sprite.visible = isVisible;
        sprite.alpha = isVisible ? 1 : 0;
      } else {
        sprite.visible = true;
        sprite.alpha = 1;
      }
    }
  }

  private collectWallBlockers(world: World): WallBlocker[] {
    const walls = world.query('Transform', 'Wall');
    const blockers: WallBlocker[] = [];

    for (const entity of walls) {
      const transform = world.getComponent<Transform>(entity, 'Transform');
      const wall = world.getComponent<Wall>(entity, 'Wall');
      if (!transform || !wall) continue;

      blockers.push({ entity, transform, wall });
    }

    return blockers;
  }

  private isInRange(from: Transform, to: Transform, range: number): boolean {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return dx * dx + dy * dy <= range * range;
  }

  private isInFov(viewer: Transform, target: Transform, fovAngleDeg: number): boolean {
    const dx = target.x - viewer.x;
    const dy = target.y - viewer.y;
    const targetAngle = Math.atan2(dy, dx);
    const delta = Math.abs(this.normalizeAngle(targetAngle - viewer.rotation));
    const halfFov = (fovAngleDeg * Math.PI) / 360;
    return delta <= halfFov;
  }

  private isOccluded(
    viewer: Transform,
    target: Transform,
    blockers: WallBlocker[],
    targetEntity: Entity
  ): boolean {
    const targetDistance = Math.hypot(target.x - viewer.x, target.y - viewer.y);

    for (const blocker of blockers) {
      if (blocker.entity === targetEntity) continue;

      const blockerDistance = Math.hypot(
        blocker.transform.x - viewer.x,
        blocker.transform.y - viewer.y
      );
      if (blockerDistance >= targetDistance) continue;

      const distanceToSegment = this.distancePointToSegment(
        blocker.transform.x,
        blocker.transform.y,
        viewer.x,
        viewer.y,
        target.x,
        target.y
      );

      if (distanceToSegment <= blocker.wall.blockRadius) {
        return true;
      }
    }

    return false;
  }

  private distancePointToSegment(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const vx = x2 - x1;
    const vy = y2 - y1;
    const wx = px - x1;
    const wy = py - y1;

    const lengthSq = vx * vx + vy * vy;
    if (lengthSq === 0) {
      return Math.hypot(px - x1, py - y1);
    }

    let t = (wx * vx + wy * vy) / lengthSq;
    t = Math.max(0, Math.min(1, t));

    const closestX = x1 + t * vx;
    const closestY = y1 + t * vy;
    return Math.hypot(px - closestX, py - closestY);
  }

  private normalizeAngle(angle: number): number {
    let normalized = angle;
    while (normalized > Math.PI) normalized -= Math.PI * 2;
    while (normalized < -Math.PI) normalized += Math.PI * 2;
    return normalized;
  }
}
// 变换组件 - 位置和移动

export interface Transform {
  x: number;
  y: number;
  rotation: number;     // 朝向角度
  velocityX: number;
  velocityY: number;
}

export function createTransform(x: number = 0, y: number = 0): Transform {
  return {
    x,
    y,
    rotation: 0,
    velocityX: 0,
    velocityY: 0,
  };
}

// 计算距离
export function distance(a: Transform, b: Transform): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// 计算朝向角度
export function angleTo(from: Transform, to: Transform): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

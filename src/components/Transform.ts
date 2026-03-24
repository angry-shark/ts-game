// 变换组件 - 位置和移动

export interface Position {
  x: number;
  y: number;
}

export interface Transform {
  x: number;
  y: number;
  previousX: number;
  previousY: number;
  targetX: number | null;
  targetY: number | null;
  isMoving: boolean;
}

export function createTransform(x: number, y: number): Transform {
  return {
    x,
    y,
    previousX: x,
    previousY: y,
    targetX: null,
    targetY: null,
    isMoving: false,
  };
}

// 网格位置（用于 Tilemap 逻辑）
export interface GridPosition {
  x: number;  // tile 坐标
  y: number;
}

export function worldToTile(worldX: number, worldY: number, tileSize: number): GridPosition {
  return {
    x: Math.floor(worldX / tileSize),
    y: Math.floor(worldY / tileSize),
  };
}

export function tileToWorld(tileX: number, tileY: number, tileSize: number): Position {
  return {
    x: tileX * tileSize + tileSize / 2,
    y: tileY * tileSize + tileSize / 2,
  };
}

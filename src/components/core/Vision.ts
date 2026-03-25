// 视野与遮挡组件

export interface Vision {
  // 视野半径（世界坐标单位）
  range: number;
  // 扇形角度（度）
  fovAngle: number;
  // 当前可见实体（由 VisionSystem 每帧刷新）
  visibleEntities: number[];
}

export interface Wall {
  // 墙体遮挡半径（用于射线遮挡判定）
  blockRadius: number;
}

export function createVision(range: number = 64 * 3.5, fovAngle: number = 120): Vision {
  return {
    range,
    fovAngle,
    visibleEntities: [],
  };
}

export function createWall(blockRadius: number = 24): Wall {
  return {
    blockRadius,
  };
}
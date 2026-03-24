// AI 组件

export interface AI {
  type: 'aggressive' | 'passive' | 'stationary';
  visionRange: number;
  actionDelay: number;
  currentDelay: number;
  state: 'idle' | 'chase' | 'attack' | 'flee';
}

export function createAI(type: AI['type'], visionRange = 8): AI {
  return {
    type,
    visionRange,
    actionDelay: 0.2,
    currentDelay: 0,
    state: 'idle',
  };
}

// 回合制标记
export interface TurnBased {
  hasActed: boolean;
  actionPoints: number;
  maxActionPoints: number;
}

export function createTurnBased(actionPoints = 1): TurnBased {
  return {
    hasActed: false,
    actionPoints,
    maxActionPoints: actionPoints,
  };
}

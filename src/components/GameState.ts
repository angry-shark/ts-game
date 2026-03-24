// 游戏状态组件

export interface GameStateComponent {
  floor: number;
  score: number;
  turn: number;
  isPlayerTurn: boolean;
  gameOver: boolean;
  victory: boolean;
}

export function createGameState(): GameStateComponent {
  return {
    floor: 1,
    score: 0,
    turn: 0,
    isPlayerTurn: true,
    gameOver: false,
    victory: false,
  };
}

// 楼梯组件（用于进入下一层）
export interface Stairs {
  targetFloor: number;
}

// 玩家标记组件（用于快速查找玩家）
export interface PlayerTag {}

// 敌人标记组件
export interface EnemyTag {
  scoreValue: number;
}

export function createEnemyTag(floor: number): EnemyTag {
  return {
    scoreValue: 10 * floor,
  };
}

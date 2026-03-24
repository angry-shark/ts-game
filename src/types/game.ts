// 游戏核心类型定义

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GameConfig {
  tileSize: number;
  mapWidth: number;
  mapHeight: number;
}

// 实体类型
export enum EntityType {
  PLAYER = 'player',
  ENEMY = 'enemy',
  ITEM = 'item',
  STAIRS = 'stairs',
}

// 战斗相关
export interface Stats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
}

// 地图格子类型
export enum TileType {
  WALL = 0,
  FLOOR = 1,
  DOOR = 2,
}

// 房间定义
export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  center: Position;
}

// 游戏状态
export interface GameState {
  floor: number;
  score: number;
  turn: number;
}

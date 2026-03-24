// 组件导出

export type { Transform, Position, GridPosition } from './Transform';
export { createTransform, worldToTile, tileToWorld } from './Transform';

export type { Sprite, Animation, FloatingText } from './Render';
export { createSprite, createAnimation, createFloatingText } from './Render';

export type { Stats, Combatant, DamageEvent, HealEvent } from './Combat';
export { createStats, createCombatant } from './Combat';

export type { AI, TurnBased } from './AI';
export { createAI, createTurnBased } from './AI';

export type { Item, PickupEvent, Inventory } from './Item';
export { createItem, createInventory } from './Item';

export type { GameStateComponent, Stairs, PlayerTag, EnemyTag } from './GameState';
export { createGameState, createEnemyTag } from './GameState';

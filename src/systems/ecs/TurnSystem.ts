// 回合系统 - 管理回合制流程

import { World, BaseSystem, SystemPriority, Entity } from '@/ecs';
import { GameStateComponent, TurnBased, Stats } from '@/components';

export class TurnSystem extends BaseSystem {
  private onTurnEndCallback: (() => void) | null = null;
  private onPlayerDeathCallback: (() => void) | null = null;

  constructor(_scene: Phaser.Scene) {
    super(SystemPriority.INPUT + 50); // 在输入系统之后
  }

  update(world: World, _deltaTime: number): void {
    const gameState = this.getGameState(world);
    if (!gameState || gameState.gameOver) return;

    if (gameState.isPlayerTurn) {
      this.processPlayerTurn(world, gameState);
    } else {
      this.processEnemyTurn(world, gameState);
    }

    // 检查玩家死亡
    this.checkPlayerDeath(world);
  }

  private processPlayerTurn(world: World, gameState: GameStateComponent): void {
    const player = this.findPlayer(world);
    if (!player) return;

    const turnBased = world.getComponent<TurnBased>(player, 'TurnBased');
    if (!turnBased) return;

    // 检查玩家是否完成行动
    if (turnBased.hasActed) {
      // 等待移动完成
      const transform = world.getComponent(player, 'Transform');
      const isMoving = transform ? this.isMoving(transform) : false;

      if (!isMoving) {
        // 玩家回合结束
        gameState.isPlayerTurn = false;
        gameState.turn++;
        
        // 重置所有敌人的行动状态
        this.resetEnemyTurns(world);
      }
    }
  }

  private processEnemyTurn(world: World, gameState: GameStateComponent): void {
    const enemies = world.query('EnemyTag', 'TurnBased');
    const allEnemiesActed = enemies.every(entity => {
      const turnBased = world.getComponent<TurnBased>(entity, 'TurnBased');
      return turnBased?.hasActed ?? true;
    });

    // 检查所有敌人是否完成移动
    const allEnemiesDoneMoving = enemies.every(entity => {
      const turnBased = world.getComponent<TurnBased>(entity, 'TurnBased');
      if (!turnBased?.hasActed) return false;
      
      const transform = world.getComponent(entity, 'Transform');
      return transform ? !this.isMoving(transform) : true;
    });

    if (allEnemiesActed && allEnemiesDoneMoving) {
      // 敌人回合结束，回到玩家回合
      gameState.isPlayerTurn = true;
      this.resetPlayerTurn(world);
      this.onTurnEndCallback?.();
    }
  }

  private checkPlayerDeath(world: World): void {
    const player = this.findPlayer(world);
    if (!player) return;

    const stats = world.getComponent<Stats>(player, 'Stats');
    if (stats && stats.hp <= 0) {
      const gameState = this.getGameState(world);
      if (gameState) {
        gameState.gameOver = true;
      }
      this.onPlayerDeathCallback?.();
    }
  }

  private findPlayer(world: World): Entity | null {
    const players = world.query('PlayerTag');
    return players.length > 0 ? players[0] : null;
  }

  private getGameState(world: World): GameStateComponent | null {
    const entities = world.query('GameStateComponent');
    if (entities.length === 0) return null;
    return world.getComponent<GameStateComponent>(entities[0], 'GameStateComponent')!;
  }

  private resetPlayerTurn(world: World): void {
    const player = this.findPlayer(world);
    if (player) {
      const turnBased = world.getComponent<TurnBased>(player, 'TurnBased');
      if (turnBased) {
        turnBased.hasActed = false;
      }
    }
  }

  private resetEnemyTurns(world: World): void {
    const enemies = world.query('EnemyTag', 'TurnBased');
    for (const enemy of enemies) {
      const turnBased = world.getComponent<TurnBased>(enemy, 'TurnBased');
      if (turnBased) {
        turnBased.hasActed = false;
      }
    }
  }

  private isMoving(transform: { isMoving?: boolean }): boolean {
    return transform.isMoving ?? false;
  }

  setOnTurnEndCallback(callback: () => void): void {
    this.onTurnEndCallback = callback;
  }

  setOnPlayerDeathCallback(callback: () => void): void {
    this.onPlayerDeathCallback = callback;
  }

  // 强制结束当前回合
  static forceEndTurn(world: World): void {
    const gameState = world.query('GameStateComponent');
    if (gameState.length > 0) {
      const state = world.getComponent<GameStateComponent>(gameState[0], 'GameStateComponent')!;
      state.isPlayerTurn = !state.isPlayerTurn;
    }
  }
}

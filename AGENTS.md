# Project: rogue-game

## Project Overview

**rogue-game** is a roguelike 2D game built with Phaser 3 + TypeScript + Vite, now using **ECS (Entity-Component-System)** architecture.

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Phaser | 3.90 | Game Engine |
| TypeScript | 6.0+ | Language |
| Vite | 8.0+ | Build Tool |
| Tauri v2 | 2.4+ | Desktop (Win/macOS/Linux) |
| Capacitor | 7.2+ | Mobile (iOS/Android) |

### ECS Architecture

The project now uses a custom lightweight ECS implementation:

```
src/
├── ecs/                 # ECS Core Framework
│   ├── World.ts         # Entity & Component management
│   └── index.ts
├── components/          # Pure data components
│   ├── Transform.ts     # Position & movement
│   ├── Render.ts        # Sprite & animation
│   ├── Combat.ts        # Stats & combat state
│   ├── AI.ts            # Enemy behavior
│   ├── Item.ts          # Collectible items
│   └── GameState.ts     # Game progress
├── systems/ecs/         # Game logic systems
│   ├── RenderSystem.ts
│   ├── MovementSystem.ts
│   ├── CombatSystem.ts
│   ├── InputSystem.ts
│   ├── AISystem.ts
│   ├── TurnSystem.ts
│   ├── ItemSystem.ts
│   └── CleanupSystem.ts
├── factories/           # Entity factories
│   └── EntityFactory.ts
└── scenes/              # Game scenes using ECS
    ├── ECSScene.ts      # Main game scene (ECS)
    └── ECSUIScene.ts    # UI scene (ECS)
```

### ECS Core Concepts

1. **Entity** - Just an ID (number)
2. **Component** - Pure data structures
3. **System** - Logic that processes entities with specific components

### Example Usage

```typescript
// Create an entity
const player = world.createEntity();

// Add components
world.addComponent(player, 'Transform', { x: 100, y: 100, ... });
world.addComponent(player, 'Sprite', { texture: 'player', ... });
world.addComponent(player, 'Stats', { hp: 30, attack: 5, ... });

// Systems automatically process entities
// - RenderSystem: Syncs Transform to Phaser Sprite
// - CombatSystem: Processes DamageEvent components
// - InputSystem: Handles keyboard input for player
```

### Build Commands

```bash
pnpm dev          # Development
pnpm build        # Web build
pnpm tauri:dev    # Desktop dev
pnpm tauri:build  # Desktop build
```

### Project Structure

```
rogue-game/
├── src/
│   ├── ecs/             # ECS Framework
│   ├── components/      # Component definitions
│   ├── systems/ecs/     # ECS Systems
│   ├── systems/         # Legacy systems (MapSystem)
│   ├── factories/       # Entity factories
│   ├── scenes/          # Phaser scenes
│   ├── entities/        # Legacy entity classes
│   ├── types/           # TypeScript types
│   └── utils/           # Utilities
├── src-tauri/           # Tauri config
└── capacitor.config.ts  # Capacitor config
```

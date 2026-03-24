// ECS 核心 - World 管理所有实体、组件和系统

export type Entity = number;

export class World {
  private nextEntityId: Entity = 0;
  private entities: Set<Entity> = new Set();
  private componentStores: Map<string, Map<Entity, unknown>> = new Map();
  private systems: System[] = [];
  private systemsToRemove: System[] = [];
  private entityDestructionQueue: Entity[] = [];

  // 实体管理
  createEntity(): Entity {
    const entity = this.nextEntityId++;
    this.entities.add(entity);
    return entity;
  }

  destroyEntity(entity: Entity): void {
    this.entityDestructionQueue.push(entity);
  }

  private processEntityDestruction(): void {
    for (const entity of this.entityDestructionQueue) {
      this.entities.delete(entity);
      for (const store of this.componentStores.values()) {
        store.delete(entity);
      }
    }
    this.entityDestructionQueue = [];
  }

  // 组件管理
  addComponent<T>(entity: Entity, componentName: string, component: T): void {
    if (!this.componentStores.has(componentName)) {
      this.componentStores.set(componentName, new Map());
    }
    this.componentStores.get(componentName)!.set(entity, component);
  }

  removeComponent(entity: Entity, componentName: string): void {
    this.componentStores.get(componentName)?.delete(entity);
  }

  getComponent<T>(entity: Entity, componentName: string): T | undefined {
    return this.componentStores.get(componentName)?.get(entity) as T | undefined;
  }

  hasComponent(entity: Entity, componentName: string): boolean {
    return this.componentStores.get(componentName)?.has(entity) ?? false;
  }

  hasComponents(entity: Entity, ...componentNames: string[]): boolean {
    return componentNames.every(name => this.hasComponent(entity, name));
  }

  // 查询具有指定组件的所有实体
  query(...componentNames: string[]): Entity[] {
    const result: Entity[] = [];
    for (const entity of this.entities) {
      if (this.hasComponents(entity, ...componentNames)) {
        result.push(entity);
      }
    }
    return result;
  }

  // 系统管理
  addSystem(system: System): void {
    this.systems.push(system);
    system.onInit?.(this);
  }

  removeSystem(system: System): void {
    this.systemsToRemove.push(system);
  }

  private processSystemRemoval(): void {
    for (const system of this.systemsToRemove) {
      const index = this.systems.indexOf(system);
      if (index > -1) {
        this.systems.splice(index, 1);
        system.onDestroy?.();
      }
    }
    this.systemsToRemove = [];
  }

  // 游戏循环
  update(deltaTime: number): void {
    for (const system of this.systems) {
      system.update(this, deltaTime);
    }
    this.processEntityDestruction();
    this.processSystemRemoval();
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities);
  }

  clear(): void {
    this.entities.clear();
    this.componentStores.clear();
    this.systems = [];
    this.entityDestructionQueue = [];
    this.nextEntityId = 0;
  }
}

// 系统接口
export interface System {
  onInit?(world: World): void;
  update(world: World, deltaTime: number): void;
  onDestroy?(): void;
}

// 系统执行顺序
export enum SystemPriority {
  INPUT = 0,
  AI = 100,
  MOVEMENT = 200,
  COMBAT = 300,
  ANIMATION = 400,
  RENDER = 500,
  UI = 600,
  CLEANUP = 700,
}

// 带优先级的系统基类
export abstract class BaseSystem implements System {
  readonly priority: SystemPriority;

  constructor(priority: SystemPriority = SystemPriority.RENDER) {
    this.priority = priority;
  }

  abstract update(world: World, deltaTime: number): void;
  onInit?(world: World): void;
  onDestroy?(): void;
}

// 系统管理器（按优先级排序）
export class SystemManager {
  private systems: BaseSystem[] = [];

  addSystem(system: BaseSystem): void {
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  update(world: World, deltaTime: number): void {
    for (const system of this.systems) {
      system.update(world, deltaTime);
    }
  }
}

import Phaser from 'phaser';
import type { Position, Room } from '@/types/game';
import { TileType } from '@/types/game';

export class MapSystem {
  private scene: Phaser.Scene;
  private width: number;
  private height: number;
  private tileSize: number = 32;
  private map: TileType[][];
  private rooms: Room[] = [];
  private tilemap!: Phaser.Tilemaps.Tilemap;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;

  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.map = [];
  }

  generate(): void {
    this.initializeMap();
    this.generateRooms();
    this.connectRooms();
    this.createTilemap();
  }

  private initializeMap(): void {
    this.map = [];
    for (let y = 0; y < this.height; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.map[y][x] = TileType.WALL;
      }
    }
    this.rooms = [];
  }

  private generateRooms(): void {
    const maxRooms = 15;
    const minRoomSize = 4;
    const maxRoomSize = 10;

    for (let i = 0; i < maxRooms; i++) {
      const roomWidth = Phaser.Math.Between(minRoomSize, maxRoomSize);
      const roomHeight = Phaser.Math.Between(minRoomSize, maxRoomSize);
      const x = Phaser.Math.Between(1, this.width - roomWidth - 2);
      const y = Phaser.Math.Between(1, this.height - roomHeight - 2);

      const newRoom: Room = {
        x,
        y,
        width: roomWidth,
        height: roomHeight,
        center: {
          x: Math.floor(x + roomWidth / 2),
          y: Math.floor(y + roomHeight / 2),
        },
      };

      // 检查房间重叠
      let overlaps = false;
      for (const room of this.rooms) {
        if (this.roomsIntersect(newRoom, room)) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        this.createRoom(newRoom);
        this.rooms.push(newRoom);
      }
    }
  }

  private roomsIntersect(a: Room, b: Room): boolean {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }

  private createRoom(room: Room): void {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        this.map[y][x] = TileType.FLOOR;
      }
    }
  }

  private connectRooms(): void {
    for (let i = 0; i < this.rooms.length - 1; i++) {
      const roomA = this.rooms[i];
      const roomB = this.rooms[i + 1];
      this.createCorridor(roomA.center, roomB.center);
    }
  }

  private createCorridor(start: Position, end: Position): void {
    // 随机决定先水平还是先垂直
    if (Math.random() > 0.5) {
      this.createHorizontalCorridor(start.x, end.x, start.y);
      this.createVerticalCorridor(start.y, end.y, end.x);
    } else {
      this.createVerticalCorridor(start.y, end.y, start.x);
      this.createHorizontalCorridor(start.x, end.x, end.y);
    }
  }

  private createHorizontalCorridor(x1: number, x2: number, y: number): void {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) {
      this.map[y][x] = TileType.FLOOR;
    }
  }

  private createVerticalCorridor(y1: number, y2: number, x: number): void {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) {
      this.map[y][x] = TileType.FLOOR;
    }
  }

  private createTilemap(): void {
    // 创建 tilemap
    this.tilemap = this.scene.make.tilemap({
      tileWidth: this.tileSize,
      tileHeight: this.tileSize,
      width: this.width,
      height: this.height,
    });

    // 添加 tileset
    const floorTileset = this.tilemap.addTilesetImage('floor');
    const wallTileset = this.tilemap.addTilesetImage('wall');

    // 创建图层
    this.groundLayer = this.tilemap.createBlankLayer('ground', floorTileset!)!;
    const wallLayer = this.tilemap.createBlankLayer('walls', wallTileset!)!;

    // 填充地图
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.map[y][x] === TileType.FLOOR) {
          this.groundLayer.putTileAt(0, x, y);
        } else {
          wallLayer.putTileAt(0, x, y);
        }
      }
    }

    // 设置墙壁碰撞
    wallLayer.setCollisionByExclusion([-1]);

    // 墙壁碰撞已设置
    // 实体与墙壁的碰撞在 GameScene 中单独处理
  }

  isWall(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
      return true;
    }
    return this.map[tileY][tileX] === TileType.WALL;
  }

  worldToTile(worldX: number, worldY: number): Position {
    return {
      x: Math.floor(worldX / this.tileSize),
      y: Math.floor(worldY / this.tileSize),
    };
  }

  tileToWorld(tileX: number, tileY: number): Position {
    return {
      x: tileX * this.tileSize + this.tileSize / 2,
      y: tileY * this.tileSize + this.tileSize / 2,
    };
  }

  getRooms(): Room[] {
    return this.rooms;
  }

  getTileSize(): number {
    return this.tileSize;
  }
}

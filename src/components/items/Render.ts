// 渲染组件

export interface Sprite {
  texture: string;
  scale: number;
  alpha: number;
  visible: boolean;
  depth: number;
  phaserSprite: Phaser.GameObjects.Sprite | null;
}

export interface Animation {
  currentAnim: string | null;
  isPlaying: boolean;
  flipX: boolean;
}

export function createSprite(texture: string): Sprite {
  return {
    texture,
    scale: 1,
    alpha: 1,
    visible: true,
    depth: 0,
    phaserSprite: null,
  };
}

export function createAnimation(): Animation {
  return {
    currentAnim: null,
    isPlaying: false,
    flipX: false,
  };
}

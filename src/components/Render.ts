// 渲染组件

export interface Sprite {
  phaserSprite: Phaser.GameObjects.Sprite | null;
  texture: string;
  scale: number;
  alpha: number;
  tint: number;
  depth: number;
  visible: boolean;
}

export function createSprite(texture: string, scale = 1): Sprite {
  return {
    phaserSprite: null,
    texture,
    scale,
    alpha: 1,
    tint: 0xffffff,
    depth: 0,
    visible: true,
  };
}

// 动画组件
export interface Animation {
  currentAnimation: string | null;
  isPlaying: boolean;
  flipX: boolean;
  flipY: boolean;
}

export function createAnimation(): Animation {
  return {
    currentAnimation: null,
    isPlaying: false,
    flipX: false,
    flipY: false,
  };
}

// 浮动文字效果组件
export interface FloatingText {
  text: string;
  color: string;
  lifeTime: number;
  maxLifeTime: number;
  velocityY: number;
}

export function createFloatingText(text: string, color: string): FloatingText {
  return {
    text,
    color,
    lifeTime: 1.0,
    maxLifeTime: 1.0,
    velocityY: -40,
  };
}

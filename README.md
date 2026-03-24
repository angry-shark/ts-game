# Rogue Game

一个基于 **Phaser 3 + TypeScript + Vite** 开发的 Roguelike 2D 游戏。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Phaser | 3.90 | 游戏引擎 |
| TypeScript | 6.0+ | 开发语言 |
| Vite | 8.0+ | 构建工具 |
| Tauri v2 | 2.4+ | 桌面端打包 (Windows/macOS/Linux) |
| Capacitor | 7.2+ | 移动端打包 (iOS/Android) |

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建 Web 版本

```bash
pnpm build
```

## 跨平台打包

### 桌面端 (Tauri)

```bash
# 开发模式
pnpm tauri:dev

# 构建生产版本
pnpm tauri:build
```

构建完成后，安装包位于 `src-tauri/target/release/bundle/`。

### 移动端 (Capacitor)

```bash
# 1. 构建 Web 资源
pnpm build

# 2. 添加平台（首次需要）
pnpm cap:add:android
pnpm cap:add:ios

# 3. 同步 Web 资源到原生项目
pnpm cap:sync

# 4. 打开原生 IDE
pnpm cap:open:android  # Android Studio
pnpm cap:open:ios      # Xcode
```

## 游戏操作

| 按键 | 功能 |
|------|------|
| ↑ ↓ ← → / WASD | 移动角色 |
| SPACE | 等待一回合 |
| 方向键 + 敌人 | 攻击 |
| ESC | 返回/暂停 |

## 项目结构

```
rogue-game/
├── src/
│   ├── scenes/          # 游戏场景
│   │   ├── BootScene.ts      # 启动场景（资源加载）
│   │   ├── MainMenuScene.ts  # 主菜单
│   │   ├── GameScene.ts      # 主游戏场景
│   │   ├── UIScene.ts        # UI 场景
│   │   └── GameOverScene.ts  # 游戏结束
│   ├── entities/        # 游戏实体
│   │   ├── Player.ts    # 玩家
│   │   ├── Enemy.ts     # 敌人
│   │   └── Item.ts      # 物品
│   ├── systems/         # 游戏系统
│   │   └── MapSystem.ts # 地图生成系统
│   ├── types/           # TypeScript 类型
│   │   └── game.ts
│   ├── utils/           # 工具函数
│   │   └── index.ts
│   └── main.ts          # 游戏入口
├── src-tauri/           # Tauri 桌面端配置
├── assets/              # 游戏资源
├── dist/                # 构建输出
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── capacitor.config.ts  # Capacitor 配置
```

## 游戏特性

- 🗺️ **程序化地图生成**：每次游戏生成不同的地下城布局
- 👾 **回合制战斗**：经典的 roguelike 战斗系统
- 📈 **渐进难度**：随着层数增加，敌人会变强
- 🎨 **程序化纹理**：无需外部资源，自动生成的游戏素材
- 📱 **跨平台支持**：Web、桌面端、移动端全覆盖

## 平台支持状态

| 平台 | 状态 | 工具 |
|------|------|------|
| Web | ✅ 完成 | Vite |
| Windows | ✅ 支持 | Tauri v2 |
| macOS | ✅ 支持 | Tauri v2 |
| Linux | ✅ 支持 | Tauri v2 |
| iOS | ✅ 支持 | Capacitor |
| Android | ✅ 支持 | Capacitor |
| Steam | 🚧 需接入 Steamworks.js | Tauri |

## License

ISC

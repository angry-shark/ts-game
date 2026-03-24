// 卡牌战斗场景 - 杀戮尖塔风格

import Phaser from 'phaser';

import { 
  Card, Deck, CardCombatState,
  createStarterDeck, initCombatDeck, drawCards, playCard, discardHand,
  createCardCombatState, calculateOutgoingDamage, calculateBlock,
  endTurnEffects, addDebuff
} from '@/components/card';

export class CardBattleScene extends Phaser.Scene {
  // World reference if needed for ECS
  private playerState!: CardCombatState;
  private enemyState!: CardCombatState;
  private deck!: Deck;
  
  // UI 元素
  private handSprites: Phaser.GameObjects.Container[] = [];
  private energyText!: Phaser.GameObjects.Text;
  private endTurnButton!: Phaser.GameObjects.Container;
  private playerHpText!: Phaser.GameObjects.Text;
  private playerBlockText!: Phaser.GameObjects.Text;
  private enemyHpText!: Phaser.GameObjects.Text;
  private enemyBlockText!: Phaser.GameObjects.Text;
  private enemyIntentText!: Phaser.GameObjects.Text;
  
  // 卡牌选中状态
  // Card selection handled in onCardClick
  
  // 敌人意图
  private enemyIntent: { type: 'attack' | 'defend' | 'buff'; value: number } = { type: 'attack', value: 10 };
  
  // 暴露战斗状态供外部检查
  getPlayerState(): CardCombatState {
    return this.playerState;
  }

  constructor() {
    super({ key: 'CardBattleScene' });
  }

  init(data: { playerMaxHp: number; enemyName: string; enemyMaxHp: number }): void {
    // 初始化战斗状态
    this.playerState = createCardCombatState(data.playerMaxHp, 3);
    this.enemyState = createCardCombatState(data.enemyMaxHp);
    
    // 初始化卡组
    this.deck = createStarterDeck();
    initCombatDeck(this.deck);
    
    // 初始抽牌
    drawCards(this.deck, 5);
  }

  create(): void {
    // 背景
    this.add.rectangle(640, 360, 1280, 720, 0x1a1a2e);
    
    // 创建UI
    this.createPlayerUI();
    this.createEnemyUI();
    this.createHandUI();
    this.createEndTurnButton();
    
    // 更新显示
    this.updateUI();
  }

  private createPlayerUI(): void {
    const { height } = this.cameras.main;
    
    // 玩家区域（左下）
    const playerX = 150;
    const playerY = height - 150;
    
    // 玩家形象
    this.add.circle(playerX, playerY, 40, 0x3b82f6);
    this.add.text(playerX, playerY, '你', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
    
    // HP
    this.playerHpText = this.add.text(playerX - 50, playerY + 60, '', {
      fontSize: '20px',
      color: '#ef4444',
    });
    
    // 格挡
    this.playerBlockText = this.add.text(playerX - 50, playerY + 85, '', {
      fontSize: '18px',
      color: '#3b82f6',
    });
    
    // 能量
    this.energyText = this.add.text(50, height - 250, '', {
      fontSize: '32px',
      color: '#fbbf24',
    });
  }

  private createEnemyUI(): void {
    const { width } = this.cameras.main;
    
    // 敌人区域（右上）
    const enemyX = width - 150;
    const enemyY = 200;
    
    // 敌人形象
    this.add.circle(enemyX, enemyY, 50, 0xef4444);
    this.add.text(enemyX, enemyY, '妖兽', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
    
    // HP
    this.enemyHpText = this.add.text(enemyX - 50, enemyY + 70, '', {
      fontSize: '20px',
      color: '#ef4444',
    });
    
    // 格挡
    this.enemyBlockText = this.add.text(enemyX - 50, enemyY + 95, '', {
      fontSize: '18px',
      color: '#3b82f6',
    });
    
    // 意图
    this.enemyIntentText = this.add.text(enemyX - 60, enemyY - 80, '', {
      fontSize: '18px',
      color: '#fbbf24',
    });
  }

  private createHandUI(): void {
    // 清空旧的手牌显示
    this.handSprites.forEach(s => s.destroy());
    this.handSprites = [];
    
    const { width, height } = this.cameras.main;
    const cardWidth = 120;
    const spacing = 30;
    const startX = (width - (this.deck.hand.length * (cardWidth + spacing) - spacing)) / 2 + cardWidth / 2;
    const cardY = height - 150;
    
    this.deck.hand.forEach((card, index) => {
      const container = this.createCardSprite(card, startX + index * (cardWidth + spacing), cardY);
      container.setData('cardIndex', index);
      
      // 交互
      const zone = container.getAt(0) as Phaser.GameObjects.Rectangle;
      zone.setInteractive();
      
      zone.on('pointerover', () => {
        container.setScale(1.1);
        container.y -= 20;
      });
      
      zone.on('pointerout', () => {
        container.setScale(1);
        container.y = cardY;
      });
      
      zone.on('pointerdown', () => {
        this.onCardClick(index);
      });
      
      this.handSprites.push(container);
    });
  }

  private createCardSprite(card: Card, x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // 卡牌背景
    const bg = this.add.rectangle(0, 0, 120, 180, this.getCardColor(card.type));
    bg.setStrokeStyle(2, 0xffffff);
    
    // 费用
    const costBg = this.add.circle(-45, -75, 15, 0x7c3aed);
    const costText = this.add.text(-45, -75, card.cost.toString(), {
      fontSize: '18px',
      color: '#fff',
    }).setOrigin(0.5);
    
    // 名称
    const nameText = this.add.text(0, -60, card.name, {
      fontSize: '14px',
      color: '#fff',
    }).setOrigin(0.5);
    
    // 类型
    const typeText = this.add.text(0, -35, this.getCardTypeName(card.type), {
      fontSize: '12px',
      color: '#aaa',
    }).setOrigin(0.5);
    
    // 描述
    const descText = this.add.text(0, 20, card.description, {
      fontSize: '11px',
      color: '#ddd',
      align: 'center',
      wordWrap: { width: 100 },
    }).setOrigin(0.5);
    
    container.add([bg, costBg, costText, nameText, typeText, descText]);
    
    return container;
  }

  private getCardColor(type: Card['type']): number {
    const colors: Record<string, number> = {
      attack: 0xef4444,
      skill: 0x3b82f6,
      power: 0x22c55e,
      status: 0x666666,
    };
    return colors[type] || 0x666666;
  }

  private getCardTypeName(type: Card['type']): string {
    const names: Record<string, string> = {
      attack: '攻击',
      skill: '技能',
      power: '能力',
      status: '状态',
    };
    return names[type] || type;
  }

  private createEndTurnButton(): void {
    const { width, height } = this.cameras.main;
    
    this.endTurnButton = this.add.container(width - 100, height / 2);
    
    const bg = this.add.rectangle(0, 0, 100, 40, 0xf59e0b);
    bg.setInteractive({ useHandCursor: true });
    
    const text = this.add.text(0, 0, '结束回合', {
      fontSize: '16px',
      color: '#000',
    }).setOrigin(0.5);
    
    bg.on('pointerdown', () => {
      this.endPlayerTurn();
    });
    
    this.endTurnButton.add([bg, text]);
  }

  private onCardClick(index: number): void {
    if (!this.playerState.isPlayerTurn) return;
    
    const card = this.deck.hand[index];
    
    // 检查能量
    if (card.cost > this.playerState.energy) {
      console.log('能量不足!');
      return;
    }
    
    // 执行卡牌效果
    this.playCard(index);
  }

  private playCard(index: number): void {
    const card = this.deck.hand[index];
    
    // 消耗能量
    this.playerState.energy -= card.cost;
    
    // 执行效果
    for (const effect of card.effects) {
      switch (effect.type) {
        case 'damage':
          const damage = calculateOutgoingDamage(this.playerState, effect.value);
          this.enemyState.hp -= damage;
          break;
        case 'block':
          const blockAmount = calculateBlock(this.playerState, effect.value);
          this.playerState.block += blockAmount;
          console.log(`获得 ${blockAmount} 点格挡，当前格挡: ${this.playerState.block}`);
          break;
        case 'vulnerable':
          addDebuff(this.enemyState, 'vulnerable', effect.value, effect.value);
          break;
      }
    }
    
    // 打出卡牌
    playCard(this.deck, index);
    
    // 检查战斗结束（在UI更新前！）
    if (this.checkCombatEnd()) {
      return; // 战斗结束，不再继续，不更新UI
    }
    
    // 更新UI（只有战斗未结束才更新）
    this.createHandUI();
    this.updateUI();
  }

  private endPlayerTurn(): void {
    if (!this.playerState.isPlayerTurn) return;
    
    this.playerState.isPlayerTurn = false;
    
    // 弃牌
    discardHand(this.deck);
    
    // 敌人回合
    this.enemyTurn();
  }

  private enemyTurn(): void {
    // 敌人行动
    switch (this.enemyIntent.type) {
      case 'attack':
        let damage = this.enemyIntent.value;
        // 易伤增加50%伤害
        const vulnerable = this.playerState.debuffs.find(d => d.type === 'vulnerable');
        if (vulnerable) {
          damage = Math.floor(damage * 1.5);
        }
        // 先扣格挡
        if (this.playerState.block > 0) {
          const blocked = Math.min(this.playerState.block, damage);
          this.playerState.block -= blocked;
          damage -= blocked;
        }
        this.playerState.hp -= damage;
        break;
      case 'defend':
        this.enemyState.block += this.enemyIntent.value;
        break;
    }
    
    // 回合结束效果 - 清除玩家格挡（敌人攻击后）
    endTurnEffects(this.playerState);
    
    // 回合结束效果 - 清除敌人格挡
    endTurnEffects(this.enemyState);
    
    // 检查战斗结束
    if (this.checkCombatEnd()) return;
    
    // 开始玩家回合
    this.startPlayerTurn();
  }

  private startPlayerTurn(): void {
    this.playerState.turn++;
    this.playerState.energy = this.playerState.maxEnergy;
    this.playerState.isPlayerTurn = true;
    
    // 抽牌
    drawCards(this.deck, 5);
    
    // 随机生成敌人意图
    this.generateEnemyIntent();
    
    // 更新UI
    this.createHandUI();
    this.updateUI();
  }

  private generateEnemyIntent(): void {
    const intents = [
      { type: 'attack' as const, value: 10 },
      { type: 'attack' as const, value: 15 },
      { type: 'defend' as const, value: 10 },
    ];
    this.enemyIntent = intents[Math.floor(Math.random() * intents.length)];
  }

  private checkCombatEnd(): boolean {
    if (this.enemyState.hp <= 0) {
      this.playerState.victory = true;
      this.playerState.combatEnded = true;
      this.endCombat();
      return true;
    }
    
    if (this.playerState.hp <= 0) {
      this.playerState.victory = false;
      this.playerState.combatEnded = true;
      this.endCombat();
      return true;
    }
    
    return false;
  }

  private endCombat(): void {
    // 发送战斗结束事件到场景管理器，让 WorldScene 能收到
    this.game.events.emit('combatEnd', { victory: this.playerState.victory });
    
    // 立即返回大地图（最小延迟确保事件发送）
    this.time.delayedCall(100, () => {
      this.scene.stop();
      this.scene.resume('WorldScene');
    });
  }

  private updateUI(): void {
    // 玩家状态
    this.playerHpText.setText(`HP: ${this.playerState.hp}/${this.playerState.maxHp}`);
    this.playerBlockText.setText(`格挡: ${this.playerState.block}`);
    this.playerBlockText.setVisible(this.playerState.block > 0);
    this.energyText.setText(`能量: ${this.playerState.energy}/${this.playerState.maxEnergy}`);
    
    // 敌人状态
    this.enemyHpText.setText(`HP: ${this.enemyState.hp}/${this.enemyState.maxHp}`);
    this.enemyBlockText.setText(`格挡: ${this.enemyState.block}`);
    this.enemyBlockText.setVisible(this.enemyState.block > 0);
    
    // 敌人意图
    const intentText = this.enemyIntent.type === 'attack' 
      ? `攻击 ${this.enemyIntent.value}` 
      : `防御 ${this.enemyIntent.value}`;
    this.enemyIntentText.setText(`意图: ${intentText}`);
  }
}

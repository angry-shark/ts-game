// 卡组组件

import { Card } from './Card';

export interface Deck {
  // 牌组（战斗外）
  masterDeck: Card[];
  
  // 战斗中
  drawPile: Card[];     // 抽牌堆
  hand: Card[];         // 手牌
  discardPile: Card[];  // 弃牌堆
  exhaustPile: Card[];  // 消耗堆
}

export function createDeck(): Deck {
  return {
    masterDeck: [],
    drawPile: [],
    hand: [],
    discardPile: [],
    exhaustPile: [],
  };
}

// 创建初始卡组（3张打击 + 3张防御）
export function createStarterDeck(): Deck {
  const deck = createDeck();
  
  // 添加基础牌
  for (let i = 0; i < 4; i++) {
    deck.masterDeck.push(createStrike());
  }
  for (let i = 0; i < 4; i++) {
    deck.masterDeck.push(createDefend());
  }
  deck.masterDeck.push(createBash());
  
  return deck;
}

// 洗牌
export function shuffleDeck(deck: Deck): void {
  for (let i = deck.drawPile.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck.drawPile[i], deck.drawPile[j]] = [deck.drawPile[j], deck.drawPile[i]];
  }
}

// 战斗开始时初始化
export function initCombatDeck(deck: Deck): void {
  // 将所有牌放入抽牌堆
  deck.drawPile = [...deck.masterDeck];
  deck.hand = [];
  deck.discardPile = [];
  deck.exhaustPile = [];
  
  // 洗牌
  shuffleDeck(deck);
}

// 抽牌
export function drawCards(deck: Deck, amount: number): Card[] {
  const drawn: Card[] = [];
  
  for (let i = 0; i < amount; i++) {
    // 如果抽牌堆空了，洗牌
    if (deck.drawPile.length === 0) {
      if (deck.discardPile.length === 0) break;
      deck.drawPile = [...deck.discardPile];
      deck.discardPile = [];
      shuffleDeck(deck);
    }
    
    // 抽一张
    const card = deck.drawPile.pop();
    if (card) {
      deck.hand.push(card);
      drawn.push(card);
    }
  }
  
  return drawn;
}

// 打出牌
export function playCard(deck: Deck, cardIndex: number): Card | null {
  if (cardIndex < 0 || cardIndex >= deck.hand.length) return null;
  
  const card = deck.hand.splice(cardIndex, 1)[0];
  
  if (card.exhaust) {
    deck.exhaustPile.push(card);
  } else {
    deck.discardPile.push(card);
  }
  
  return card;
}

// 弃置手牌
export function discardHand(deck: Deck): void {
  for (const card of deck.hand) {
    if (card.ethereal) {
      deck.exhaustPile.push(card);
    } else {
      deck.discardPile.push(card);
    }
  }
  deck.hand = [];
}

// 添加牌到卡组
export function addCardToDeck(deck: Deck, card: Card): void {
  deck.masterDeck.push(card);
}

// 从卡组移除牌
export function removeCardFromDeck(deck: Deck, cardIndex: number): boolean {
  if (cardIndex < 0 || cardIndex >= deck.masterDeck.length) return false;
  deck.masterDeck.splice(cardIndex, 1);
  return true;
}

// 导入卡牌创建函数
import { createStrike, createDefend, createBash } from './Card';

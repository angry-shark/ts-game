// 卡牌组件导出

export type { Card, CardType, CardRarity, CardTarget, CardEffect } from './Card';
export { 
  createStrike, 
  createDefend, 
  createBash, 
  createWound,
  upgradeCard 
} from './Card';

export type { Deck } from './Deck';
export { 
  createDeck, 
  createStarterDeck, 
  shuffleDeck, 
  initCombatDeck,
  drawCards,
  playCard,
  discardHand,
  addCardToDeck,
  removeCardFromDeck
} from './Deck';

export type { CardCombatState, Buff, Debuff } from './CardCombat';
export { 
  createCardCombatState,
  addBuff,
  addDebuff,
  getStrength,
  getDexterity,
  endTurnEffects,
  calculateIncomingDamage,
  calculateOutgoingDamage,
  calculateBlock
} from './CardCombat';

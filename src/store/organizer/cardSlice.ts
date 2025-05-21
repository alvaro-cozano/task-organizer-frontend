import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { CardDTO } from '../../management';

interface CardState {
  cards: CardDTO[];
  cardsByStatus: { [statusId: number]: CardDTO[] };
  activeCard: CardDTO | null;
  isLoadingCards: boolean;
}

const initialState: CardState = {
  cards: [],
  cardsByStatus: {},
  activeCard: null,
  isLoadingCards: false,
};

const updateSingleCard = (state: CardState, updatedCard: CardDTO) => {
  const index = state.cards.findIndex(card => card.id === updatedCard.id);
  if (index !== -1) {
    state.cards[index] = updatedCard;
  } else {
    state.cards.push(updatedCard);
  }

  const statusCards = state.cardsByStatus[updatedCard.status_id];
  if (statusCards) {
    const statusIndex = statusCards.findIndex(card => card.id === updatedCard.id);
    if (statusIndex !== -1) {
      statusCards[statusIndex] = updatedCard;
    }
  }
};

const cardSlice = createSlice({
  name: 'card',
  initialState,
  reducers: {
    onAddNewCard: (state, action: PayloadAction<CardDTO>) => {
      state.cards.push(action.payload);
    },
    onDeleteCard: (state, action: PayloadAction<number>) => {
      const cardId = action.payload;
      state.cards = state.cards.filter((card) => card.id !== cardId);
      Object.keys(state.cardsByStatus).forEach(statusId => {
        state.cardsByStatus[Number(statusId)] = state.cardsByStatus[Number(statusId)].filter(card => card.id !== cardId);
      });
    },
    onLoadCards: (state, action: PayloadAction<CardDTO[]>) => {
      state.isLoadingCards = false;
      state.cards = action.payload;
    },
    onStartLoadingCards: (state) => {
      state.isLoadingCards = true;
    },
    onLoadCardsByStatus: (state, action: PayloadAction<{ cards: CardDTO[], statusId: number }>) => {
      const { cards, statusId } = action.payload;
      state.cardsByStatus = {
        ...state.cardsByStatus,
        [statusId]: cards,
      };
      state.cardsByStatus[action.payload.statusId] = action.payload.cards;
    },    
    onSetActiveCard: (state, action: PayloadAction<CardDTO | null>) => {
      state.activeCard = action.payload;
    },
    onUpdateCard: (state, action: PayloadAction<CardDTO>) => {
      updateSingleCard(state, action.payload);
    },
    onUpdateMultipleCards: (state, action: PayloadAction<CardDTO[]>) => {
      action.payload.forEach(card => updateSingleCard(state, card));
    },
    onClearCards: (state) => {
      state.cards = [];
      state.cardsByStatus = {};
      state.activeCard = null;
      state.isLoadingCards = false;
    },
  },
});

export const {
  onAddNewCard,
  onDeleteCard,
  onLoadCards,
  onStartLoadingCards,
  onLoadCardsByStatus,
  onSetActiveCard,
  onUpdateCard,
  onUpdateMultipleCards,
  onClearCards,
} = cardSlice.actions;

export default cardSlice;

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

const cardSlice = createSlice({
  name: 'card',
  initialState,
  reducers: {
    onAddNewCard: (state, action: PayloadAction<CardDTO>) => {
      state.cards.push(action.payload);
    },
    onDeleteCard: (state, action: PayloadAction<number>) => {
      state.cards = state.cards.filter((card) => card.id !== action.payload);
    },
    onLoadCards: (state, action: PayloadAction<CardDTO[]>) => {
      state.cards = action.payload;
    },
    onLoadCardsByStatus: (state, action: PayloadAction<{ cards: CardDTO[], statusId: number }>) => {
      const { cards, statusId } = action.payload;
      state.cardsByStatus = {
        ...state.cardsByStatus,
        [statusId]: cards,
      };
    },    
    onSetActiveCard: (state, action: PayloadAction<CardDTO | null>) => {
      state.activeCard = action.payload;
    },
    onUpdateCard: (state, action: PayloadAction<CardDTO>) => {
      const index = state.cards.findIndex((card) => card.id === action.payload.id);
      if (index >= 0) {
        state.cards[index] = action.payload;
      }
    },
  },
});

export const {
  onAddNewCard,
  onDeleteCard,
  onLoadCards,
  onLoadCardsByStatus,
  onSetActiveCard,
  onUpdateCard,
} = cardSlice.actions;

export default cardSlice;

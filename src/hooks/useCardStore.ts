import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

import { springApi } from '../api';
import { CardDTO } from '../management';
import {
  onAddNewCard,
  onDeleteCard,
  onSetActiveCard,
  onUpdateCard,
  onLoadCardsByStatus,
  onUpdateMultipleCards,
  onClearCards,
  onLoadCards, 
  RootState
} from '../store';

export const useCardStore = () => {
  const dispatch = useDispatch();
  const { cards, activeCard, isLoadingCards, cardsByStatus } = useSelector(
    (state: RootState) => state.card
  );

  const formatCardDates = (card: CardDTO) => ({
    ...card,
    startDate: format(card.startDate, 'yyyy-MM-dd HH:mm:ss'),
    endDate: format(card.endDate, 'yyyy-MM-dd HH:mm:ss'),
  });

  const parseCardDates = (card: any): CardDTO => ({
    ...card,
    startDate: new Date(card.startDate),
    endDate: new Date(card.endDate),
  });

  const setActiveCard = (card: CardDTO | null) => {
    dispatch(onSetActiveCard(card));
  };

  const startSavingCard = async (card: CardDTO) => {
    try {
      const cardToSend = formatCardDates(card);
      const response = card.id
        ? await springApi.put(`/cards/${card.id}`, cardToSend)
        : await springApi.post('/cards', cardToSend);
      const parsedCard = parseCardDates(response.data);
      dispatch(card.id ? onUpdateCard(parsedCard) : onAddNewCard(parsedCard));
      return parsedCard;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Ya existe una tarjeta con el mismo título en este tablero';
      Swal.fire({ icon: 'error', title: 'Error', text: errorMessage });
      throw error;
    }
  };

  const startSavingMultipleCards = async (cards: CardDTO[]) => {
    try {
      const formattedCards = cards.map(formatCardDates);
      const responses = await Promise.all(
        formattedCards.map(card =>
          card.id
            ? springApi.put(`/cards/${card.id}`, card)
            : springApi.post('/cards', card)
        )
      );
      const updatedCards = responses.map(r => parseCardDates(r.data));
      dispatch(onUpdateMultipleCards(updatedCards));
      return updatedCards;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error al actualizar múltiples tarjetas';
      Swal.fire({ icon: 'error', title: 'Error', text: errorMessage });
      throw error;
    }
  };

  const startDeletingCard = async (cardId: number, board_id: number, status_id: number) => {
    try {
      await springApi.delete(`/cards/${cardId}`);
      dispatch(onDeleteCard(cardId));
      await startLoadingCardsByBoardAndStatus(board_id, status_id);
    } catch (error: any) {
      Swal.fire('Error al eliminar', error.response?.data?.msg || 'Error desconocido', 'error');
    }
  };

  const startLoadingMyCards = async () => {
    try {
      const { data } = await springApi.get('/cards/my-cards');
      const parsedCards = data.map(parseCardDates);
      dispatch(onLoadCards(parsedCards));
    } catch (error) {
    }
  };

  const startLoadingCardsByBoardAndStatus = async (boardId: number, statusId: number) => {
    try {
      const { data } = await springApi.get(`/cards/boards/${boardId}/cards/status-id/${statusId}`);
      const cardsWithDates = data.map(parseCardDates);
      dispatch(onLoadCardsByStatus({ cards: cardsWithDates, statusId }));
    } catch (error: any) {
    }
  };

  const clearCards = () => {
    dispatch(onClearCards());
  };

  return {
    cards,
    activeCard,
    isLoadingCards,
    cardsByStatus,
    hasCardSelected: !!activeCard,
    setActiveCard,
    startSavingCard,
    startSavingMultipleCards,
    startDeletingCard,
    startLoadingMyCards,
    startLoadingCardsByBoardAndStatus,
    clearCards,
  };
};
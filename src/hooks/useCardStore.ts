import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

import { springApi } from '../api';
import { CardDTO } from '../management';
import { onLoadCards, RootState } from '../store';
import {
  onAddNewCard,
  onDeleteCard,
  onSetActiveCard,
  onUpdateCard,
  onLoadCardsByStatus,
} from '../store';

export const useCardStore = () => {
  const dispatch = useDispatch();
  const { cards, activeCard, isLoadingCards, cardsByStatus } = useSelector(
    (state: RootState) => state.card
  );

  const setActiveCard = (card: CardDTO | null) => {
    dispatch(onSetActiveCard(card));
  };

  const startSavingCard = async (card: CardDTO) => {
    try {
      const cardToSend = {
        ...card,
        startDate: format(card.startDate, 'yyyy-MM-dd HH:mm:ss'),
        endDate: format(card.endDate, 'yyyy-MM-dd HH:mm:ss'),
      };

      let response;
  
      if (card.id) {
        response = await springApi.put(`/cards/${card.id}`, cardToSend);
        dispatch(onUpdateCard(response.data));
      } else {
        response = await springApi.post('/cards', cardToSend);
        dispatch(onAddNewCard(response.data));
      }
  
      await startLoadingCardsByBoardAndStatus(card.board_id, card.prev_status_id || 0);
      await startLoadingCardsByBoardAndStatus(card.board_id, card.status_id);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Ya existe una tarjeta con el mismo titulo en este tablero';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
        });
    }
  };
  
  const startDeletingCard = async (cardId: number, board_id: number, status_id: number) => {
    try {
      await springApi.delete(`/cards/${cardId}`);
      dispatch(onDeleteCard(cardId));
  
      await startLoadingCardsByBoardAndStatus(board_id, status_id);
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error al eliminar', error.response?.data?.msg || 'Error desconocido', 'error');
    }
  };

   const startLoadingMyCards = async () => {
    try {
      const { data } = await springApi.get('/cards/my-cards');
      dispatch(onLoadCards(data));
    } catch (error) {
      console.error('Error al cargar tus tarjetas', error);
    }
  };

  const startLoadingCardsByBoardAndStatus = async (boardId: number, statusId: number) => {
    try {
      const { data } = await springApi.get(`/cards/boards/${boardId}/cards/status-id/${statusId}`);

      const cardsWithDates = data.map((card: any) => ({
        ...card,
        startDate: new Date(card.startDate),
        endDate: new Date(card.endDate),
      }));

      dispatch(onLoadCardsByStatus({ cards: cardsWithDates, statusId }));
    } catch (error: any) {
      console.error(error);
    }
  };
  

  return {
    cards,
    activeCard,
    isLoadingCards,
    cardsByStatus,
    hasCardSelected: !!activeCard,
    setActiveCard,
    startSavingCard,
    startDeletingCard,
    startLoadingMyCards,
    startLoadingCardsByBoardAndStatus,
  };
};

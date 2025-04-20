import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import { springApi } from '../api';
import { CardDTO } from '../management';
import { RootState } from '../store';
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
      let response;
  
      if (card.id) {
        response = await springApi.put(`/cards/${card.id}`, card);
        dispatch(onUpdateCard(response.data));
      } else {
        response = await springApi.post('/cards', card);
        dispatch(onAddNewCard(response.data));
      }
  
      // Recarga solo las tarjetas del estado y tablero actual
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

  const startLoadingCardsByBoardAndStatus = async (boardId: number, statusId: number) => {
    try {
      const { data } = await springApi.get(`/cards/boards/${boardId}/cards/status-id/${statusId}`);
      dispatch(onLoadCardsByStatus({ cards: data, statusId })); // <- siempre despachá
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
    startLoadingCardsByBoardAndStatus,
  };
};

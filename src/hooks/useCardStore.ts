import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { CardDTO } from '../management/organizer/types/CardDTO';
import {
  onAddNewCard,
  onDeleteCard,
  onLoadCards,
  onSetActiveCard,
  onUpdateCard,
  onLoadCardsByStatus, // Acción para cargar por status
} from '../store/organizer/cardSlice';
import { springApi } from '../api';
import Swal from 'sweetalert2';

export const useCardStore = () => {
  const dispatch = useDispatch();
  const { cards, activeCard, isLoadingCards, cardsByStatus } = useSelector(
    (state: RootState) => state.card
  );

  // Establecer la tarjeta activa
  const setActiveCard = (card: CardDTO | null) => {
    dispatch(onSetActiveCard(card));
  };

  // Guardar tarjeta (crear o actualizar)
  const startSavingCard = async (card: CardDTO) => {
    try {
      let response;
  
      if (card.id) {
        // Actualización (PUT)
        response = await springApi.put(`/cards/${card.id}`, card);
        dispatch(onUpdateCard(response.data));
      } else {
        // Creación (POST)
        console.log('Creando tarjeta:', card.board_id);
        console.log(card);
        response = await springApi.post('/cards', card);
        dispatch(onAddNewCard(response.data));
      }
  
      // Recarga solo las tarjetas del estado y tablero actual
      await startLoadingCardsByBoardAndStatus(card.board_id, card.prev_status_id || 0);
      await startLoadingCardsByBoardAndStatus(card.board_id, card.status_id);
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error al guardar', error.response?.data?.msg || 'Error desconocido', 'error');
    }
  };
  


  // Eliminar tarjeta
  const startDeletingCard = async (cardId: number, board_id: number, status_id: number) => {
    try {
      await springApi.delete(`/cards/${cardId}`);
      dispatch(onDeleteCard(cardId));
  
      // Recarga solo las tarjetas del estado y tablero actual
      await startLoadingCardsByBoardAndStatus(board_id, status_id);
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error al eliminar', error.response?.data?.msg || 'Error desconocido', 'error');
    }
  };
  

  
  // Cargar mis tarjetas
  const startLoadingMyCards = async () => {
    try {
      const { data } = await springApi.get('/cards/my-cards');
      dispatch(onLoadCards(data));
    } catch (error) {
      console.error('Error al cargar tus tarjetas', error);
    }
  };

  // Cargar tarjetas por Board y Status
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
    hasCardSelected: !!activeCard, // Accede a las tarjetas agrupadas por status
    setActiveCard,
    startSavingCard,
    startDeletingCard,
    startLoadingMyCards,
    startLoadingCardsByBoardAndStatus,
  };
};

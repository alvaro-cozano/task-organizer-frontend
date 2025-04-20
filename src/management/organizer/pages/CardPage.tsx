import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCardStore } from '../../../hooks/useCardStore';
import { useStatusStore } from '../../../hooks/useStatusStore';
import { StatusDTO } from '../types/StatusDTO';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Navbar } from '../../components/Navbar';
import CardModal from '../components/card/CardModal'; // Componente de modal de tarjeta
import StatusModal from '../components/status/StatusModal'; // Componente de modal de estado
import { CardDTO } from '../types/CardDTO';
import StatusColumn from '../components/status/StatusColumn';

const CardPage = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { loadStatuses, statuses } = useStatusStore();
  const { startLoadingCardsByBoardAndStatus } = useCardStore();
  const { cardsByStatus } = useSelector((state: RootState) => state.card);
  const navigate = useNavigate();

  const boardIdNumber = boardId ? Number(boardId) : 0;

  const [isCardModalOpen, setIsCardModalOpen] = useState(false); // Estado para abrir/cerrar modal de tarjeta
  const [selectedCard, setSelectedCard] = useState<CardDTO | null>(null); // Estado para la tarjeta seleccionada
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false); // Estado para abrir/cerrar modal de estado
  const [statusToEdit, setStatusToEdit] = useState<StatusDTO | null>(null); // Estado para editar un estado

  useEffect(() => {
    if (boardId) {
      loadStatuses(boardIdNumber);
    }
  }, [boardId]);

  useEffect(() => {
    if (statuses.length > 0 && boardId) {
      statuses.forEach((status: StatusDTO) => {
        if (status.id) {
          startLoadingCardsByBoardAndStatus(boardIdNumber, status.id);
        }
      });
    }
  }, [statuses, boardId]);

  const handleCreateCard = () => {
    setSelectedCard(null); // No hay tarjeta seleccionada para crear
    setIsCardModalOpen(true); // Abre el modal de tarjeta
  };

  const handleEditCard = (card: CardDTO) => {
    setSelectedCard(card); // Establece la tarjeta seleccionada
    setIsCardModalOpen(true); // Abre el modal de tarjeta
  };

  const handleOpenStatusModal = () => {
    setIsStatusModalOpen(true); // Abre el modal para gestionar estados
  };

  // Función para editar un estado
  const handleEditStatus = (status: StatusDTO) => {
    setStatusToEdit(status); // Establece el estado seleccionado para editar
    setIsStatusModalOpen(true); // Abre el modal de edición de estado
  };

  return (
    <>
      <Navbar />
      <div className="container my-4">
        <div className="mb-3">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/boards`)} // Navegar a la página de tableros
          >
            Volver a los Tableros
          </button>
          {/* Botón único para abrir el modal de edición de estados */}
          <button
            className="btn btn-info ms-3"
            onClick={handleOpenStatusModal} // Abre el modal para gestionar estados
          >
            Gestionar Estados
          </button>
          {statuses.length > 0 && (
            <button
              className="btn btn-primary ms-3"
              onClick={handleCreateCard} // Abre el modal para crear una nueva tarjeta
            >
              Crear Tarea
            </button>
          )}
        </div>
        
        <div className="row">
          {statuses.length > 0 ? (
            statuses.map((status: StatusDTO) => {
              const cards = cardsByStatus[status.id ?? -1] || [];
              return (
                <div key={status.id} className="col-md-4 mb-4">
                  <StatusColumn
                    status={status}  // Pasa la propiedad 'status' aquí
                    statusName={status.name}
                    cards={cards}
                    onCardClick={handleEditCard}
                    onEditStatus={() => handleEditStatus(status)} // Pasa la función para editar el estado
                  />
                </div>
              );
            })
          ) : (
            <p>No se han cargado los estados.</p>
          )}
        </div>
      </div>

      {/* Modal para crear o editar tarjeta */}
      <CardModal
        isOpen={isCardModalOpen}
        closeModal={() => setIsCardModalOpen(false)}
        card={selectedCard}
        statuses={statuses} // 👈 pasa los estados aquí
      />

      {/* Modal para gestionar estados */}
      <StatusModal
        isOpen={isStatusModalOpen}
        closeModal={() => setIsStatusModalOpen(false)}
        boardId={boardIdNumber} // Pasa el boardId como prop
        statuses={statuses} // Pasa la lista de estados aquí
        statusToEdit={statusToEdit} // Pasa el estado que se va a editar
      />
    </>
  );
};

export default CardPage;

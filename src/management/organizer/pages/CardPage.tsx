import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { useCardStore, useStatusStore } from '../../../hooks';
import { Navbar, CardDTO, StatusDTO, CardModal, StatusModal, StatusColumn } from '../../../management';
import { RootState } from '../../../store';

export const CardPage = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { loadStatuses, statuses } = useStatusStore();
  const { startLoadingCardsByBoardAndStatus } = useCardStore();
  const { cardsByStatus } = useSelector((state: RootState) => state.card);
  const navigate = useNavigate();

  const boardIdNumber = boardId ? Number(boardId) : 0;

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardDTO | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusToEdit] = useState<StatusDTO | null>(null);

  useEffect(() => {
    if (boardId) loadStatuses(boardIdNumber);
  }, [boardId]);

  useEffect(() => {
    if (statuses.length > 0 && boardId) {
      statuses.forEach((status: StatusDTO) => {
        if (status.id) startLoadingCardsByBoardAndStatus(boardIdNumber, status.id);
      });
    }
  }, [statuses, boardId]);

  const handleCreateCard = useCallback(() => {
    setSelectedCard(null);
    setIsCardModalOpen(true);
  }, []);

  const handleEditCard = useCallback((card: CardDTO) => {
    setSelectedCard(card);
    setIsCardModalOpen(true);
  }, []);

  const handleOpenStatusModal = useCallback(() => {
    setIsStatusModalOpen(true);
  }, []);

  return (
    <>
      <Navbar />
      <div className="container my-4">
        <div className="mb-3">
          <button className="btn btn-secondary" onClick={() => navigate(`/boards`)}>Volver a los Tableros</button>
          <button className="btn btn-info ms-3" onClick={handleOpenStatusModal}>Gestionar Estados</button>
          {statuses.length > 0 && (
            <button className="btn btn-primary ms-3" onClick={handleCreateCard}>Crear Tarea</button>
          )}
        </div>
        
        <div className="row">
          {statuses.length > 0 ? (
            statuses.map((status: StatusDTO) => {
              const cards = cardsByStatus[status.id ?? -1] || [];
              return (
                <div key={status.id} className="col-md-4 mb-4">
                  <StatusColumn
                    status={status}
                    cards={cards}
                    onCardClick={handleEditCard}
                  />
                </div>
              );
            })
          ) : (
            <p>No se han cargado los estados.</p>
          )}
        </div>
      </div>

      <CardModal
        isOpen={isCardModalOpen}
        closeModal={() => setIsCardModalOpen(false)}
        card={selectedCard}
        statuses={statuses}
      />

      <StatusModal
        isOpen={isStatusModalOpen}
        closeModal={() => setIsStatusModalOpen(false)}
        boardId={boardIdNumber}
        statuses={statuses}
        statusToEdit={statusToEdit}
      />
    </>
  );
};

export default CardPage;

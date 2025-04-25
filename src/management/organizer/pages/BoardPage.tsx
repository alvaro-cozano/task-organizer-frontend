import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Navbar, BoardModal, BoardCard, BoardDTO } from '../../../management';
import { useBoardStore, useAuthStore } from '../../../hooks';

export const BoardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { boards, activeBoard, setActiveBoard, startLoadingBoards } = useBoardStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const currentUserEmail = user?.email || '';

  const openModal = () => {
    setActiveBoard(null);
    setIsModalOpen(true);
  };

  const closeModal = async () => {
    setIsModalOpen(false);
    setActiveBoard(null);
    await startLoadingBoards();
  };

  const handleBoardClick = (board: BoardDTO) => {
    navigate(`/cards/${board.id}`);
  };

  useEffect(() => {
    startLoadingBoards();
  }, []);

  return (
    <>
      <Navbar />

      <div className="container pt-5 mt-4">

        <h1>Mis Tableros</h1>

        <div className="mb-3">
          <button className="btn btn-primary" onClick={openModal}>
            Gestionar Tableros
          </button>
        </div>

        <div className="row board-list">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onClick={() => handleBoardClick(board)}
            />
          ))}
        </div>

        {isModalOpen && (
          <BoardModal
            isOpen={isModalOpen}
            onClose={closeModal}
            boardToEdit={activeBoard}
            boards={boards}
            currentUserEmail={currentUserEmail}
          />
        )}
      </div>
    </>
  );
};

export default BoardPage;

// src/management/organizer/pages/BoardPage.tsx

import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { useBoardStore } from '../../../hooks/useBoardStore';
import { useNavigate } from 'react-router-dom';
import BoardModal from '../components/board/BoardModal';

export const BoardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { boards, activeBoard, setActiveBoard, startLoadingBoards } = useBoardStore();
  const navigate = useNavigate();

  const openModal = () => {
    setActiveBoard(null);
    setIsModalOpen(true);
  };

  const closeModal = async () => {
    setIsModalOpen(false);
    setActiveBoard(null);
    await startLoadingBoards(); // Carga los tableros nuevamente al cerrar
  };

  const handleBoardClick = (board: any) => {
    navigate(`/cards/${board.id}`);
  };

  useEffect(() => {
    startLoadingBoards();
  }, []);

  return (
    <>
      <Navbar />

      <div className="container mt-4">
        <h1>Mis Tableros</h1>

        <div className="mb-3">
          <button className="btn btn-primary" onClick={openModal}>
            Gestionar Tableros
          </button>
        </div>

        <div className="row board-list">
          {boards.map((board) => (
            <div
              key={board.id}
              className="col-md-4 mb-3"
              onClick={() => handleBoardClick(board)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{board.boardName}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <BoardModal
            isOpen={isModalOpen}
            onClose={closeModal}
            boardToEdit={activeBoard}
            boards={boards}
          />
        )}
      </div>
    </>
  );
};

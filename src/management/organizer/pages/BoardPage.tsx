import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GridStack } from 'gridstack';

import { Navbar, BoardModal, BoardCard, BoardDTO } from '../../../management';
import { useBoardStore, useAuthStore } from '../../../hooks';

import '../style/BoardPage.css';

export const BoardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const { boards, activeBoard, setActiveBoard, startLoadingBoards } = useBoardStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const currentUserEmail = user?.email || '';

  const calculateColumns = () => {
    const width = window.innerWidth;
    if (width >= 1200) {
      return 4;
    } else if (width >= 992) {
      return 3;
    } else if (width >= 768) {
      return 2;
    } else {
      return 1;
    }
  };

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

  useEffect(() => {
    if (gridRef.current) {
      const grid = GridStack.init(
        {
          float: false,
          animate: true,
          cellHeight: 120,
          margin: 10,
          disableResize: true,
          disableDrag: false,
          column: 12,
          minRow: 1,
          acceptWidgets: false,
          resizable: { handles: '' },
          draggable: {
            handle: '.grid-stack-item-content',
            scroll: false,
          },
          placeholderText: '',
        },
        gridRef.current
      );
  
      const handleResize = () => {
        const newColumns = calculateColumns();
        grid.batchUpdate();
        grid.column(newColumns);
        grid.compact();
        grid.batchUpdate(false);
      };
  
      window.addEventListener('resize', handleResize);
      handleResize();
  
      grid.on('dragstart', () => {
        grid.compact();
      });
  
      grid.on('drag', () => {
        grid.compact();
      });
  
      grid.on('change', () => {
        grid.compact();
      });
  
      return () => {
        grid.destroy(false);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [boards]);
  

  

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

        <div className="grid-stack" ref={gridRef}>
          {boards.map((board) => (
            <div className="grid-stack-item" key={board.id} gs-w="1" gs-h="1">
              <div className="grid-stack-item-content board-card-content" onClick={() => handleBoardClick(board)}>
                <BoardCard board={board} onClick={() => {}} />
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
            currentUserEmail={currentUserEmail}
          />
        )}
      </div>
    </>
  );
};

export default BoardPage;

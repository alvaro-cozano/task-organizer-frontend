import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GridStack } from 'gridstack';

import { Navbar, BoardModal, BoardCard, BoardDTO, UserBoardDTO } from '../../../management';
import { useBoardStore, useAuthStore, useUserBoardStore } from '../../../hooks';

import '../style/BoardPage.css';

export const BoardPage = () => {
  const navigate = useNavigate();
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthStore();
  const { boards, activeBoard, setActiveBoard, startLoadingBoards } = useBoardStore();
  const { startUpdatingUserBoardPosition } = useUserBoardStore();

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

      grid.on('dragstop', () => {
        const items = grid.getGridItems();
      
        items.forEach((element) => {
          const node = element.gridstackNode;
          const boardId = parseInt(element.getAttribute('data-id') || '0', 10);
      
          if (boardId && node) {
            const userBoardData: UserBoardDTO = {
              user_id: user?.id || 0,
              board_id: boardId,
              posX: node.x || 0,
              posY: node.y || 0,
            };
      
            startUpdatingUserBoardPosition(userBoardData);
          }
        });
      });
      
      
      return () => {
        grid.destroy(false);
      };
    }
  }, [boards, activeBoard]);
  
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
            <div
              className="grid-stack-item"
              key={board.id}
              gs-w="1"
              gs-h="1"
              data-id={board.id}
            >
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
import { useState, useEffect, useRef } from 'react';

import { useNavigate } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { GridStack } from 'gridstack';
import Swal from 'sweetalert2';

import { Navbar, BoardModal, BoardCard, BoardDTO, UserBoardDTO } from '../../../management';
import { useBoardStore, useAuthStore, useUserBoardStore } from '../../../hooks';

import LogoTaskor from '../../icons/LogoTaskor.png';
import '../style/BoardPage.css';

export const BoardPage = () => {
  const navigate = useNavigate();
  const gridRef = useRef<HTMLDivElement | null>(null);
  const gridInstance = useRef<GridStack | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { boards, activeBoard, setActiveBoard, startLoadingBoards, startDeletingBoard, startLeavingBoard, isLoadingBoards } = useBoardStore();
  const { startUpdatingUserBoardPosition } = useUserBoardStore();
  const currentUserEmail = user?.email || '';

  const calculateColumns = () => (window.innerWidth >= 992 ? 4 : 2);
  const [columns, setColumns] = useState(calculateColumns());
  const [forceRender, setForceRender] = useState(0);

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
    if (!isModalOpen && !isDraggingRef.current) {
      navigate(`/cards/${board.id}`);
    }
  };

  const handleEditBoard = (board: BoardDTO) => {
    setActiveBoard(board);
    setIsModalOpen(true);
  };

  const handleDeleteBoard = async (boardId: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Este tablero será eliminado permanentemente.',
      iconHtml: '<i class="fas fa-trash-alt" style="color: red; font-size: 40px;"></i>',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
    });

    if (result.isConfirmed) {
      await startDeletingBoard(boardId);
      await startLoadingBoards();
    }
  };

  const handleMenuToggle = (boardId: string) => {
    setOpenMenuId((prev) => (prev === boardId ? null : boardId));
  };

  useEffect(() => {
    const loadData = async () => {
      if (!boards || boards.length === 0) {
        await startLoadingBoards();
        setForceRender(prev => prev + 1);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newColumns = calculateColumns();
      if (newColumns !== columns) {
        setColumns(newColumns);
        setForceRender(prev => prev + 1);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [columns]);

  useEffect(() => {
    if (isLoadingBoards) {
      startLoadingBoards();
    }
  }, [isLoadingBoards, startLoadingBoards]);

  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (gridRef.current) {
      if (gridInstance.current) {
        gridInstance.current.destroy(false);
        gridInstance.current = null;
      }

      const grid = GridStack.init({
        float: false,
        animate: true,
        cellHeight: 120,
        margin: 10,
        disableResize: true,
        disableDrag: false,
        column: columns,
        minRow: 1,
        acceptWidgets: false,
        resizable: { handles: '' },
        draggable: { handle: '.grid-stack-item-content', scroll: false },
      }, gridRef.current);

      gridInstance.current = grid;

      grid.on('dragstart', () => {
        isDraggingRef.current = true;
        grid.compact();
      });

      grid.on('drag', () => grid.compact());

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
              isAdmin: false,
            };
            startUpdatingUserBoardPosition(userBoardData);
          }
        });
        setTimeout(() => (isDraggingRef.current = false), 100);
      });

      return () => {
        if (gridInstance.current) {
          gridInstance.current.destroy(false);
          gridInstance.current = null;
        }
      };
    }
  }, [columns, forceRender]);

  useEffect(() => {
    if (gridInstance.current && gridRef.current) {
      const grid = gridInstance.current;
      grid.batchUpdate();
      grid.column(columns);
      grid.removeAll(false);
      const items = gridRef.current.querySelectorAll('.grid-stack-item');
      items.forEach((item) => grid.makeWidget(item as HTMLElement));
      grid.compact();
      grid.batchUpdate(false);
    }
  }, [columns, boards, forceRender]);

  const handleCardClick = (e: React.MouseEvent, board: BoardDTO) => {
    const target = e.target as HTMLElement;
    if (!isDraggingRef.current && !isModalOpen && target.closest('.grid-stack-item-content')) {
      handleBoardClick(board);
    }
  };

  return (
    <>
      <Navbar />
      <div className="board-page position-relative">
        <img
          src={LogoTaskor}
          alt=""
          className="centered-logo-bg"
          draggable={false}
        />
        {isModalOpen && <div className="modal-overlay" />}
        <div className="container pt-5 mt-4 board-container">
          <div className="board-header d-flex justify-content-between align-items-center mb-3">
            <h1 className="custom-title">Mis Tableros</h1>
            <button className="btnManage" onClick={openModal} disabled={isModalOpen}>
              Crear Tablero
            </button>
          </div>

          <div className="board-scroll-area">
            {isLoadingBoards ? (
              <div className="d-flex justify-content-center align-items-center boardpage-loading-center">
                <AccessTimeIcon sx={{ fontSize: 80, color: '#bdbdbd' }} />
              </div>
            ) : (
              <div key={`grid-${forceRender}`} className="grid-stack" ref={gridRef}>
                {[...boards]
                  .sort((a, b) => {
                    const aX = a.userBoardReference?.posX ?? 0;
                    const aY = a.userBoardReference?.posY ?? 0;
                    const bX = b.userBoardReference?.posX ?? 0;
                    const bY = b.userBoardReference?.posY ?? 0;
                    return aY - bY || aX - bX;
                  })
                  .map((board) => {
                    const posX = board.userBoardReference?.posX ?? 0;
                    const posY = board.userBoardReference?.posY ?? 0;
                    const itemWidth = columns <= 1 ? 1 : 2;

                    const isAdmin = board.userBoardReference?.isAdmin || false;

                    return (
                      <div
                        className="grid-stack-item"
                        key={board.id}
                        gs-w={itemWidth}
                        gs-h="2"
                        data-id={board.id}
                        gs-x={posX}
                        gs-y={posY}
                      >
                        <div
                          className={`grid-stack-item-content board-card${isModalOpen ? ' boardpage-card-disabled' : ''}`}
                          onClick={(e) => handleCardClick(e, board)}
                        >
                          <BoardCard
                            board={board}
                            onClick={() => handleBoardClick(board)}
                            onEdit={() => handleEditBoard(board)}
                            onDelete={() => handleDeleteBoard(board.id)}
                            onLeave={startLeavingBoard}
                            isMenuOpen={openMenuId === board.id.toString()}
                            onMenuToggle={handleMenuToggle}
                            boardId={board.id.toString()}
                            isAdmin={isAdmin}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
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
      </div>
    </>
  );
};

export default BoardPage;

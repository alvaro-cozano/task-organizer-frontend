import React, { useState, useEffect, useRef } from 'react';

import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import { BoardDTO, UserBoardModal } from '../../../../management';
import { useAuthStore } from '../../../../hooks';

import '../../style/BoardCard.css';

interface BoardCardProps {
  board: BoardDTO;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onLeave: (boardId: number) => void;
  isMenuOpen: boolean;
  onMenuToggle: (boardId: string) => void;
  boardId: string;
  isAdmin: boolean;
}

const BoardCard: React.FC<BoardCardProps> = ({
  board,
  onClick,
  onEdit,
  onDelete,
  isMenuOpen,
  onMenuToggle,
  boardId,
  onLeave,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const { user } = useAuthStore();
  const currentUserEmail = user?.email;

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const closeModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsModalOpen(false);
  };

  const isAdmin = board.userBoardReference?.isAdmin;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onMenuToggle('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onMenuToggle]);

  return (
    <>
      <div onClick={onClick} className="card h-100 boardcard-wrapper position-relative" ref={cardRef}>
        <div className="card-body d-flex flex-column justify-content-center align-items-center text-center boardcard-body">
          <h5 className="card-title boardcard-title">{board.boardName}</h5>

          <div
            className="position-absolute top-0 end-0 p-2 boardcard-users"
            onClick={(e) => {
              e.stopPropagation();
              openModal(e);
            }}
            title="Ver usuarios"
          >
            <PersonIcon className="boardcard-person-icon" />
            <span className="boardcard-user-count ms-1">{board.users?.length || 0}</span>
          </div>

          <div
            className="position-absolute top-0 start-0 p-2 boardcard-menu"
            onClick={(e) => {
              e.stopPropagation();
              onMenuToggle(boardId);
            }}
            title="Opciones"
          >
            <MoreVertIcon className="boardcard-menu-icon" />
            {isMenuOpen && (
              <div ref={menuRef} className="boardcard-menu-dropdown">
                {isAdmin ? (
                  <>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                      className="boardcard-menu-item boardcard-edit"
                    >
                      <div className="boardcard-menu-content">
                        <EditIcon className="boardcard-menu-item-icon" />
                        <span>Editar</span>
                      </div>
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="boardcard-menu-item boardcard-delete"
                    >
                      <div className="boardcard-menu-content">
                        <DeleteIcon className="boardcard-menu-item-icon" />
                        <span>Eliminar</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeave(board.id);
                    }}
                    className="boardcard-menu-item boardcard-exit"
                  >
                    <div className="boardcard-menu-content">
                      <ExitToAppIcon className="boardcard-menu-item-icon" />
                      <span>Salir</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {currentUserEmail && (
        <UserBoardModal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          users={board.users}
          boardName={board.boardName}
          boardId={board.id}
          isAdmin={board.userBoardReference?.isAdmin}
          currentUserEmail={currentUserEmail}
        />
      )}
    </>
  );
};

export default BoardCard;
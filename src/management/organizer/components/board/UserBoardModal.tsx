import React, { useState } from 'react';

import Modal from 'react-modal';
import { TransferWithinAStation } from '@mui/icons-material';
import Swal from 'sweetalert2';

import { useBoardStore } from '../../../../hooks';

import '../../style/BoardModal.css';

interface UserBoardModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  users: { email: string; profileImageBase64?: string }[];
  boardName: string;
  boardId: number;
  isAdmin: boolean;
  currentUserEmail: string;
}

export const UserBoardModal: React.FC<UserBoardModalProps> = ({
  isOpen,
  onRequestClose,
  users,
  boardName,
  boardId,
  isAdmin,
  currentUserEmail,
}) => {
  const { startTransferringAdmin } = useBoardStore();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleTransferAction = async (user: { email: string }) => {
    if (isLoading) return;
    setIsLoading(true);

    const result = await Swal.fire({
      title: `¿Estás seguro de transferir la propiedad a ${user.email}?`,
      text: `Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, transferir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await startTransferringAdmin(boardId, user.email);
      } catch (error) {
      }
    } else {
      Swal.fire('Cancelado', 'La transferencia no se realizó.', 'info');
    }

    setIsLoading(false);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Lista de usuarios"
      className="custom-user-board-modal"
      overlayClassName="custom-user-board-overlay"
      ariaHideApp={false}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <div
        className="custom-user-board-modal-content"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="custom-user-board-modal-close-btn"
          aria-label="Close"
          onClick={(e) => {
            e.stopPropagation();
            onRequestClose();
          }}
        >
          X
        </button>

        <h5 className="custom-user-board-modal-title">Usuarios de {boardName}</h5>

        <div className="user-board-search">
          <input
            type="text"
            className="user-board-search-input"
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <hr />

        {filteredUsers.length === 0 ? (
          <p>No hay usuarios encontrados.</p>
        ) : (
          <ul className="custom-user-board-modal-list">
            {filteredUsers.map((user, index) => (
              <li key={index} className="custom-user-board-modal-cell">
                <div className="custom-user-info-container">
                  <div className="user-info">
                    {user.profileImageBase64 && (
                      <img
                        src={
                          user.profileImageBase64.startsWith('data:image')
                            ? user.profileImageBase64
                            : `data:image/png;base64,${user.profileImageBase64}`
                        }
                        alt="profile"
                        className="custom-user-board-modal-profile-image"
                      />
                    )}
                    <span className="custom-user-board-modal-email">{user.email}</span>
                  </div>
                </div>

                {isAdmin && user.email !== currentUserEmail && (
                  <div className="custom-transfer-btn-container">
                    <button
                      type="button"
                      className="transfer-admin-btn"
                      aria-label="Transfer Admin"
                      onClick={() => handleTransferAction(user)}
                      disabled={isLoading}
                    >
                      <TransferWithinAStation />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default UserBoardModal;

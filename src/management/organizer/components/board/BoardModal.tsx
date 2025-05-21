import React, { useEffect, useState } from 'react';

import Swal from 'sweetalert2';
import { FaTrashAlt } from 'react-icons/fa';
import { PersonAdd } from '@mui/icons-material';

import { useBoardStore, useAuthStore } from '../../../../hooks';
import { BoardDTO, UserDTO } from '../../../../management';

import '../../style/BoardModal.css';

interface BoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardToEdit: BoardDTO | null;
  boards: BoardDTO[] | undefined;
  currentUserEmail: string;
}

const BoardModal: React.FC<BoardModalProps> = ({ isOpen, onClose, boardToEdit, currentUserEmail }) => {
  const { startSavingBoard } = useBoardStore();
  const { getAllEmails } = useAuthStore();

  const [boardName, setBoardName] = useState('');
  const [users, setUsers] = useState<{ email: string, profileImageBase64?: string }[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [filteredEmails, setFilteredEmails] = useState<UserDTO[]>([]);
  const [editingBoard, setEditingBoard] = useState<BoardDTO | null>(null);
  const [availableEmails, setAvailableEmails] = useState<UserDTO[]>([]);

  const fetchEmails = async () => {
    const emails = await getAllEmails();
    setAvailableEmails(emails.filter(user => user.email !== currentUserEmail));
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmails();
    }
  }, [isOpen]);

  useEffect(() => {
    if (boardToEdit) {
      setEditingBoard(boardToEdit);
      setBoardName(boardToEdit.boardName);
      setUsers(boardToEdit.users?.filter(user => user.email !== currentUserEmail) || []);
    } else {
      resetForm();
    }
  }, [boardToEdit, currentUserEmail]);

  useEffect(() => {
    if (searchEmail.length > 2) {
      const filtered = availableEmails.filter(
        (user) =>
          user.email.toLowerCase().includes(searchEmail.toLowerCase()) &&
          !users.some((u) => u.email === user.email)
      );
      setFilteredEmails(filtered);
    } else {
      setFilteredEmails([]);
    }
  }, [searchEmail, availableEmails, users]);

  const handleSave = async () => {
    try {
      await startSavingBoard({ id: editingBoard?.id || 0, boardName, users });
      resetModal();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.response?.data?.message || 'Ya existe un tablero con el mismo nombre',
      });
    }
  };

  const resetForm = () => {
    setEditingBoard(null);
    setBoardName('');
    setUsers([]);
    setSearchEmail('');
    setFilteredEmails([]);
  };

  const resetModal = () => {
    resetForm();
    onClose();
  };

  const handleAddSearchedEmail = (user: UserDTO) => {
    setUsers((prev) => [...prev, { email: user.email, profileImageBase64: user.profileImageBase64 }]);
    setSearchEmail('');
    setFilteredEmails([]);
  };

  const handleRemoveUser = (index: number) => {
    setUsers(users.filter((_, i) => i !== index));
  };

  const isSaveDisabled = () => {
    if (!boardName.trim()) return true;
    if (editingBoard) {
      return editingBoard.boardName === boardName && JSON.stringify(editingBoard.users) === JSON.stringify(users);
    }
    return false;
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block board-modal-overlay board-modal-overlay-bg" tabIndex={-1} aria-labelledby="boardModal">
      <div className="board-modal-centered">
        <div className="modal-header board-modal-header">
          <h5 className="modal-title board-modal-title" id="boardModal">
            {editingBoard ? 'Editar Tablero' : 'Crear Tablero'}
          </h5>
          <button type="button" className="board-modal-close" aria-label="Cerrar" onClick={resetModal}>X</button>
        </div>

        <div className="modal-body board-modal-body">
          <div className="mb-3 board-modal-form-group">
            <label className="form-label board-modal-label">Nombre del Tablero:</label>
            <input
              type="text"
              className="form-edit board-modal-input"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
            />
          </div>

          <div className="mb-3 board-modal-form-group">
            <label className="form-label board-modal-label">Añadir usuario:</label>

            <div className="mb-2 board-modal-search-group">
              <input
                type="text"
                className="form-edit board-modal-input"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </div>

            {filteredEmails.length > 0 && (
              <ul className="email-suggestion-list board-modal-suggestion-list list-unstyled p-0">
                {filteredEmails.map((user) => (
                  <li key={user.email} className="email-suggestion-item board-modal-suggestion-item d-flex align-items-center mb-2">
                    <div className="email-suggestion-container board-modal-email-suggestion-container">
                      {user.profileImageBase64 && (
                        <img
                          src={user.profileImageBase64.startsWith('data:image') ? user.profileImageBase64 : `data:image/png;base64,${user.profileImageBase64}`}
                          alt="Perfil"
                          className="rounded-circle me-2 board-modal-suggestion-profile-image"
                          style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                        />
                      )}
                      <span className="flex-grow-1">{user.email}</span>
                      <button
                        type="button"
                        className="email-suggestion-button board-modal-suggestion-button btn btn-sm btn-outline-primary ms-2"
                        onClick={() => handleAddSearchedEmail(user)}
                      >
                        <PersonAdd />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <label className="form-label board-modal-label">Usuarios añadidos:</label>
            {users.length === 0 ? (
              <p>No hay usuarios asignados al tablero.</p>
            ) : (
              <ul className="user-board-modal-list">
                {users.map((user, index) => (
                  <li key={index} className="user-board-modal-cell">
                    {user.profileImageBase64 && (
                      <img
                        src={user.profileImageBase64.startsWith('data:image') ? user.profileImageBase64 : `data:image/png;base64,${user.profileImageBase64}`}
                        alt="Perfil"
                        className="user-board-modal-profile-image"
                      />
                    )}
                    <span className="user-board-modal-email">{user.email}</span>
                    <button
                      type="button"
                      className="btn btn-danger board-modal-remove-btn"
                      onClick={() => handleRemoveUser(index)}
                    >
                      <FaTrashAlt />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="modal-footer board-modal-footer">
          <button
            type="button"
            className="btn btn-primary board-modal-save-btn"
            onClick={handleSave}
            disabled={isSaveDisabled()}
          >
            {editingBoard ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardModal;

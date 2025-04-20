import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import { useBoardStore, useAuthStore } from '../../../../hooks';
import { BoardDTO } from '../../../../management';

interface BoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardToEdit: BoardDTO | null;
  boards: BoardDTO[] | undefined;
  currentUserEmail: string;
}

const BoardModal: React.FC<BoardModalProps> = ({ isOpen, onClose, boardToEdit, boards = [], currentUserEmail }) => {
  const { startSavingBoard, startDeletingBoard } = useBoardStore();
  const { user } = useAuthStore();
  const currentUsername = user?.username || '';

  const [boardName, setBoardName] = useState('');
  const [users, setUsers] = useState<{ email: string }[]>([{ email: currentUserEmail }]);
  const [editingBoard, setEditingBoard] = useState<BoardDTO | null>(null);

  useEffect(() => {
    if (boardToEdit) {
      setEditingBoard(boardToEdit);
      setBoardName(boardToEdit.boardName);
      setUsers(boardToEdit.users || [{ email: currentUserEmail }]);
    } else {
      resetForm();
    }
  }, [boardToEdit, currentUserEmail]);

  const handleSave = async () => {
    try {
      await startSavingBoard({ id: editingBoard?.id || 0, boardName, users });
      if (!editingBoard) {
        resetModal();
      } else {
        resetForm();
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.response?.data?.message || 'Ya existe un tablero con el mismo nombre',
      });
    }
  };

  const handleDelete = async (boardId: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Este tablero será eliminado permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
    });

    if (result.isConfirmed) {
      await startDeletingBoard(boardId);
      if (editingBoard?.id === boardId) resetForm();
    }
  };

  const handleEditClick = (board: BoardDTO) => {
    if (editingBoard?.id === board.id) {
      resetForm();
    } else {
      setEditingBoard(board);
      setBoardName(board.boardName);
      setUsers(board.users || [{ email: currentUserEmail }]);
    }
  };

  const resetForm = () => {
    setEditingBoard(null);
    setBoardName('');
    setUsers([{ email: currentUserEmail }]);
  };

  const resetModal = () => {
    resetForm();
    onClose();
  };

  const handleEmailChange = (index: number, value: string) => {
    setUsers(users => users.map((user, i) => i === index ? { email: value } : user));
  };

  const handleAddUser = () => setUsers([...users, { email: '' }]);

  const handleRemoveUser = (index: number) => {
    if (users[index].email !== currentUserEmail) {
      setUsers(users.filter((_, i) => i !== index));
    }
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
    <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} aria-labelledby="boardModal">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="boardModal">
              {editingBoard ? 'Editar Tablero' : 'Nuevo Tablero'}
            </h5>
            <button type="button" className="btn-close" aria-label="Cerrar" onClick={resetModal}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Nombre del Tablero</label>
              <input
                type="text"
                className="form-control"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="Introduce el nombre del tablero"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Correos de los usuarios:</label>
              {users.map((user, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <input
                    type="email"
                    className="form-control"
                    value={user.email || ''}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    required
                    disabled={user.email === currentUserEmail}
                    placeholder={user.email === currentUserEmail ? currentUsername : "Introduce el correo del usuario"}
                  />
                  {user.email !== currentUserEmail && (
                    <button type="button" onClick={() => handleRemoveUser(index)}>-</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddUser}>Añadir Usuario</button>
            </div>

            <div>
              <h5>Tableros actuales:</h5>
              {boards.length > 0 ? (
                boards.map((board) => (
                  <div key={board.id} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{board.boardName}</span>
                      <div>
                        <button
                          className={`btn me-2 ${editingBoard?.id === board.id ? 'btn-info' : 'btn-warning'}`}
                          onClick={() => handleEditClick(board)}
                        >
                          {editingBoard?.id === board.id ? 'Editando' : 'Editar'}
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(board.id ?? 0)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay tableros disponibles.</p>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={resetModal}>Cerrar</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaveDisabled()}
            >
              {editingBoard ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardModal;

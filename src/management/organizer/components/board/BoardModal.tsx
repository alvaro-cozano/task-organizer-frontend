// BoardModal.tsx
import React, { useEffect, useState } from 'react';
import { useBoardStore } from '../../../../hooks/useBoardStore';
import Swal from 'sweetalert2';
import { BoardDTO } from '../../types/BoardDTO';

interface BoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardToEdit: BoardDTO | null;
  boards: BoardDTO[] | undefined;
  isEditMode?: boolean;
}

const BoardModal: React.FC<BoardModalProps> = ({ isOpen, onClose, boardToEdit, boards = [] }) => {
  const { startSavingBoard, startDeletingBoard } = useBoardStore();

  const [boardName, setBoardName] = useState('');
  const [users, setUsers] = useState<{ email: string }[]>([]);
  const [editingBoard, setEditingBoard] = useState<BoardDTO | null>(null);

  useEffect(() => {
    if (boardToEdit) {
      setEditingBoard(boardToEdit);
      setBoardName(boardToEdit.boardName);
      setUsers(boardToEdit.users || []);
    } else {
      resetForm();
    }
  }, [boardToEdit]);

  const handleSave = async () => {
    const board: BoardDTO = {
      id: editingBoard?.id || 0,
      boardName,
      users,
    };

    await startSavingBoard(board);
    resetModal();
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
      setUsers(board.users || []);
    }
  };

  const resetForm = () => {
    setEditingBoard(null);
    setBoardName('');
    setUsers([]);
  };

  const resetModal = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} aria-labelledby="boardModal">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="boardModal">{editingBoard ? 'Editar Tablero' : 'Nuevo Tablero'}</h5>
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
              <label className="form-label">Usuarios (por correo)</label>
              <input
                type="text"
                className="form-control"
                value={users.map(u => u.email).join(', ')}
                onChange={(e) =>
                  setUsers(e.target.value.split(',').map(email => ({ email: email.trim() })))
                }
                placeholder="ejemplo@correo.com, otro@correo.com"
              />
            </div>

            <div>
              <h5>Tableros actuales:</h5>
              {boards && boards.length > 0 ? (
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
              disabled={!boardName}
            >
              {editingBoard ? 'Guardar Cambios' : 'Crear Tablero'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardModal;

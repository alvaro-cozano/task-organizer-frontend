import React, { useEffect, useState } from 'react';
import { useBoardStore } from '../../../../hooks/useBoardStore';
import Swal from 'sweetalert2';
import { BoardDTO } from '../../types/BoardDTO';
import { useAuthStore } from '../../../../hooks';

interface BoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardToEdit: BoardDTO | null;
  boards: BoardDTO[] | undefined;
  isEditMode?: boolean;
  currentUserEmail: string; // Recibimos el email del usuario actual
}

const BoardModal: React.FC<BoardModalProps> = ({ isOpen, onClose, boardToEdit, boards = [], currentUserEmail }) => {
  const { startSavingBoard, startDeletingBoard } = useBoardStore();
  const { user } = useAuthStore();
  const currentUsername = user?.username || ''; // Obtenemos el nombre de usuario actual

  const [boardName, setBoardName] = useState('');
  const [users, setUsers] = useState<{ email: string }[]>([]); // Para manejar los usuarios
  const [editingBoard, setEditingBoard] = useState<BoardDTO | null>(null);

  useEffect(() => {
    if (boardToEdit) {
      setEditingBoard(boardToEdit);
      setBoardName(boardToEdit.boardName);
      setUsers(boardToEdit.users || [{ email: currentUserEmail }]); // Garantizamos que siempre haya un email
    } else {
      // Añadimos al usuario actual automáticamente si estamos creando un nuevo tablero
      setUsers([{ email: currentUserEmail }]);
      resetForm();
    }
  }, [boardToEdit, currentUserEmail]);

  const handleSave = async () => {
    const board: BoardDTO = {
      id: editingBoard?.id || 0,
      boardName,
      users,
    };

    try {
      await startSavingBoard(board); // Guardar tablero
      resetModal(); // Resetear el modal después de guardar
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Ya existe un tablero con el mismo nombre';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
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
      resetForm(); // Si estamos editando el mismo tablero, resetear
    } else {
      setEditingBoard(board);
      setBoardName(board.boardName);
      setUsers(board.users || []); // Cargar usuarios del tablero
    }
  };

  const resetForm = () => {
    setEditingBoard(null);
    setBoardName('');
    setUsers([{ email: currentUserEmail }]); // Reseteamos el estado, siempre manteniendo al usuario actual
  };

  const resetModal = () => {
    resetForm();
    onClose(); // Cerrar modal después de resetear
  };

  // Funciones para manejar los usuarios
  const handleEmailChange = (index: number, value: string) => {
    const updatedUsers = [...users];
    updatedUsers[index].email = value;
    setUsers(updatedUsers);
  };

  const handleAddUser = () => {
    setUsers([...users, { email: '' }]); // Añadir usuario con email vacío
  };

  const handleRemoveUser = (index: number) => {
    const userToRemove = users[index];
    if (userToRemove.email !== currentUserEmail) {
      const updatedUsers = users.filter((_, i) => i !== index);
      setUsers(updatedUsers);
    }
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
              <label className="form-label">Correos de los usuarios:</label>
              {users.map((user, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <input
                    type="email"
                    className="form-control"
                    value={user.email || ''} // Aseguramos que sea siempre una cadena vacía si no tiene email
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

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={resetModal}>Cancelar</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!boardName.trim()}
              >
                {editingBoard ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardModal;

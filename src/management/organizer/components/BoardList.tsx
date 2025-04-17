import React, { useState } from 'react';
import { useBoardStore } from '../../../hooks/useBoardStore';
import Swal from 'sweetalert2';

interface UserReferenceDTO {
  email: string;
}

interface BoardDTO {
  id: number;
  boardName: string;
  users: UserReferenceDTO[];
}

const BoardList = () => {
  const { boards, setActiveBoard, startDeletingBoard, startSavingBoard } = useBoardStore();
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para abrir el modal
  const [boardToEdit, setBoardToEdit] = useState<BoardDTO | null>(null); // Estado para el tablero a editar

  const handleDelete = async (boardId: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Este tablero será eliminado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      setActiveBoard(null);
      startDeletingBoard(boardId);
      setIsModalOpen(false); // Cerrar el modal después de eliminar
    }
  };

  const handleEdit = (board: BoardDTO) => {
    setBoardToEdit(board); // Asignar el tablero a editar
    setIsModalOpen(true); // Abrir el modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Cerrar el modal
    setBoardToEdit(null); // Resetear el tablero a editar
  };

  return (
    <div>
      <div className="row">
        {boards.map((board) => (
          <div key={board.id} className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{board.boardName}</h5>
                <button
                  className="btn btn-primary"
                  onClick={() => handleEdit(board)}
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para editar/eliminar tablero */}
      {isModalOpen && boardToEdit && (
        <div className="modal fade show" tabIndex={-1} style={{ display: 'block' }} aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Editar Tablero</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  value={boardToEdit.boardName}
                  onChange={(e) => setBoardToEdit({ ...boardToEdit, boardName: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cerrar
                </button>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(boardToEdit.id)}>
                  Eliminar
                </button>
                <button type="button" className="btn btn-primary" onClick={() => startSavingBoard(boardToEdit)}>
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardList;

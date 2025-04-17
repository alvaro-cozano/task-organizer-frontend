import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { BoardModal } from '../components/BoardModal';
import { useBoardStore } from '../../../hooks/useBoardStore';

export const OrganizerPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Estado para saber si estamos en modo de edición
  const { boards, activeBoard, setActiveBoard, startLoadingBoards } = useBoardStore();

  // Abrir modal para crear un nuevo tablero
  const openModal = () => {
    setActiveBoard(null); // Resetea cualquier tablero activo cuando se crea un nuevo tablero
    setIsModalOpen(true); // Abre el modal
  };

  // Cerrar el modal y resetear el tablero activo
  const closeModal = async () => {
    setIsModalOpen(false);
    setActiveBoard(null); // Resetea el tablero activo al cerrar
    await startLoadingBoards(); // Recargar los tableros
  };

  // Activar/desactivar el modo de edición
  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };

  // Cuando se hace click en un tablero, abre el modal y carga la información para editar
  const handleBoardClick = (board: any) => {
    if (isEditMode) {
      setActiveBoard(board); // Selecciona el tablero para editar
      setIsModalOpen(true);   // Abre el modal
    }
  };

  useEffect(() => {
    startLoadingBoards(); // Cargar tableros al iniciar
  }, []);

  return (
    <>
      <Navbar />
      
      <div className="container mt-4">
        <h1>Mis Tableros</h1>

        {/* Botones para crear nuevo tablero y activar el modo de edición */}
        <button className="btn btn-primary mb-3" onClick={openModal}>
          Crear Nuevo Tablero
        </button>
        <button
          className={`btn mb-3 ms-2 ${isEditMode ? 'btn-warning' : 'btn-secondary'}`} // Cambia de color si está en modo de edición
          onClick={toggleEditMode}
        >
          {isEditMode ? 'Modo Edición Activado' : 'Activar Modo Edición'}
        </button>

        {/* Lista de tableros */}
        <div className="board-list row">
          {boards.map((board) => (
            <div key={board.id} className="col-md-4 mb-3" onClick={() => handleBoardClick(board)}>
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{board.boardName}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de creación/edición de tableros */}
        {isModalOpen && (
          <BoardModal isOpen={isModalOpen} onClose={closeModal} />
        )}
      </div>
    </>
  );
};

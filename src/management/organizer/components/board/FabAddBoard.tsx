import { useState } from 'react';
import { useBoardStore } from '../../../../hooks/useBoardStore';
import { BoardModal } from './BoardModal';

export const FabAddBoard = () => {
    const { setActiveBoard } = useBoardStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);  // Estado para el modo de edición

    // Función que abre el modal para crear un nuevo tablero
    const handleClick = () => {
        setActiveBoard({ id: 0, boardName: '', users: [] });  // Configura un nuevo tablero vacío
        setIsOpen(true);
        setIsEditMode(false);  // Asegúrate de que no esté en modo edición al crear un tablero
    };

    return (
        <>
            <button className="btn btn-primary fab" onClick={handleClick}>
                <i className="fas fa-plus" />
            </button>
            <BoardModal isOpen={isOpen} onClose={() => setIsOpen(false)} isEditMode={isEditMode} />
        </>
    );
};

import { useBoardStore } from '../../../hooks/useBoardStore';
import Swal from 'sweetalert2';

export const FabDeleteBoard = () => {
    const { hasBoardSelected, startDeletingBoard } = useBoardStore();

    const handleClick = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el tablero permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
        });

        if (result.isConfirmed) {
            await startDeletingBoard();
        }
    };

    return (
        <button
            className="btn btn-danger fab-danger"
            onClick={handleClick}
            style={{ display: hasBoardSelected ? '' : 'none' }}
        >
            <i className="fas fa-trash-alt" />
        </button>
    );
};

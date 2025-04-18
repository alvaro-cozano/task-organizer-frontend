import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
    onAddNewBoard,
    onDeleteBoard,
    onLoadboards,
    onSetActiveBoard,
    onUpdateBoard,
} from '../store/organizer/boardSlice';
import { springApi } from '../api';
import Swal from 'sweetalert2';

export interface UserReferenceDTO {
    email: string;
}

export interface BoardDTO {
    id: number;
    boardName: string;
    users: UserReferenceDTO[];
}

export interface CreateBoardDTO {
    boardName: string;
    users: UserReferenceDTO[]; // Lista de usuarios, si lo necesitas
}

export const useBoardStore = () => {
    const dispatch = useDispatch();

    const { boards, activeBoard, isLoadingBoards } = useSelector(
        (state: RootState) => state.board
    );

    const setActiveBoard = (board: BoardDTO | null) => {
        dispatch(onSetActiveBoard(board));
    };

    const startSavingBoard = async (board: BoardDTO | CreateBoardDTO) => {
        try {
            // Verificar si el board tiene un id y si es un número válido
            if ('id' in board && board.id !== undefined && board.id !== null && board.id !== 0) {
                // Actualización de tablero (si tiene id)
                await springApi.put(`/boards/${board.id}`, board);
                dispatch(onUpdateBoard(board));
            } else {
                // Limpiar cualquier propiedad 'id' antes de hacer la creación
                const createBoardData: CreateBoardDTO = {
                    boardName: board.boardName,
                    users: board.users,
                };

                // Crear un nuevo tablero (POST) sin id
                const { data } = await springApi.post('/boards', createBoardData);
                dispatch(onAddNewBoard(data));
            }

            // Recargar los tableros después de la operación
            await startLoadingBoards();
        } catch (error: any) {
            console.error(error);
            Swal.fire('Error al guardar', error.response?.data?.msg || 'Error desconocido', 'error');
        }
    };

    const startDeletingBoard = async (boardId: number) => {
        try {
            await springApi.delete(`/boards/${boardId}`);
            dispatch(onDeleteBoard());
            await startLoadingBoards();
        } catch (error: any) {
            console.error(error);
            Swal.fire('Error al eliminar', error.response?.data?.msg || 'Error desconocido', 'error');
        }
    };
    

    const startLoadingBoards = async () => {
        try {
            const { data } = await springApi.get('/boards/my-boards');
            dispatch(onLoadboards(data));
        } catch (error) {
            console.error('Error al cargar tableros', error);
        }
    };

    return {
        // Propiedades
        boards,
        activeBoard,
        isLoadingBoards,
        hasBoardSelected: !!activeBoard,

        // Métodos
        setActiveBoard,
        startSavingBoard,
        startDeletingBoard,
        startLoadingBoards,
    };
};

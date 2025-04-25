import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import { springApi } from '../api';
import { BoardDTO } from '../management';
import {
    RootState,
    onAddNewBoard,
    onDeleteBoard,
    onLoadboards,
    onSetActiveBoard,
    onUpdateBoard,
} from '../store';

export interface CreateBoardDTO {
    boardName: string;
    users: { email: string }[];
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
            if ('id' in board && board.id !== undefined && board.id !== null && board.id !== 0) {
                await springApi.put(`/boards/${board.id}`, board);
                dispatch(onUpdateBoard(board));
            } else {
                const createBoardData: CreateBoardDTO = {
                    boardName: board.boardName,
                    users: board.users,
                };

                const { data } = await springApi.post('/boards', createBoardData);
                dispatch(onAddNewBoard(data));
            }

            await startLoadingBoards();
        } catch (error) {
            throw error;
        }
    };

    const startDeletingBoard = async (boardId: number) => {
        try {
            await springApi.delete(`/boards/${boardId}`);
            dispatch(onDeleteBoard(boardId));
            await startLoadingBoards();
        } catch (error: any) {
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

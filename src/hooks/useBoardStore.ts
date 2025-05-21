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
                const existingBoard = boards.find(b => b.id === board.id);
                const updatedBoard: BoardDTO = {
                    ...existingBoard,
                    ...board,
                    userBoardReference: existingBoard?.userBoardReference || {
                        posX: 0,
                        posY: 0,
                        isAdmin: false,
                    },
                };

                await springApi.put(`/boards/${board.id}`, updatedBoard);
                dispatch(onUpdateBoard(updatedBoard));
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
        }
    };

    const startLeavingBoard = async (boardId: number) => {
        try {
            await springApi.post(`/boards/${boardId}/leave`);
            dispatch(onDeleteBoard(boardId));
            Swal.fire('Has salido del tablero correctamente', '', 'success');
            await startLoadingBoards();
        } catch (error: any) {
            Swal.fire('Error al salir del tablero', error.response?.data?.error || 'Error desconocido', 'error');
        }
    };

    const startTransferringAdmin = async (boardId: number, newAdminEmail: string) => {
        try {
            await springApi.put(`/boards/${boardId}/transfer-admin/${encodeURIComponent(newAdminEmail)}`);
            Swal.fire('Transferencia de administración exitosa', '', 'success');
            await startLoadingBoards();
        } catch (error: any) {
            if (error.response?.status === 404) {
            Swal.fire('Error', 'No se pudo realizar la transferencia.', 'error');
            } else {
            Swal.fire('Error', 'Hubo un problema al intentar transferir la administración. Intenta nuevamente.', 'error');
            }
            throw error;
        }
    };

    return {
        boards,
        activeBoard,
        isLoadingBoards,
        hasBoardSelected: !!activeBoard,

        setActiveBoard,
        startSavingBoard,
        startDeletingBoard,
        startLoadingBoards,
        startLeavingBoard,
        startTransferringAdmin,
    };
};

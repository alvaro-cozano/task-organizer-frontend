import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserReferenceDTO {
    email: string;
}

export interface BoardDTO {
    id: number;
    boardName: string;
    users: UserReferenceDTO[];
}

interface BoardState {
    isLoadingBoards: boolean;
    boards: BoardDTO[];
    activeBoard: BoardDTO | null;
}

const initialState: BoardState = {
    isLoadingBoards: true,
    boards: [],
    activeBoard: null,
};

export const boardSlice = createSlice({
    name: 'board',
    initialState,
    reducers: {
        onSetActiveBoard: (state, action: PayloadAction<BoardDTO | null>) => {
            state.activeBoard = action.payload;
        },
        onAddNewBoard: (state, action: PayloadAction<BoardDTO>) => {
            state.boards.push(action.payload);
            state.activeBoard = null;
        },
        onUpdateBoard: (state, action: PayloadAction<BoardDTO>) => {
            state.boards = state.boards.map(board =>
                board.id === action.payload.id ? action.payload : board
            );
        },
        onDeleteBoard: (state) => {
            if (state.activeBoard) {
                state.boards = state.boards.filter(board => board.id !== state.activeBoard!.id);
                state.activeBoard = null;
            }
        },
        onLoadboards: (state, action: PayloadAction<BoardDTO[]>) => {
            state.isLoadingBoards = false;
            action.payload.forEach(board => {
                const exists = state.boards.some(dbBoard => dbBoard.id === board.id);
                if (!exists) {
                    state.boards.push(board);
                }
            });
        },
        onLogoutBoards: (state) => {
            state.isLoadingBoards = true;
            state.boards = [];
            state.activeBoard = null;
        },
    },
});

export const {
    onSetActiveBoard,
    onAddNewBoard,
    onUpdateBoard,
    onDeleteBoard,
    onLoadboards,
    onLogoutBoards,
} = boardSlice.actions;

export default boardSlice;
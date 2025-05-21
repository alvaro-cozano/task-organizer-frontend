import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {BoardDTO} from '../../management';

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
        onDeleteBoard: (state, action: PayloadAction<number>) => {
            state.boards = state.boards.filter(board => board.id !== action.payload);
            if (state.activeBoard && state.activeBoard.id === action.payload) {
                state.activeBoard = null;
            }
        },
        onLoadboards: (state, action: PayloadAction<BoardDTO[]>) => {
            state.isLoadingBoards = false;
            state.boards = action.payload;
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
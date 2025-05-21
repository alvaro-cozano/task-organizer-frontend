import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { UserBoardDTO } from '../../management';

interface UserBoardState {
  userBoards: UserBoardDTO[];
}

const initialState: UserBoardState = {
  userBoards: [],
};

export const userBoardSlice = createSlice({
  name: 'userBoard',
  initialState,
  reducers: {
    onUpdateUserBoardPosition: (state, action: PayloadAction<UserBoardDTO>) => {
      const { user_id, board_id, posX, posY } = action.payload;
      const index = state.userBoards.findIndex(
        (userBoard) => userBoard.user_id === user_id && userBoard.board_id === board_id
      );
      if (index !== -1) {
        state.userBoards[index] = { ...state.userBoards[index], posX, posY };
      }
    },

    onLoadUserBoards: (state, action: PayloadAction<UserBoardDTO[]>) => {
      state.userBoards = action.payload;
    },
  },
});

export const { 
    onUpdateUserBoardPosition, 
    onLoadUserBoards 
} = userBoardSlice.actions;

export default userBoardSlice;

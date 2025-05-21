import { useDispatch, useSelector } from 'react-redux';

import { springApi } from '../api';
import { RootState, onUpdateUserBoardPosition } from '../store';
import { UserBoardDTO } from '../management';

export const useUserBoardStore = () => {
  const dispatch = useDispatch();
  const { userBoards } = useSelector((state: RootState) => state.userBoard);

  const startUpdatingUserBoardPosition = async (userBoardData: UserBoardDTO | UserBoardDTO[]) => {
    const dataToSend = Array.isArray(userBoardData) ? userBoardData : [userBoardData];

    try {
      await springApi.patch('/user-board/position', dataToSend);
      dataToSend.forEach(userBoard => {
        dispatch(onUpdateUserBoardPosition(userBoard));
      });
    } catch (error: any) {
      
    }
  };

  return {
    userBoards,
    startUpdatingUserBoardPosition,
  };
};

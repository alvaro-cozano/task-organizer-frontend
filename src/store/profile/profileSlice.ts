import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfileDTO } from '../../management';

interface ProfileState {
  profile: UserProfileDTO | null;
  isLoading: boolean;
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    onLoadProfile: (state, action: PayloadAction<UserProfileDTO>) => {
      state.profile = action.payload;
    },
    onUpdateProfile: (state, action: PayloadAction<UserProfileDTO>) => {
      state.profile = action.payload;
    },
    onStartLoadingProfile: (state) => {
      state.isLoading = true;
    },
    onEndLoadingProfile: (state) => {
      state.isLoading = false;
    },
  },
});

export const {
  onLoadProfile,
  onUpdateProfile,
  onStartLoadingProfile,
  onEndLoadingProfile,
} = profileSlice.actions;

export default profileSlice;

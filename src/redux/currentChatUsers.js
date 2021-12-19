import { createSlice } from '@reduxjs/toolkit';

const initialState = { value: [] };

export const currentChatUsersSlice = createSlice({
    name: 'currentChatUsers',
    initialState,
    reducers: {
        setCurrentChatUsers: (state, action) => {
            state.value = action.payload;
        }
    }
});

export const { setCurrentChatUsers } = currentChatUsersSlice.actions;

export default currentChatUsersSlice.reducer;

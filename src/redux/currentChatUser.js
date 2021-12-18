import { createSlice } from '@reduxjs/toolkit';

const initialState = { value: null };

export const currentChatUserSlice = createSlice({
    name: 'currentChatUser',
    initialState,
    reducers: {
        setCurrentChatUser: (state, action) => {
            state.value = action.payload;
        }
    }
});

export const { setCurrentChatUser } = currentChatUserSlice.actions;

export default currentChatUserSlice.reducer;

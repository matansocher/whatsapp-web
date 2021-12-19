import { createSlice } from '@reduxjs/toolkit';

const initialState = { value: null };

export const currentChatSlice = createSlice({
    name: 'currentChat',
    initialState,
    reducers: {
        setCurrentChat: (state, action) => {
            state.value = action.payload;
        }
    }
});

export const { setCurrentChat } = currentChatSlice.actions;

export default currentChatSlice.reducer;

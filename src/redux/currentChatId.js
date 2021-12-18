import { createSlice } from '@reduxjs/toolkit';

const initialState = { value: null };

export const currentChatIdSlice = createSlice({
    name: 'currentChatId',
    initialState,
    reducers: {
        setCurrentChatId: (state, action) => {
            state.value = action.payload;
        }
    }
});

export const { setCurrentChatId } = currentChatIdSlice.actions;

export default currentChatIdSlice.reducer;

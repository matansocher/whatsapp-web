import { createSlice } from '@reduxjs/toolkit';

const initialState = { value: null };

export const currentReplyMessageSlice = createSlice({
    name: 'currentReplyMessage',
    initialState,
    reducers: {
        setCurrentReplyMessage: (state, action) => {
            state.value = action.payload;
        }
    }
});

export const { setCurrentReplyMessage } = currentReplyMessageSlice.actions;

export default currentReplyMessageSlice.reducer;

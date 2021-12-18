import { createSlice } from '@reduxjs/toolkit';

const initialState = { value: [] };

export const starredMessagesIdsSlice = createSlice({
    name: 'starredMessagesIds',
    initialState,
    reducers: {
        setStarredMessagesIds: (state, action) => {
            state.value = action.payload;
        }
    }
});

export const { setStarredMessagesIds } = starredMessagesIdsSlice.actions;

export default starredMessagesIdsSlice.reducer;

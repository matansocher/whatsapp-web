import { createSlice } from '@reduxjs/toolkit';

const initialState = { value: null };

export const authUserDetailsSlice = createSlice({
    name: 'authUserDetails',
    initialState,
    reducers: {
        setAuthUserDetails: (state, action) => {
            state.value = action.payload;
        }
    }
});

export const { setAuthUserDetails } = authUserDetailsSlice.actions;

export default authUserDetailsSlice.reducer;

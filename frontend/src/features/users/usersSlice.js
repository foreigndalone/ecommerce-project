import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: null, //{ id, email, name, role, avatar }
    token: null,

    isLoading: false,
    hasError: false,
    errorMessage: null
}

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {}
})


export default usersSlice.reducer

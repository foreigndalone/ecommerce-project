import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";

const loginThunk = createAsyncThunk('/users/login', async()=>{
    // const result = await 
})

const initialState = {
    currentUser: null, //{ id, email, name, role, avatar }
    token: null,

    favorites: [],
    cart: [],
    shippingAdress: [],

    isLoading: false,
    hasError: false,
    errorMessage: null
}

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        
    },
    extraReducers(builder){

    }
})
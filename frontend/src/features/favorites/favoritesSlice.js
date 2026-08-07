import { createSelector, createSlice } from '@reduxjs/toolkit'

const initialState = {
    items: [],
    status: 'idle',
    error: null,
}

const getFavoriteId = (favorite) =>
    favorite && typeof favorite === 'object' ? favorite.id : favorite

const isSameFavorite = (favorite, candidate) => {
    const favoriteId = getFavoriteId(favorite)
    const candidateId = getFavoriteId(candidate)

    if (favoriteId !== undefined && candidateId !== undefined) {
        return favoriteId === candidateId
    }

    return favorite === candidate
}

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        addFavorite: (state, action) => {
            const exists = state.items.some((item) =>
                isSameFavorite(item, action.payload)
            )

            if (!exists) {
                state.items.push(action.payload)
            }
        },
        removeFavorite: (state, action) => {
            state.items = state.items.filter((item) =>
                !isSameFavorite(item, action.payload)
            )
        },
        toggleFavorite: (state, action) => {
            const existingIndex = state.items.findIndex((item) =>
                isSameFavorite(item, action.payload)
            )

            if (existingIndex >= 0) {
                state.items.splice(existingIndex, 1)
            } else {
                state.items.push(action.payload)
            }
        },
        clearFavorites: (state) => {
            state.items = []
        },
    },
})

const selectFavoritesState = (state) => state.favoritesReducer

export const selectAllFavorites = (state) => selectFavoritesState(state).items

export const selectIsFavorite = (state, favorite) =>
    selectAllFavorites(state).some((item) => isSameFavorite(item, favorite))

export const selectFavoritesCount = createSelector(
    [selectFavoritesState],
    (favoritesState) => favoritesState.items.length
)

export const {
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
} = favoritesSlice.actions

export default favoritesSlice.reducer

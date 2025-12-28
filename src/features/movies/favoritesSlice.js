import { createSlice } from "@reduxjs/toolkit";

const loadFavoritesFromStorage = () => {
  try {
    const favorites = localStorage.getItem("movieFavorites");
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error("Error loading favorites from localStorage:", error);
    return [];
  }
};

const saveFavoritesToStorage = (favorites) => {
  try {
    localStorage.setItem("movieFavorites", JSON.stringify(favorites));
  } catch (error) {
    console.error("Error saving favorites to localStorage:", error);
  }
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    favorites: loadFavoritesFromStorage(),
  },
  reducers: {
    addToFavorites: (state, action) => {
      const movie = action.payload;
      if (!state.favorites.find((fav) => fav.imdbID === movie.imdbID)) {
        state.favorites.push(movie);
        saveFavoritesToStorage(state.favorites);
      }
    },
    removeFromFavorites: (state, action) => {
      const imdbID = action.payload;
      state.favorites = state.favorites.filter((fav) => fav.imdbID !== imdbID);
      saveFavoritesToStorage(state.favorites);
    },
    toggleFavorite: (state, action) => {
      const movie = action.payload;
      const existingIndex = state.favorites.findIndex(
        (fav) => fav.imdbID === movie.imdbID
      );
      if (existingIndex >= 0) {
        state.favorites.splice(existingIndex, 1);
      } else {
        state.favorites.push(movie);
      }
      saveFavoritesToStorage(state.favorites);
    },
  },
});

export const { addToFavorites, removeFromFavorites, toggleFavorite } =
  favoritesSlice.actions;
export default favoritesSlice.reducer;

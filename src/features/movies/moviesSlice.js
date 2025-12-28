import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getMovies, getMovieDetails } from "./moviesAPI";

export const fetchMovies = createAsyncThunk(
  "movies/fetchMovies",
  async ({ search, page = 1 }) => {
    return await getMovies(search, page);
  }
);

export const fetchMovieDetails = createAsyncThunk(
  "movies/fetchMovieDetails",
  async (imdbID) => {
    return await getMovieDetails(imdbID);
  }
);

const moviesSlice = createSlice({
  name: "movies",
  initialState: {
    movies: [],
    loading: false,
    error: null,
    search: "",
    currentPage: 1,
    totalResults: 0,
    totalPages: 0,
    selectedMovie: null,
    isModalOpen: false,
    movieDetails: null,
    detailsLoading: false,
    detailsError: null,
  },
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
      state.currentPage = 1; // Reset to first page on new search
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    openModal: (state, action) => {
      state.selectedMovie = action.payload;
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.selectedMovie = null;
      state.movieDetails = null;
      state.detailsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = action.payload.Search || [];
        state.totalResults = parseInt(action.payload.totalResults) || 0;
        state.totalPages = Math.ceil(state.totalResults / 15);
        state.error = null;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.movies = [];
        state.totalResults = 0;
        state.totalPages = 0;
      })
      .addCase(fetchMovieDetails.pending, (state) => {
        state.detailsLoading = true;
      })
      .addCase(fetchMovieDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.movieDetails = action.payload;
        state.detailsError = null;
      })
      .addCase(fetchMovieDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError = action.error.message;
      });
  },
});

export const { setSearch, setPage, openModal, closeModal } = moviesSlice.actions;
export default moviesSlice.reducer;

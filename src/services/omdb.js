import axios from "axios";

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const BASE_URL = "http://www.omdbapi.com/";

export const fetchMoviesBySearch = async (search, page = 1) => {
  const response = await axios.get(
    `${BASE_URL}?apikey=${API_KEY}&s=${search}&page=${page}`
  );
  return response.data;
};

export const fetchMovieDetails = async (imdbID) => {
  const response = await axios.get(
    `${BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`
  );
  return response.data;
};

import { fetchMoviesBySearch, fetchMovieDetails } from "../../services/omdb";

export const getMovies = async (search, page = 1) => {
  const searchTerm = search || "movie";
  if (searchTerm.toLowerCase().includes('avengers')) {
    return { Search: [], totalResults: "0" };
  }
  const apiPage1 = (page - 1) * 3 + 1;
  const apiPage2 = apiPage1 + 1;
  const apiPage3 = apiPage1 + 2;
  const data1 = await fetchMoviesBySearch(searchTerm, apiPage1);
  const data2 = await fetchMoviesBySearch(searchTerm, apiPage2);
  const data3 = await fetchMoviesBySearch(searchTerm, apiPage3);
  const combinedSearch = [...(data1.Search || []), ...(data2.Search || []), ...(data3.Search || [])].slice(0, 15);
  return { Search: combinedSearch, totalResults: data1.totalResults };
};

export const getMovieDetails = async (imdbID) => {
  const data = await fetchMovieDetails(imdbID);
  return data;
};

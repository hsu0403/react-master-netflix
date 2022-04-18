const API_KEY = "b14477451d744541dcb5d32218303277";
const BASE_PATH = "https://api.themoviedb.org/3";

interface IMovie {
  id: number;
  backdrop_path: string;
  poster_path: string;
  title: string;
  overview: string;
  adult: boolean;
  vote_average: number;
  release_date: string;
  original_language: string;
}

export interface IGetMoviesResult {
  dates: {
    maximum: string;
    minimum: string;
  };
  page: number;
  results: IMovie[];
  total_pages: number;
  total_results: number;
}

interface ITvShow {
  poster_path: string;
  id: number;
  backdrop_path: string;
  overview: string;
  name: string;
  first_air_date: string;
  vote_average: number;
  origin_country: [];
  original_language: string;
}

export interface IGetTvShowResult {
  page: number;
  results: ITvShow[];
  total_results: number;
  total_pages: number;
}

export function getMovies() {
  return fetch(`${BASE_PATH}/movie/now_playing?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getPopularMovies() {
  return fetch(`${BASE_PATH}/movie/popular?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getSimilarMovies(movieId: number) {
  return fetch(`${BASE_PATH}/movie/${movieId}/similar?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getTvShows() {
  return fetch(`${BASE_PATH}/tv/on_the_air?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getTopRatedTv() {
  return fetch(`${BASE_PATH}/tv/top_rated?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getSimilarTvShows(tvId: number) {
  return fetch(`${BASE_PATH}/tv/${tvId}/similar?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getSearch(keyword: string) {
  return fetch(
    `${BASE_PATH}/search/multi?api_key=${API_KEY}&query=${keyword}&include_adult=false`
  ).then((response) => response.json());
}
